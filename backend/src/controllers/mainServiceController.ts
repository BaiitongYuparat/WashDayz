import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"


export const createmainService = async (req: Request, res: Response) => {
    const { name, description, price_per_unit } = req.body
    try {
        const mainservice = await prisma.mainService.create({
            data: {
                name,
                description,
                price_per_unit
            }
        })
        res.json(mainservice)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create mainService' })
    }
}