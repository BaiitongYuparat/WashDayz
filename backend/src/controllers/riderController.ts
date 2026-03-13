import { Request, Response } from "express"
import { prisma } from '../../lib/prisma';

export const createRider = async (req: Request, res: Response) => {
    const { name, phone, license_plate ,  } = req.body
    try {
        const rider = await prisma.rider.create({
            data: {
                name,
                phone,
                license_plate,
            }
        })
        res.json(rider)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create rider' })
    }
}

export const getRider = async (req: Request, res: Response) => {
   
}