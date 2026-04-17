import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"
import { syncOrderStatus } from "../../lib/syncOrderStatus"
import { isBlockedByDependency, tryUnblockQueues } from "../../lib/queueDependency"

// สร้างคิว
export const createQueue = async (req: Request, res: Response) => {
    const { order_id, branch_id } = req.body

    if (!order_id || !branch_id) {
        return res.status(400).json({
            message: "order_id and branch_id are required"
        })
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { order_id },
                include: {
                    items: {
                        include: { machine: true }
                    }
                }
            })
            if (!order) throw new Error("ORDER_NOT_FOUND")

            const requiredTypes = [
                ...new Set(
                    order.items
                        .filter(item => item.machine?.type)
                        .map(item => item.machine!.type)
                )
            ]
            if (requiredTypes.length === 0) throw new Error("NO_MACHINE_TYPE")

            const typeMachineMap = new Map<string, string[]>()
            for (const item of order.items) {
                if (!item.machine_id || !item.machine?.type) continue
                const type = item.machine.type
                if (!typeMachineMap.has(type)) typeMachineMap.set(type, [])
                typeMachineMap.get(type)!.push(item.machine_id)
            }

            const queues = []
            for (const machineType of requiredTypes) {
                const existingQueue = await tx.queue.findFirst({
                    where: { order_id, machine_type: machineType }
                })
                if (existingQueue) continue

                const lastQueue = await tx.queue.findFirst({
                    where: { branch_id, machine_type: machineType },
                    orderBy: { queue_number: "desc" }
                })
                const nextQueueNumber = lastQueue ? lastQueue.queue_number + 1 : 1

                const allowedMachineIds = typeMachineMap.get(machineType) ?? []

                // ✅ เช็ค dependency ก่อน assign เครื่อง
                const blocked = await isBlockedByDependency(tx, order_id, machineType)

                const availableMachine = blocked
                    ? null
                    : await tx.branchMachine.findFirst({
                        where: {
                            branch_id,
                            status: "AVAILABLE",
                            machine_id: { in: allowedMachineIds },
                            machine: { type: machineType },
                        }
                    })

                if (availableMachine) {
                    await tx.branchMachine.update({
                        where: { branch_machine_id: availableMachine.branch_machine_id },
                        data: { status: "UNAVAILABLE" }
                    })
                }

                let estimatedStartAt: Date | null = null
                if (!availableMachine) {
                    const waitingAhead = await tx.queue.count({
                        where: {
                            branch_id,
                            machine_type: machineType,
                            finished_at: null,
                            branch_machine_id: null
                        }
                    })
                    const machineInfo = await tx.machine.findFirst({
                        where: { type: machineType }
                    })
                    const minutesPerCycle = machineInfo?.duration_minutes ?? 30
                    const totalBusyMachines = await tx.branchMachine.count({
                        where: {
                            branch_id,
                            machine: { type: machineType },
                            status: "UNAVAILABLE"
                        }
                    })
                    const machinesTotal = await tx.branchMachine.count({
                        where: { branch_id, machine: { type: machineType } }
                    })
                    const cyclesAhead = Math.ceil(waitingAhead / (machinesTotal || 1))
                    const waitMinutes = (cyclesAhead + (totalBusyMachines > 0 ? 1 : 0)) * minutesPerCycle
                    estimatedStartAt = new Date(Date.now() + waitMinutes * 60 * 1000)
                }

                const queue = await tx.queue.create({
                    data: {
                        order_id,
                        branch_id,
                        queue_number: nextQueueNumber,
                        machine_type: machineType,
                        branch_machine_id: availableMachine?.branch_machine_id ?? null,
                        started_at: availableMachine ? new Date() : null,
                        estimated_start_at: estimatedStartAt
                    }
                })
                queues.push(queue)
                await syncOrderStatus(tx, order_id)
            }

            if (queues.length === 0) throw new Error("QUEUE_ALREADY_EXISTS")
            return queues
        })

        return res.status(201).json({
            message: "Queue created successfully",
            data: result
        })
    } catch (error: any) {
        console.error("CREATE QUEUE ERROR:", error)
        if (error.message === "ORDER_NOT_FOUND")
            return res.status(404).json({ message: "Order not found" })
        if (error.message === "QUEUE_ALREADY_EXISTS")
            return res.status(400).json({ message: "Queue already exists" })
        if (error.message === "NO_MACHINE_TYPE")
            return res.status(400).json({ message: "No machine type in order" })
        if (error.code === "P2002")
            return res.status(400).json({ message: "Duplicate queue (race condition)" })
        return res.status(500).json({ message: error.message })
    }
}

// ปิดคิว
// ปิดคิว
export const finishQueue = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const result = await prisma.$transaction(async (tx) => {
            const queue = await tx.queue.update({
                where: { queue_id: id },
                data: { finished_at: new Date() }
            })
            if (!queue.branch_machine_id) return queue

            const machine = await tx.branchMachine.findUnique({
                where: { branch_machine_id: queue.branch_machine_id }
            })
            if (!machine) return queue

            await tx.branchMachine.update({
                where: { branch_machine_id: machine.branch_machine_id },
                data: { status: "AVAILABLE" }
            })
            await tx.queue.update({
                where: { queue_id: id },
                data: { branch_machine_id: null }
            })

            // ✅ ลบ nextQueue ที่ซ้ำออก เหลือแค่อันเดียว
            const nextQueue = await tx.queue.findFirst({
                where: {
                    branch_id: machine.branch_id,
                    machine_type: queue.machine_type,
                    finished_at: null,
                    branch_machine_id: null,
                },
                orderBy: { created_at: "asc" }
            })
            
            await tryUnblockQueues(tx, queue.order_id, queue.branch_id ?? null)
            await syncOrderStatus(tx, queue.order_id)
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
            orderBy: { queue_number: "asc" },
            include: {
                branch: true,
                order: { include: { user: true } }
            }
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
        const queue = await prisma.queue.findUnique({ where: { queue_id: id } })
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

// ดูคิวตาม order ID
export const getQueueByOrderId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const queues = await prisma.queue.findMany({
            where: { order_id: id },
            orderBy: { created_at: "asc" }
        })
        if (!queues.length)
            return res.status(404).json({ message: "Queue not found for this order" })
        return res.json(queues)
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch queue" })
    }
}