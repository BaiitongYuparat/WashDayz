import { prisma } from "../../lib/prisma";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { generateToken , generateRefreshToken } from "../utils/jsonwebtoken";
import { comparePassword ,hashPassword } from "../utils/bcryptjs";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name, phone, role } = req.body;

  try {
     if (!email || !email.endsWith("@gmail.com")) {
      return res.status(400).json({
        message: "Email must be a @gmail.com address"
      });
    }

     if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // check user ซ้ำ
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const hashedPassword = await hashPassword(password);
    


    // create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone: phone || "",
        role: role === "ADMIN" ? "ADMIN" : "USER"
      }
    });

    const token = generateToken({ user_id: user.user_id, role: user.role });
    const refreshToken = generateRefreshToken(user.user_id);

    return res.status(201).json({
      message: "Register success",
      token,
      refreshToken,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Register failed" });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload?.email;
    const name = payload?.name || "User";
    const googleId = payload?.sub;


    let user = await prisma.user.findUnique({
      where: { email }

    });

    if (!email || !name) {
      return res.status(400).json({ error: "Missing email or name" });
    }

    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || "User",
          googleId,
          phone: "",
          password: null,
          role: "USER" 
        }
      });
      isNewUser = true;
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { email },
        data: { googleId }
      });
    }
  
    const token = generateToken({ user_id: user.user_id, role: user.role });
    const refreshToken = generateRefreshToken(user.user_id);

    const addressCount = await prisma.userAddress.count({
      where: { user_id: user.user_id }
    });

    const hasAddress = addressCount > 0;
    res.json({ token, user, isNewUser, hasAddress , refreshToken }); 

  } catch (error) {
    console.error("Google auth error: ", error)
    res.status(500).json({ error: "Google auth failed" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
     if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    })
    if (!user || !user.password) {
      return res.status(404).json({ message: "User not found" });
    }

     if (!user || !user.password) {
      return res.status(404).json({
        message: "User not found or use Google login"
      });
    }

    const isMatch = await comparePassword(password, user.password); 

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }


    const token = generateToken({ user_id: user.user_id, role: user.role });
    const refreshToken = generateRefreshToken(user.user_id);

    const { password: _, ...safeUser } = user;
    return res.status(200).json({
      message: "Login success",
      token,
      user:safeUser,
      refreshToken
    });
  }
  catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: "Login failed" });
  }
}


export const logoutUser = async (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Logout success"
  });
};