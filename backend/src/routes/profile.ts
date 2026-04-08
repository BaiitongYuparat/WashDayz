import express from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { getProfile , uploadProfileImage , upload } from "../controllers/profileController"

const router = express.Router();

// Route profile
router.get("/", verifyToken, getProfile);
router.post('/upload', verifyToken, upload.single('image'), uploadProfileImage)

export default router;