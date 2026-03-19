import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    user_id: string;
    role: string;
  };
}