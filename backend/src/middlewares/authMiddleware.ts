import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/authRequest";

type JwtPayload = {
  user_id: string;
  role: string;
};

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("🔥 RAW TOKEN:", token);
    if (!token) {
      return res.status(401).json({ message: "No token" });
    }
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.user = decoded;
    console.log("🔥 DECODED:", decoded);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};