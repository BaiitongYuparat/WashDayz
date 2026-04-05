import { prisma } from "../../lib/prisma";
import { MachineType } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });



function getDistanceKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const SYSTEM_PROMPT = `
คุณคือ AI ผู้ช่วยเลือกสาขาร้านซักผ้าหยอดเหรียญ

## สูตรคำนวณ
totalTime = travelMinutes + waitTime
waitTime = queueAhead × avgCycleMin (ถ้ามีเครื่องว่าง → waitTime = 0)

## กฎ
- ถ้าไม่มีเครื่องขนาดที่ต้องการ → ตัดออก
- ถ้าทุกสาขาไม่มีเครื่องว่าง → เลือกรอน้อยสุด
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
`.trim();

interface RecommendInput {
    userLat: number;
    userLng: number;
    machineType?: MachineType;
    capacity?: number;
}

export async function runRecommendBranch(input: RecommendInput) {
    const {
        userLat,
        userLng,
        machineType = MachineType.WASHER,
        capacity = 10,
    } = input;

    // ดึง branchMachine  Machine  Queue ที่ยังไม่เสร็จ
    const branches = await prisma.branch.findMany({
        where: {
            branchMachines: {
                some: {
                    machine: { type: machineType, capacity }
                }
            }
        },
        include: {
            branchMachines: {
                where: { machine: { type: machineType, capacity } },
                include: {
                    machine: true,
                    queues: { where: { finished_at: null } },
                },
            },
        },
    })

    // แปลงข้อมูลเป็น payload ส่งให้ Gemini
    const branchData = branches.map((b) => {
        const distanceKm = getDistanceKm(userLat, userLng, b.lat_branch!, b.lng_branch!);
        const machines = b.branchMachines;

        // ดึง duration_minutes จาก machine จริง (fallback 45 ถ้าไม่มี)
        const avgCycleMin = machines[0]?.machine.duration_minutes ?? 45;

        return {
            branch_id: b.branch_id,
            branch_name: b.branch_name,
            distanceKm: Math.round(distanceKm * 100) / 100,
            travelMinutes: Math.round(distanceKm * 3),
            machines: {
                total: machines.length,
                available: machines.filter((bm) => bm.queues.length === 0).length,
                queueAhead: machines.reduce((sum, bm) => sum + bm.queues.length, 0),
                avgCycleMin, // ← มาจาก DB แล้ว
            },
        };
    });

    // ส่งให้ Gemini คำนวณและแนะนำ
    const prompt = `
${SYSTEM_PROMPT}

ลูกค้าต้องการ: ${machineType} ขนาด ${capacity}kg
ข้อมูลสาขา:
${JSON.stringify(branchData, null, 2)}
  `.trim();

    const res = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
    });

    const text = res.response.text();

    //  parse JSON
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error("Gemini ไม่คืน JSON: " + text);
    }
}