import { Request, Response } from "express"
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../utils/bcryptjs'

export const createUser = async (req: Request, res: Response) => {
    const { name, email, password, phone, role } = req.body
    try {
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                role: role || "USER",
                password: hashedPassword
            }
        })
        res.json(user)
    } catch (error) {
        console.error("CREATE USER ERROR:", error)
        res.status(500).json(error)
    }
}

export const getUser = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                addresses: true
            }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};


export const getUserId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const user = await prisma.user.findUnique({
            where: {
                user_id: id
            },
            include: {
                addresses: true
            }
        })
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' })
    }
}

export const putUserId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const { name, email, phone, role, password } = req.body;

    try {
        let updateData: any = { name, email, phone, role };
        if (password) {
            const hashedPassword = await hashPassword(password);
            updateData.password = hashedPassword;
        }
        const user = await prisma.user.update({
            where: { user_id: id },
            data: updateData
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' })
    }
}

export const deleteUserId = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    try {
        const user = await prisma.user.delete({
            where: { user_id: id }
        });
        res.json({
            message: "User deleted successfully",
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete user" });
    }
};


