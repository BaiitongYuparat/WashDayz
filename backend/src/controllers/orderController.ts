import { Request, Response } from "express"
import { prisma } from '../../lib/prisma';


export const createOrder = async (req: Request, res: Response) => {
    const { user_id, rider_id, branch_id, service, pieces, price } = req.body

    try {
        const order = await prisma.order.create({
            data: {
                user_id: Number(user_id),
                branch_id: Number(branch_id),
                rider_id: rider_id ? Number(rider_id) : undefined,
                service,
                pieces,
                price
            }
        })
        res.json(order)
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete branch' });
    }
}

export const getOrder = async (req: Request, res: Response) => {
    try {
        const order = await prisma.order.findMany();
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch branch' })
    }
}

export const getOrderId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const order = await prisma.order.findUnique({
            where: {
                order_id: id
            }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Order' })
    }
}

export const putOrderId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { user_id, rider_id, branch_id, service, pieces, price } = req.body
    try {
        const order = await prisma.order.update({
            where: {
                order_id: id
            },
            data: {
                user_id: Number(user_id),
                branch_id: Number(branch_id),
                rider_id: rider_id ? Number(rider_id) : undefined,
                service,
                pieces,
                price
            }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Order' })
    }
}

export const deleteOrderId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const order = await prisma.order.delete({
            where: {
                order_id: id
            }
        });
        res.json({
            message: 'Order deleted successfully',
            user: order
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Order' })
    }
}