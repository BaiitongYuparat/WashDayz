import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// INIT GEMINI

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

// TYPES

interface Branch {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  travelMinutes: number;
  machines: {
    [size: string]: {
      total: number;
      available: number;
      queueAhead: number;
      avgCycleMin: number;
    };
  };
}

interface RecommendInput {
  machineSize: string;
  userLat: number;
  userLng: number;
}

//  DATA MOCK

const branchSnapshot: Branch[] = [
  {
    id: "BKK-01",
    name: "สาขาสีลม",
     lat: 13.7243,
    lng: 100.5340,
    distanceKm: 0,
    travelMinutes: 0,
    machines: {
      "5kg": { total: 4, available: 2, queueAhead: 1, avgCycleMin: 35 },
      "10kg": { total: 2, available: 0, queueAhead: 3, avgCycleMin: 55 },
    },
  },
  {
    id: "BKK-02",
    name: "สาขาอโศก",
    lat: 13.7372,
    lng: 100.5601,
    distanceKm: 0,
    travelMinutes: 0,
    machines: {
      "5kg": { total: 6, available: 4, queueAhead: 0, avgCycleMin: 35 },
      "10kg": { total: 3, available: 1, queueAhead: 0, avgCycleMin: 55 },
    },
  },
  {
    id: "BKK-03",
    name: "สาขาพระราม 9",
    lat: 13.7578,
    lng: 100.5655,
    distanceKm: 0,
    travelMinutes: 0,
    machines: {
      "5kg": { total: 4, available: 0, queueAhead: 5, avgCycleMin: 35 },
      "10kg": { total: 4, available: 3, queueAhead: 0, avgCycleMin: 55 },
    },
  },
];

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
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



// PROMPT 

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
  "allBranchesScored": []
}
`.trim();

function buildPrompt(machineSize: string, branches: Branch[]) {
  return `
${SYSTEM_PROMPT}

ลูกค้าต้องการเครื่องขนาด: ${machineSize}

ข้อมูล:
${JSON.stringify(branches, null, 2)}
`;
}

//  MAIN FUNCTION 

async function recommendBranch(input: RecommendInput) {
    const branches = branchSnapshot.map((b) => {
  const distanceKm = getDistanceKm(
    input.userLat,
    input.userLng,
    b.lat,
    b.lng
  );

  return {
    ...b,
    distanceKm,
    travelMinutes: Math.round(distanceKm * 3), // ปรับได้
  };
});
  const prompt = buildPrompt(input.machineSize, branches);

  const res = await model.generateContent({
  contents: [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ],
  generationConfig: {
    responseMimeType: "application/json", // ตัวกัน JSON พัง
  },
});

  const text = res.response.text();
    function extractJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("JSON parse พัง:\n" + text);
  }
}
  let parsed;
  try {
    parsed = extractJSON(text);
  } catch {
    console.error("RAW AI:", text);
    throw new Error("AI ไม่คืน JSON");
  }

  return parsed;
}

//  RUN 

async function main() {
  console.log("🔍 กำลังวิเคราะห์...\n");

  const result = await recommendBranch({
    machineSize: "5kg",
    userLat: 13.7246,
    userLng: 100.5292,
  });

  console.log("✅ แนะนำ:");
  console.log(result);
}

main().catch(console.error);