import { Request, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { prisma } from "../../lib/prisma"

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to get profile" });
  }
};