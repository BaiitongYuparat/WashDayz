import { Request, Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { prisma } from "../../lib/prisma"
import { supabase } from '../../lib/supabase'
import multer from 'multer'

export const upload = multer({ storage: multer.memoryStorage() });

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

export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = `profiles/${userId}/avatar.jpg`;

    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) return res.status(500).json({ error });

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    await prisma.user.update({
      where: { user_id: userId },
      data: { profile_image: data.publicUrl },
    });

    res.json({ url: data.publicUrl });
  } catch (err) {
    console.error("UPLOAD PROFILE IMAGE ERROR:", err);
    res.status(500).json({ message: "Failed to upload image" });
  }
};