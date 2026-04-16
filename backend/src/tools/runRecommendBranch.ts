import { prisma } from "../../lib/prisma"
import { MachineType } from "@prisma/client"
import { GoogleGenerativeAI } from "@google/generative-ai"
import "dotenv/config"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
- waitTime = max(bestWaitMinutes ของแต่ละ machineGroup) เพราะใช้เครื่องพร้อมกัน
- bestWaitMinutes = ถ้ามีเครื่องว่าง → 0, ถ้าไม่มี → min(waitTimePerMachine) ของเครื่องในกลุ่มนั้น
- waitTimePerMachine = queueCount × avgCycleMin

## กฎ
- สาขาต้องมีครบทุก machineGroup ที่ลูกค้าต้องการ ถ้าขาดแม้แต่กลุ่มเดียว → ตัดออก
- เลือกสาขาที่ totalTime น้อยสุด
- ถ้า totalTime เท่ากัน → distanceKm น้อยสุด
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

interface MachineTypeInput {
    type: MachineType
    capacity: number
}

interface RecommendInput {
    userLat: number
    userLng: number
    machineTypes: MachineTypeInput[]
    mainServiceId?: string
}

export async function runRecommendBranch(input: RecommendInput) {
    const { userLat, userLng, machineTypes, mainServiceId } = input

    const branches = await prisma.branch.findMany({
        where: {
            AND: machineTypes.map(({ type, capacity }) => ({
                branchMachines: {
                    some: {
                        machine: {
                            type,
                            capacity,
                            ...(mainServiceId ? {
                                mainServices: { some: { main_service_id: mainServiceId } }
                            } : {})
                        }
                    }
                }
            }))
        },
        include: {
            branchMachines: {
                where: {
                    machine: {
                        OR: machineTypes.map(({ type, capacity }) => ({ type, capacity }))
                    }
                },
                include: {
                    machine: true,
                    queues: {
                        where: { finished_at: null, branch_machine_id: { not: null } },
                        select: { queue_id: true, queue_number: true, created_at: true }
                    }
                }
            }
        }
    })

    const branchData = branches.map((b) => {
        const distanceKm = getDistanceKm(userLat, userLng, b.lat_branch!, b.lng_branch!)

        const machineGroups = machineTypes.map(({ type, capacity }) => {
            const machines = b.branchMachines.filter(
                (bm) => bm.machine.type === type && bm.machine.capacity === capacity
            )
            const avgCycleMin = machines[0]?.machine.duration_minutes ?? 45

            const machinesDetail = machines.map((bm) => ({
                branch_machine_id: bm.branch_machine_id,
                status: bm.status,
                queueCount: bm.queues.length,
                waitTimeMinutes: bm.queues.length * avgCycleMin,
                avgCycleMin,
            }))

            const hasAvailable = machinesDetail.some((bm) => bm.status === "AVAILABLE")
            const bestMachine = machinesDetail.reduce(
                (min, bm) => bm.waitTimeMinutes < min.waitTimeMinutes ? bm : min,
                machinesDetail[0]
            )

            return {
                type,
                capacity,
                total: machines.length,
                available: machinesDetail.filter((bm) => bm.status === "AVAILABLE").length,
                avgCycleMin,
                detail: machinesDetail,
                bestWaitMinutes: hasAvailable ? 0 : (bestMachine?.waitTimeMinutes ?? 0),
            }
        })

        const totalWaitMinutes = Math.max(...machineGroups.map((g) => g.bestWaitMinutes))

        return {
            branch_id: b.branch_id,
            branch_name: b.branch_name,
            distanceKm: Math.round(distanceKm * 100) / 100,
            travelMinutes: Math.round(distanceKm * 3),
            machineGroups,
            totalWaitMinutes,
        }
    })

    const prompt = `
${SYSTEM_PROMPT}
ลูกค้าต้องการ: ${machineTypes.map(m => `${m.type} ${m.capacity}kg`).join(" + ")}
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