import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"


export const createaddonService = async (req: Request, res: Response) => {
    const { name, description, price } = req.body
    try {
        const addonservice = await prisma.addonService.create({
            data: {
                name,
                description,
                price
            }
        })
        res.json(addonservice)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create mainService' })
    }
}