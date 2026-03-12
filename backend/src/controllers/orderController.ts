import { Request, Response } from "express"
import { prisma } from '../../lib/prisma';


export const createOrder = async (req: Request, res: Response) => {
    const { user_id, rider_id, branch_id, service, pieces, price } = req.body
    try {
        const oder = await prisma.order.create({
            data: {
                user_id,
                branch_id,
                rider_id: rider_id || null,
                service,
                pieces,
                price
            }
        })
        res.json(oder)
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to create order" })
    }
}