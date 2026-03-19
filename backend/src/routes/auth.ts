import express from "express";
import { registerUser, loginUser, googleAuth, logoutUser } from "../controllers/authController";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.post("/logout", logoutUser);

export default router;