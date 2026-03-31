import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

interface BranchScore {
    branch_id: string;
    branch_name: string;
    distanceKm: number;
    travelMinutes: number;
    totalMachines: number;
    availableMachines: number;
    totalQueueAhead: number;
    waitMinutes: number;
    totalExpectedMinutes: number;
    machineAvailable: boolean;
}

export async function summarizeBranches(
    scored: BranchScore[],
    machineType: string,
    capacity: number
): Promise<string> {
    const prompt = `
คุณคือ AI ผู้ช่วยร้านซักผ้า สรุปผลการเลือกสาขาให้ลูกค้าเข้าใจง่าย

ลูกค้าต้องการ: เครื่อง${machineType === "WASHER" ? "ซัก" : "อบ"} ขนาด ${capacity}kg
ผลการคำนวณ (เรียงจากดีที่สุด):
${JSON.stringify(scored, null, 2)}

กฎ:
- สรุปสั้นๆ ว่าสาขาไหนแนะนำที่สุดและทำไม
- บอกระยะทาง เวลาเดินทาง และเวลารอ
- ถ้ามีเครื่องว่างให้บอก ถ้าไม่มีให้บอกว่าต้องรอกี่นาที
- ตอบเป็นภาษาไทย กระชับ เป็นมิตร
  `.trim();

    const res = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return res.response.text();
}