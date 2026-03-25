import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config"

const client = new Anthropic({
    apiKey: process.env.API_KEY,
})

// ── Types ─────────────────────────────────────────────────────

interface Branch {
    id: string;
    name: string;
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

interface BranchScored {
    id: string;
    name: string;
    totalMinutes: number;
    eligible: boolean;
}


const branchSnapshot = [
    {
        id: "BKK-01",
        name: "สาขาสีลม",
        distanceKm: 1.2,          // คำนวณก่อนส่ง AI (Haversine / Google Maps)
        travelMinutes: 8,
        machines: {
            "5kg": { total: 4, available: 2, queueAhead: 1, avgCycleMin: 35 },
            "10kg": { total: 2, available: 0, queueAhead: 3, avgCycleMin: 55 },
        },
    },
    {
        id: "BKK-02",
        name: "สาขาอโศก",
        distanceKm: 3.8,
        travelMinutes: 18,
        machines: {
            "5kg": { total: 6, available: 4, queueAhead: 0, avgCycleMin: 35 },
            "10kg": { total: 3, available: 1, queueAhead: 0, avgCycleMin: 55 },
        },
    },
    {
        id: "BKK-03",
        name: "สาขาพระราม 9",
        distanceKm: 5.1,
        travelMinutes: 22,
        machines: {
            "5kg": { total: 4, available: 0, queueAhead: 5, avgCycleMin: 35 },
            "10kg": { total: 4, available: 3, queueAhead: 0, avgCycleMin: 55 },
        },
    },
];

// ── 2. SYSTEM PROMPT ─────────────────────────────────────────

/**
 * System prompt สำหรับ laundry branch AI
 *
 * หลักการออกแบบ:
 * - ให้ AI รู้ role ชัดเจน (branch recommendation, ไม่ใช่ general assistant)
 * - ระบุ scoring formula ให้ AI ใช้เป็นกรอบ แต่ยืดหยุ่นได้
 * - บังคับ output format เป็น JSON เพื่อ parse ง่าย
 */
const SYSTEM_PROMPT = `
คุณคือ AI ผู้ช่วยเลือกสาขาร้านซักผ้าหยอดเหรียญ มีหน้าที่เดียว: วิเคราะห์ข้อมูลสาขา
และแนะนำสาขาที่ดีที่สุดสำหรับลูกค้า โดยคำนึงถึงเครื่องซักผ้าขนาดที่ต้องการ

## สูตรคำนวณ "เวลารวมที่คาด" (Total Expected Time)
  totalTime = travelMinutes + waitTime
  waitTime  = queueAhead × avgCycleMin   (ถ้า available > 0 → waitTime = 0)

## น้ำหนักในการตัดสิน (ปรับได้ตาม context)
  - เวลารวมต่ำสุด = สำคัญที่สุด (60%)
  - มีเครื่องว่างเลย = สำคัญมาก (25%)
  - ระยะทางใกล้ = ปัจจัยรอง (15%)

## กฎสำคัญ
  - ถ้าสาขาไม่มีเครื่องขนาดที่ต้องการเลย → ตัดออกจากการพิจารณา
  - ถ้าทุกสาขาไม่มีเครื่องว่าง → เลือกสาขาที่รอน้อยที่สุด
  - ต้องอธิบายเหตุผลเป็นภาษาไทย เข้าใจง่าย ไม่เกิน 2 ประโยค

## Output Format (JSON เท่านั้น ห้ามมี text นอก JSON)
{
  "recommendedBranchId": "BKK-XX",
  "recommendedBranchName": "...",
  "totalExpectedMinutes": 0,
  "waitMinutes": 0,
  "travelMinutes": 0,
  "machineAvailable": true,
  "reasoning": "อธิบายเหตุผล 1-2 ประโยค ภาษาไทย",
  "allBranchesScored": [
    { "id": "BKK-XX", "name": "...", "totalMinutes": 0, "eligible": true }
  ]
}
`.trim();

// ── 3. USER PROMPT BUILDER ───────────────────────────────────

/**
 * สร้าง user prompt จาก input ของลูกค้า
 * แยก user prompt ออกจาก system prompt เพื่อ reuse system ได้
 */
function buildUserPrompt({ machineSize, branches }: { machineSize: string; branches: Branch[] }) {
    return `
ลูกค้าต้องการใช้เครื่องซักผ้าขนาด: ${machineSize}

ข้อมูลสาขา ณ ปัจจุบัน:
${JSON.stringify(branches, null, 2)}

กรุณาวิเคราะห์และแนะนำสาขาที่ดีที่สุด
  `.trim();
}

// ── 4. THINKING CONFIG ───────────────────────────────────────

/**
 * Extended Thinking configuration
 *
 * budget_tokens: จำนวน token สูงสุดที่ให้ AI "คิด" (ไม่นับใน output)
 *
 * แนวทางเลือก budget_tokens:
 *   - 1,000–2,000  → ง่าย เช่น เลือกสาขาที่ใกล้สุด (ไม่ต้องใช้ thinking)
 *   - 3,000–5,000  → กลาง เช่น multi-factor อย่างโจทย์นี้ ✅ แนะนำ
 *   - 8,000–10,000 → ซับซ้อน เช่น วิเคราะห์หลายวันล่วงหน้า / route optimization
 *   - 16,000+      → research-grade (ราคาสูง ไม่จำเป็นสำหรับ real-time UX)
 *
 * หมายเหตุ: thinking tokens ถูกกว่า output tokens แต่ก็มีต้นทุน
 * สำหรับ app real-time ใช้ 3,000-5,000 คือจุดสมดุลที่ดี
 */
const THINKING_CONFIG = {
    type: "enabled" as const,
    budget_tokens: 5000,        // ← ปรับตรงนี้ตาม complexity
};

// ── 5. MAIN FUNCTION ─────────────────────────────────────────

async function recommendBranch({ machineSize, userLat, userLng }: RecommendInput) {
    // ...
    // 5a. คำนวณระยะทาง/เวลาเดินทางก่อนส่ง AI
    //     (ในตัวอย่างนี้ใช้ค่า mock — ในระบบจริงเรียก Google Maps API)
    const branches = branchSnapshot;

    // 5b. เรียก Claude พร้อม thinking
    const response = await client.messages.create({
        model: "claude-sonnet-4-5",           // รองรับ extended thinking
        max_tokens: 6000,                     // ต้องมากกว่า budget_tokens
        thinking: THINKING_CONFIG,
        temperature: 1,                       // บังคับเมื่อใช้ thinking (API requirement)
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: "user",
                content: buildUserPrompt({ machineSize, branches }),
            },
        ],
    });

    let result;  // ← declare ข้างนอก try
    try {
        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") {
            throw new Error("ไม่พบ text block ใน response");
        }
        result = JSON.parse(textBlock.text);
    } catch (e) {
        throw new Error("AI ตอบกลับในรูปแบบที่ไม่ถูกต้อง: " + e);
    }

    const thinkingBlock = response.content.find((b) => b.type === "thinking");
    const thinkingText = thinkingBlock?.type === "thinking" ? thinkingBlock.thinking : "";

    return {
        recommendation: result,
        thinkingTokensUsed: thinkingText.length ?? 0,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
    };
}

