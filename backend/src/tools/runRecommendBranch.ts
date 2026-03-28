import { prisma } from "../../lib/prisma";
import { MachineType } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

const AVG_CYCLE_MIN: Record<MachineType, number> = {
    [MachineType.WASHER]: 45, // ซัก 45 นาที
    [MachineType.DRYER]: 60,  // อบ 60 นาที
};

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

    const avgCycleMin = AVG_CYCLE_MIN[machineType] ?? 45;

    // ดึง Branch  Machine  Queue ที่ยังไม่เสร็จ
    const branches = await prisma.branch.findMany({
        where: {
            lat_branch: { not: null },
            lng_branch: { not: null },
            machine: { some: { type: machineType, capacity } },
        },
        include: {
            machine: {
                where: { type: machineType, capacity },
                include: {
                    queues: { where: { finished_at: null } },
                },
            },
        },
    });

    // แปลงข้อมูลเป็น payload ส่งให้ Gemini
    const branchData = branches.map((b) => {
        const distanceKm = getDistanceKm(
            userLat, userLng,
            b.lat_branch!, b.lng_branch!
        );

        return {
            branch_id: b.branch_id,
            branch_name: b.branch_name,
            distanceKm: Math.round(distanceKm * 100) / 100,
            travelMinutes: Math.round(distanceKm * 3),
            machines: {
                total: b.machine.length,
                available: b.machine.filter((m) => m.status === "AVAILABLE").length,
                queueAhead: b.machine.reduce((sum, m) => sum + m.queues.length, 0),
                avgCycleMin,
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