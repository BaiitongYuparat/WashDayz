import { Router, Request, Response } from "express";
import { runRecommendBranch } from "./tools/runRecommendBranch";
import { summarizeBranches } from "../lib/llm"

const router = Router();

// frontend ส่งมาหลังจาก user เลือก service แล้ว
router.post("/", async (req: Request, res: Response) => {
  const { userLat, userLng, machineType, capacity } = req.body;

  if (!userLat || !userLng || !machineType || !capacity) {
    return res.status(400).json({
      error: "ต้องการ userLat, userLng, machineType, capacity",
    });
  }

  try {
    //backend คำนวณ
    const scored = await runRecommendBranch({
      userLat,
      userLng,
      machineType,
      capacity,
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