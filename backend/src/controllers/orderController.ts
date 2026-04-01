import { Request, Response } from "express"
import { prisma } from '../../lib/prisma';


export const createOrder = async (req: Request, res: Response) => {
    const { user_id,  branch_id, pieces, price, items } = req.body

    try {
        if (!user_id || !branch_id || !pieces || !price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const order = await prisma.order.create({
            data: {
                user_id,
                branch_id,
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
    const id = req.params.id as string;

    try {
        const items = await prisma.orderItem.findMany({
            where: { order_id: id },
            select: { order_item_id: true }
        });

        const itemIds = items.map(i => i.order_item_id);

        //  เช็คก่อนลบ
        if (itemIds.length > 0) {
            await prisma.orderItemAddon.deleteMany({
                where: {
                    order_item_id: { in: itemIds }
                }
            });
        }

        await prisma.orderItem.deleteMany({
            where: { order_id: id }
        });

        const order = await prisma.order.delete({
            where: { order_id: id }
        });

        res.json({
            message: 'Order deleted successfully',
            order
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);
        res.status(500).json({ error: 'Delete failed' });
    }
};