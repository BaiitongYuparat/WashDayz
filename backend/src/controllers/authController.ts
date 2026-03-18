import { prisma } from "../../lib/prisma";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload?.email;
    const name = payload?.name || "User" ;
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
          password: ""  
        }
      });
      isNewUser = true;
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { email },
        data: { googleId }
      });
    }

    const addressCount = await prisma.userAddress.count({
  where: { user_id: user.user_id }
});

    const hasAddress = addressCount > 0;
    res.json({ user, isNewUser, hasAddress });

  } catch (error) {
    console.error("Google auth error: ",error)
    res.status(500).json({ error: "Google auth failed" });
  }
};

export const loginUser = async (req: Request, res:Response) => {
  const {email, password} = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email
      }
    })
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(user.password !== password) {
      return res.status(401).json({ message: "Wrong password" });
    }
    return res.status(200).json({
      message: "Login success",
      user: user
    });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
}