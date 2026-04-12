import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

// สร้างคิว
export const createQueue = async (req: Request, res: Response) => {
    const { order_id, branch_id } = req.body

    try {
        if (!order_id || !branch_id) {
            return res.status(400).json({ message: "order_id and branch_id are required" })
        }

        const result = await prisma.$transaction(async (tx) => {

            //เช็ค order
            const order = await tx.order.findUnique({
                where: { order_id },
                include: {
                    items: {
                        include: { machine: true }
                    }
                }
            })
            if (!order) throw new Error("ORDER_NOT_FOUND")

            //เช็คว่ามี queue แล้วหรือยัง
            const existingQueue = await tx.queue.findFirst({ where: { order_id } })
            if (existingQueue) throw new Error("QUEUE_ALREADY_EXISTS")

            //หา machine_type ที่ต้องใช้จาก OrderItem
            const requiredTypes = order.items
                .filter(item => item.machine?.type)
                .map(item => item.machine!.type)

            //หาเลขคิวถัดไปครั้งเดียว
            const lastQueue = await tx.queue.findFirst({
                where: { branch_id },
                orderBy: { queue_number: "desc" }
            })
            const nextQueueNumber = lastQueue ? lastQueue.queue_number + 1 : 1

            //สร้าง queue row ละ 1 machine_type
            const queues = []
            for (const machineType of requiredTypes) {

                const availableMachine = await tx.branchMachine.findFirst({
                    where: {
                        branch_id,
                        status: "AVAILABLE",
                        machine: { type: machineType }
                    }
                })

                const queue = await tx.queue.create({
                    data: {
                        order_id,
                        branch_id,
                        queue_number: nextQueueNumber, // ← เลขเดียวกันทุก type
                        machine_type: machineType,
                        branch_machine_id: availableMachine?.branch_machine_id ?? null
                    }
                })

                if (availableMachine) {
                    await tx.branchMachine.update({
                        where: { branch_machine_id: availableMachine.branch_machine_id },
                        data: { status: "UNAVAILABLE" }
                    })
                }

                queues.push(queue)
            }

            return queues
        })

        return res.status(201).json({
            message: "Queue created successfully",
            data: result
        })

    } catch (error: any) {
        if (error.message === "ORDER_NOT_FOUND")
            return res.status(404).json({ message: "Order not found" })
        if (error.message === "QUEUE_ALREADY_EXISTS")
            return res.status(400).json({ message: "Queue already exists" })
        return res.status(500).json({ message: "Internal server error" })
    }
}

// ปิดคิว
export const finishQueue = async (req: Request, res: Response) => {
    const id = req.params.id as string

    try {
        const result = await prisma.$transaction(async (tx) => {

            //ปิดคิว row นี้
            const queue = await tx.queue.update({
                where: { queue_id: id },
                data: { finished_at: new Date() }
            })

            if (!queue.branch_machine_id) return queue

            //ดึงเครื่องที่ใช้อยู่
            const machine = await tx.branchMachine.findUnique({
                where: { branch_machine_id: queue.branch_machine_id }
            })
            if (!machine) return queue

            //คืนเครื่อง
            await tx.branchMachine.update({
                where: { branch_machine_id: machine.branch_machine_id },
                data: { status: "AVAILABLE" }
            })

            await tx.queue.update({
                where: { queue_id: id },
                data: { branch_machine_id: null }
            })

            //หาคิวถัดไปที่รอ type เดียวกัน
            const nextQueue = await tx.queue.findFirst({
                where: {
                    branch_id: machine.branch_id,
                    machine_type: queue.machine_type,
                    finished_at: null,
                    branch_machine_id: null
                },
                orderBy: { created_at: "asc" }
            })

            //assign เครื่องให้คิวถัดไป
            if (nextQueue) {
                await tx.queue.update({
                    where: { queue_id: nextQueue.queue_id },
                    data: { branch_machine_id: machine.branch_machine_id }
                })
                await tx.branchMachine.update({
                    where: { branch_machine_id: machine.branch_machine_id },
                    data: { status: "UNAVAILABLE" }
                })
            }

            return queue
        })

        res.json(result)

    } catch (error) {
        res.status(500).json({ error: "Failed to finish queue" })
    }
}

// ดูคิวแยกสาขา
export const getQueue = async (req: Request, res: Response) => {
    const { branch_id } = req.query
    try {
        const queue = await prisma.queue.findMany({
            where: branch_id ? { branch_id: String(branch_id) } : {},
            orderBy: { queue_number: "asc" }
        })
        res.json(queue)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch queue" })
    }
}

// ดูคิวตาม ID
export const getQueueById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const queue = await prisma.queue.findUnique({
            where: { queue_id: id }
        })
        if (!queue) return res.status(404).json({ message: "Queue not found" })
        res.json(queue)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch queue" })
    }
}

// ลบคิว
export const deleteQueueById = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const queue = await prisma.queue.delete({ where: { queue_id: id } })
        res.json(queue)
    } catch (error: any) {
        if (error.code === "P2025")
            return res.status(404).json({ message: "Queue not found" })
        res.status(500).json({ error: "Failed to delete queue" })
    }
}

// รีเซ็ตคิว
export const resetQueue = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const queue = await prisma.queue.update({
            where: { queue_id: id },
            data: { finished_at: null }
        })
        res.json(queue)
    } catch (error) {
        res.status(500).json({ error: "Failed to reset queue" })
    }
}