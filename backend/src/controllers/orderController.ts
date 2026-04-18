import { Request, Response } from "express"
import { prisma } from '../../lib/prisma';
import { isBlockedByDependency } from '../../lib/syncOrderStatus';

export const createOrder = async (req: Request, res: Response) => {
    const { user_id, branch_id, address_id, addon_id, machine_id } = req.body

    try {
        if (!user_id || !branch_id || !machine_id?.length) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // ดึงราคา machine
        const machines = await prisma.machine.findMany({
            where: { machine_id: { in: machine_id } }
        })

        // ดึงราคา addon
        const addons = addon_id?.length
            ? await prisma.addonService.findMany({
                where: { addon_service_id: { in: addon_id } }
            })
            : []

        // คำนวณราคารวม
        const machineTotal = machines.reduce((sum, m) => sum + (m.price ?? 0), 0)
        const addonTotal = addons.reduce((sum, a) => sum + a.price, 0)
        const total_price = machineTotal + addonTotal


        // สร้าง order พร้อม items
        const order = await prisma.order.create({
            data: {
                user_id,
                branch_id,
                address_id,
                total_price,
                items: {
                    create: machine_id.map((machine_id: string) => ({
                        machine_id,
                        orderItemAddons: addon_id?.length
                            ? {
                                create: addon_id.map((addon_service_id: string) => ({
                                    addon_service_id,
                                }))
                            }
                            : undefined,
                    }))
                }
            },
            include: {
                user: true,
                branch: true,
                items: {
                    include: {
                        machine: true,
                        orderItemAddons: {
                            include: { addonService: true }
                        }
                    }
                }
            }
        })
        res.status(201).json(order)
    } catch (error) {
        console.error("CREATE ORDER ERROR:", error)
        res.status(500).json({ error: "Failed to create order" })
    }
}

// ดึง order ทั้งหมดของ user
export const getOrder = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { created_at: "desc" },
            include: {
                user: true,
                branch: true,
                items: {
                    include: {
                        machine: true,
                        orderItemAddons: { include: { addonService: true } }
                    }
                }
            }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" })
    }
}


export const getOrdersById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const order = await prisma.order.findUnique({
            where: { order_id: id },
            include: {
                branch: true,
                address: true,
                items: {
                    include: {
                        machine: true,
                        orderItemAddons: {
                            include: { addonService: true }
                        }
                    }
                }
            }
        })

        if (!order) return res.status(404).json({ error: "Order not found" })
        res.json(order)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order" })
    }
}

export const putOrderId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const { user_id, branch_id, total_price, status } = req.body
    try {
        const order = await prisma.order.update({
            where: {
                order_id: id
            },
            data: {
                user_id,
                branch_id,
                total_price,
                status
            }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Order' })
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
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



export const putOrderStatus = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const { status } = req.body

    if (status === "CANCELLED") {
        try {
            await prisma.$transaction(async (tx) => {
                const order = await tx.order.findUnique({ where: { order_id: id } })
                if (!order) throw new Error("ORDER_NOT_FOUND")
                if (order.status === "CANCELLED") throw new Error("ALREADY_CANCELLED")
                if (order.status === "FINISHED") throw new Error("ORDER_FINISHED")

                const activeQueues = await tx.queue.findMany({
                    where: { order_id: id, finished_at: null }
                })

                for (const queue of activeQueues) {
                    if (queue.branch_machine_id) {
                        await tx.branchMachine.update({
                            where: { branch_machine_id: queue.branch_machine_id },
                            data: { status: "AVAILABLE" }
                        })

                        const nextQueue = await tx.queue.findFirst({
                            where: {
                                branch_id: queue.branch_id,
                                machine_type: queue.machine_type,
                                finished_at: null,
                                branch_machine_id: null,
                                cancelled_at: null,
                                order_id: { not: id },
                            },
                            orderBy: { created_at: "asc" }
                        })

                        if (nextQueue) {
                            const isNextBlocked = await isBlockedByDependency(
                                tx, nextQueue.order_id, nextQueue.machine_type ?? ""
                            )
                            if (!isNextBlocked) {
                                await tx.queue.update({
                                    where: { queue_id: nextQueue.queue_id },
                                    data: {
                                        branch_machine_id: queue.branch_machine_id,
                                        estimated_start_at: null,
                                        started_at: new Date()
                                    }
                                })
                                await tx.branchMachine.update({
                                    where: { branch_machine_id: queue.branch_machine_id },
                                    data: { status: "UNAVAILABLE" }
                                })
                            }
                        }
                    }

                    await tx.queue.update({
                        where: { queue_id: queue.queue_id },
                        data: {
                            finished_at: new Date(),
                            branch_machine_id: null,
                            cancelled_at: new Date(),
                        }
                    })
                }

                await tx.order.update({
                    where: { order_id: id },
                    data: { status: "CANCELLED" }
                })
            })

            return res.json({ message: "Order cancelled successfully" })

        } catch (error: any) {
            if (error.message === "ORDER_NOT_FOUND")
                return res.status(404).json({ message: "Order not found" })
            if (error.message === "ALREADY_CANCELLED")
                return res.status(400).json({ message: "Order is already cancelled" })
            if (error.message === "ORDER_FINISHED")
                return res.status(400).json({ message: "Cannot cancel a finished order" })
            return res.status(500).json({ message: "Failed to cancel order" })
        }
    }

    // status อื่นๆ update ปกติ
    try {
        const order = await prisma.order.update({
            where: { order_id: id },
            data: { status }
        })
        return res.json(order)
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update Order' })
    }
}