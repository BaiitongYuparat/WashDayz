import { prisma } from "../../lib/prisma"
import { MachineType } from "@prisma/client"
import { GoogleGenerativeAI } from "@google/generative-ai"
import "dotenv/config"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })


//คำนวณระยะทาง
function getDistanceKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const SYSTEM_PROMPT = `
คุณคือ AI ผู้ช่วยเลือกสาขาร้านซักผ้าหยอดเหรียญ

## สูตรคำนวณ
- totalTime = travelMinutes + waitTime
- waitTime = ถ้ามีเครื่องว่าง → 0, ถ้าไม่มี → min(waitTimePerMachine) ของทุกเครื่องในสาขา
- waitTimePerMachine = จำนวนคิวที่รออยู่ในเครื่องนั้น × avgCycleMin

## กฎ
- ถ้าไม่มีเครื่องขนาดที่ต้องการ → ตัดออก
- ถ้าทุกสาขาไม่มีเครื่องว่าง → เลือกสาขาที่ waitTime น้อยสุด
- ดู waitTimePerMachine ของแต่ละเครื่อง แล้วเลือกเครื่องที่รอน้อยสุด
- ตอบ JSON เท่านั้น ห้ามมี text อื่น

## FORMAT
{
  "recommendedBranchId": "...",
  "recommendedBranchName": "...",
  "totalExpectedMinutes": 0,
  "waitMinutes": 0,
  "travelMinutes": 0,
  "machineAvailable": true,
  "reasoning": "...",
  "allBranchesScored": [
    {
      "branch_id": "...",
      "branch_name": "...",
      "travelMinutes": 0,
      "waitMinutes": 0,
      "totalExpectedMinutes": 0,
      "machineAvailable": true
    }
  ]
}
`.trim()

interface RecommendInput {
    userLat: number
    userLng: number
    machineType?: MachineType
    capacity?: number
    mainServiceId?: string
}

export async function runRecommendBranch(input: RecommendInput) {
    const {
        userLat,
        userLng,
        machineType = MachineType.WASHER,
        capacity = 10,
        mainServiceId,
    } = input

    const branches = await prisma.branch.findMany({
        where: {
            branchMachines: {
                some: {
                    machine: {
                        type: machineType,
                        capacity,
                        mainServices: mainServiceId
                            ? { some: { main_service_id: mainServiceId } }
                            : undefined,
                    }
                },
            },
        },
        include: {
            branchMachines: {
                where: {
                    machine: { type: machineType, capacity },
                },
                include: {
                    machine: true,
                    queues: {
                        where: {
                            finished_at: null,
                            branch_machine_id: { not: null }
                        },
                        // เพื่อให้รู้ว่าแต่ละเครื่องมีคิวอะไรรออยู่บ้าง
                        select: {
                            queue_id: true,
                            queue_number: true,
                            created_at: true,
                            machine_type: true,
                        }
                    },
                },
            },
        },
    })

    const branchData = branches.map((b) => {
        const distanceKm = getDistanceKm(userLat, userLng, b.lat_branch!, b.lng_branch!)
        const machines = b.branchMachines
        const avgCycleMin = machines[0]?.machine.duration_minutes ?? 45

        // machinesDetail คำนวณ waitTime ของแต่ละเครื่องแยกกัน
        // queueCount  คิวที่รออยู่ในเครื่องนี้
        // waitTimeMinutes queueCount × avgCycleMin (รอนานแค่ไหน)
        const machinesDetail = machines.map((bm) => {
            const queueCount = bm.queues.length
            const waitTime = queueCount * avgCycleMin
            return {
                branch_machine_id: bm.branch_machine_id,
                status: bm.status,
                queueCount,
                waitTimeMinutes: waitTime,
                avgCycleMin,
            }
        })

        //bestMachine หาเครื่องที่รอน้อยสุดในสาขานี้
        const bestMachine = machinesDetail.reduce((min, bm) =>
            bm.waitTimeMinutes < min.waitTimeMinutes ? bm : min
        , machinesDetail[0])

        const hasAvailable = machinesDetail.some(bm => bm.status === "AVAILABLE")

        return {
            branch_id: b.branch_id,
            branch_name: b.branch_name,
            distanceKm: Math.round(distanceKm * 100) / 100,
            travelMinutes: Math.round(distanceKm * 3),
            machines: {
                total: machines.length,
                available: machinesDetail.filter(bm => bm.status === "AVAILABLE").length,
                avgCycleMin,
                // detailส่งรายละเอียดทุกเครื่องให้ AI เห็นว่าแต่ละเครื่องรอนานแค่ไหน
                detail: machinesDetail,
                // ถ้ามีเครื่องว่าง = 0, ถ้าไม่มี = เครื่องที่รอน้อยสุด
                bestWaitMinutes: hasAvailable
                    ? 0
                    : bestMachine?.waitTimeMinutes ?? 0
            },
        }
    })

    const prompt = `
${SYSTEM_PROMPT}
ลูกค้าต้องการ: ${machineType} ขนาด ${capacity}kg
ข้อมูลสาขา:
${JSON.stringify(branchData, null, 2)}
    `.trim()

    const res = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
    })

    const text = res.response.text()

    try {
        return JSON.parse(text)
    } catch {
        const match = text.match(/\{[\s\S]*\}/)
        if (match) return JSON.parse(match[0])
        throw new Error("Gemini ไม่คืน JSON: " + text)
    }
}