import express from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { getProfile } from "../controllers/profileController"

const router = express.Router();

// Route profile
router.get("/", verifyToken, getProfile);

export default router;