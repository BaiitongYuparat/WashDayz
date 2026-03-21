import { Request, Response } from "express"
import { prisma } from '../../lib/prisma';


export const createOrder = async (req: Request, res: Response) => {
    const { user_id, rider_id, branch_id, pieces, price, items } = req.body

    try {
        if (!user_id || !branch_id || !pieces || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const order = await prisma.order.create({
            data: {
                user_id,
                branch_id,
                rider_id: rider_id ?? undefined,
                pieces,
                price,

                items: {
                    create: items.map((item: any) => ({
                        main_service_id: item.main_service_id,
                        quantity: item.quantity,
                        subtotal: item.subtotal
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        mainService: true
                    }
                },
                user: true,
                rider: true,
            }
        })

        res.json(order)
    } catch (error) {
        console.error("CREATE USER ERROR:", error)
        res.status(500).json(error)
    }
}

export const getOrder = async (req: Request, res: Response) => {
    try {
        const order = await prisma.order.findMany({
            include: {
                user: true,       
                rider: true, 
                items: {
                    include: {
                        mainService: true
                    }
                }
            }
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch branch' })
    }
}

export const getOrderId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const order = await prisma.order.findUnique({
            where: {
                order_id: id
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Order' })
    }
}

export const putOrderId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const { user_id, rider_id, branch_id, pieces, price } = req.body
    try {
        const order = await prisma.order.update({
            where: {
                order_id: id
            },
            data: {
                user_id,
                branch_id,
                rider_id: rider_id ?? undefined,
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
    const id = req.params.id as string
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