//Token 

import jwt from "jsonwebtoken";

// generate token

export const generateToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

// สร้าง refreshToken
export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};

// verify token
export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
    sub: string;
  };
};