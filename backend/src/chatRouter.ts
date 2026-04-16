import { Router, Request, Response } from "express";
import { runRecommendBranch } from "./tools/runRecommendBranch";
import { summarizeBranches } from "../lib/llm"
import { prisma } from "../lib/prisma"

const router = Router();

// frontend ส่งมาหลังจาก user เลือก service แล้ว
router.post("/", async (req: Request, res: Response) => {
  const { address_id, machineType, capacity } = req.body;

  if (!address_id || !machineType || !capacity) {
    return res.status(400).json({
      error: "ต้องการ userLat, userLng, machineType, capacity",
    });
  }

  const address = await prisma.userAddress.findUnique({
    where: { address_id }
  })

  if (!address) {
    return res.status(404).json({ error: "ไม่พบที่อยู่นี้" })
  }

  if (!address.lat || !address.lng) {
    return res.status(400).json({ error: "ที่อยู่นี้ยังไม่มีข้อมูล GPS" })
  }

  try {
    //backend คำนวณ
    const scored = await runRecommendBranch({
      userLat: address.lat,
      userLng: address.lng,
      machineTypes: [{ type: machineType, capacity }],
    });

    //ai สรุปเป็นภาษา
    const summary = await summarizeBranches(scored.allBranchesScored, machineType, capacity);

    res.json({
      success: true,
      summary,      // aiสรุปแสดงบน UI
      branches: scored, // ข้อมูลดิบ ใช้ render รายการสาขา
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;