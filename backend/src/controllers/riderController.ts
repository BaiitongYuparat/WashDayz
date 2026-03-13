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
      try {
        const rider = await prisma.rider.findMany()
        res.json(rider);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch rider" });
    }
}

export const getRiderId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const rider = await prisma.rider.findUnique({
            where : {
                rider_id: id
            }
        })
        res.json(rider);
    }catch (error) {
        res.status(500).json({ error: "Failed to fetch rider" });
    }
}

export const putRiderId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const  { name, phone, license_plate ,  } = req.body
    try {
        const rider = await prisma.rider.update({
            where : {
                rider_id: id
            },
            data: {
                name,
                phone,
                license_plate,
            }
        })
        res.json(rider);
    }catch (error) {
        res.status(500).json({ error: "Failed to fetch rider" });
    }
}

export const deleteRiderId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const rider = await prisma.rider.delete({
            where : {
                rider_id: id
            }
        });
        res.json({
            message: 'Rider deleted successfully',
            user: rider
        });
    }catch (error) {
        res.status(500).json({ error: "Failed to fetch rider" });
    }
}