// ── 6. USAGE EXAMPLE ─────────────────────────────────────────

async function main() {
    console.log("🔍 กำลังวิเคราะห์สาขา...\n");

    const result = await recommendBranch({
        machineSize: "5kg",
        userLat: 13.7246,
        userLng: 100.5292,
    });

    console.log("✅ คำแนะนำ:");
    console.log(`   สาขา: ${result.recommendation.recommendedBranchName}`);
    console.log(`   เวลารวม: ${result.recommendation.totalExpectedMinutes} นาที`);
    console.log(`   - เดินทาง: ${result.recommendation.travelMinutes} นาที`);
    console.log(`   - รอคิว: ${result.recommendation.waitMinutes} นาที`);
    console.log(`   เครื่องว่าง: ${result.recommendation.machineAvailable ? "✓" : "✗"}`);
    console.log(`\n💬 AI: "${result.recommendation.reasoning}"`);

    console.log("\n📊 สาขาทั้งหมด:");
    result.recommendation.allBranchesScored.forEach((b: BranchScored) => {
        const tag = b.eligible ? "" : " (ไม่มีเครื่องที่ต้องการ)";
        console.log(`   ${b.name}: ${b.totalMinutes} นาที${tag}`);
    });

    console.log(`\n🧠 Tokens: thinking=${result.thinkingTokensUsed} chars | in=${result.inputTokens} | out=${result.outputTokens}`);
}

main().catch(console.error);

