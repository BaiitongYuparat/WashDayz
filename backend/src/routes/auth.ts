import express from "express";
import { googleAuth , loginUser } from "../controllers/authController";

const router = express.Router();

router.post("/google", googleAuth);
router.post("/login", loginUser);

export default router;