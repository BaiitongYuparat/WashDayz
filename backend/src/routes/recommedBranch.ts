import express from "express"
import { runRecommendBranch } from "../tools/runRecommendBranch"

const router = express.Router()

router.post("/", async (req, res) => {
  try {
    const { userLat, userLng, machineType, capacity, mainServiceId } = req.body

    if (!userLat || !userLng) {
      res.status(400).json({ message: "userLat and userLng are required" })
      return
    }

    const result = await runRecommendBranch({
      userLat,
      userLng,
      machineType,
      capacity,
      mainServiceId,
    })

    res.status(200).json(result)
  } catch (error) {
    console.error("recommend error:", error)
    res.status(500).json({ message: "Internal server error", error })
  }
})

export default router