import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"
import { syncOrderStatus } from "../../lib/syncOrderStatus"

// ลำดับการทำงานของ machine type: WASHER ต้องเสร็จก่อน DRYER ถึงจะสร้างคิวได้
const MACHINE_TYPE_ORDER: string[] = ["WASHER", "DRYER"]

// helper: หา machine type ถัดไปใน order
function getNextMachineType(currentType: string): string | null {
    const idx = MACHINE_TYPE_ORDER.indexOf(currentType)
    if (idx === -1 || idx >= MACHINE_TYPE_ORDER.length - 1) return null
    return MACHINE_TYPE_ORDER[idx + 1]
}

// helper: คำนวณ estimatedStartAt สำหรับคิวที่ไม่ได้เครื่องทันที
async function calcEstimatedStartAt(
    tx: any,
    branch_id: string,
    machineType: string
): Promise<Date | null> {
    const busyCount = await tx.queue.count({
        where: {
            branch_id,
            machine_type: machineType,
            finished_at: null,
            branch_machine_id: { not: null }
        }
    })

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

    const machinesTotal = await tx.branchMachine.count({
        where: {
            branch_id,
            machine: { type: machineType }
        }
    })

    const totalBusyMachines = await tx.branchMachine.count({
        where: {
            branch_id,
            machine: { type: machineType },
            status: "UNAVAILABLE"
        }
    })

    const cyclesAhead = Math.ceil(waitingAhead / (machinesTotal || 1))
    const waitMinutes = (cyclesAhead + (totalBusyMachines > 0 ? 1 : 0)) * minutesPerCycle
    return new Date(Date.now() + waitMinutes * 60 * 1000)
}

// helper: สร้าง queue สำหรับ machine type นั้นๆ (ใช้ร่วมกันระหว่าง createQueue และ finishQueue)
async function createQueueForType(
    tx: any,
    order_id: string,
    branch_id: string,
    machineType: string,
    allowedMachineIds: string[]
) {
    // กันสร้างซ้ำ
    const existing = await tx.queue.findFirst({
        where: { order_id, machine_type: machineType }
    })
    if (existing) return null

    // queue_number แยกต่อ machine_type
    const lastQueue = await tx.queue.findFirst({
        where: { branch_id, machine_type: machineType },
        orderBy: { queue_number: "desc" }
    })
    const nextQueueNumber = lastQueue ? lastQueue.queue_number + 1 : 1

    // หาเครื่องว่าง
    const availableMachine = await tx.branchMachine.findFirst({
        where: {
            branch_id,
            status: "AVAILABLE",
            machine_id: { in: allowedMachineIds },
            machine: { type: machineType }
        }
    })

    if (availableMachine) {
        await tx.branchMachine.update({
            where: { branch_machine_id: availableMachine.branch_machine_id },
            data: { status: "UNAVAILABLE" }
        })
    }

    const estimatedStartAt = availableMachine
        ? null
        : await calcEstimatedStartAt(tx, branch_id, machineType)

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

    return queue
}

// สร้างคิว — สร้างเฉพาะ phase แรก (WASHER) เท่านั้น
// DRYER จะสร้างอัตโนมัติเมื่อ WASHER เสร็จใน finishQueue
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

            // รวบ machine_id แยกตาม type
            const typeMachineMap = new Map<string, string[]>()
            for (const item of order.items) {
                if (!item.machine_id || !item.machine?.type) continue
                const type = item.machine.type
                if (!typeMachineMap.has(type)) typeMachineMap.set(type, [])
                typeMachineMap.get(type)!.push(item.machine_id)
            }

            if (typeMachineMap.size === 0) throw new Error("NO_MACHINE_TYPE")

            // หา machine type แรกสุดที่ order นี้ต้องการ ตาม MACHINE_TYPE_ORDER
            const firstType = MACHINE_TYPE_ORDER.find(t => typeMachineMap.has(t))
            if (!firstType) throw new Error("NO_MACHINE_TYPE")

            const allowedIds = typeMachineMap.get(firstType) ?? []
            const queue = await createQueueForType(tx, order_id, branch_id, firstType, allowedIds)

            if (!queue) throw new Error("QUEUE_ALREADY_EXISTS")

            await syncOrderStatus(tx, order_id)
            return [queue]
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

// ปิดคิว — และสร้างคิว phase ถัดไปอัตโนมัติ (เช่น WASHER เสร็จ → สร้าง DRYER)
export const finishQueue = async (req: Request, res: Response) => {
    const id = req.params.id as string

    try {
        const result = await prisma.$transaction(async (tx) => {
            // ปิดคิว
            const queue = await tx.queue.update({
                where: { queue_id: id },
                data: { finished_at: new Date() }
            })

            // คืนเครื่องและ assign คิวถัดไปในคิวเดียวกัน (คิวอื่นที่รอ type เดียวกัน)
            if (queue.branch_machine_id) {
                const machine = await tx.branchMachine.findUnique({
                    where: { branch_machine_id: queue.branch_machine_id }
                })

                if (machine) {
                    await tx.branchMachine.update({
                        where: { branch_machine_id: machine.branch_machine_id },
                        data: { status: "AVAILABLE" }
                    })

                    await tx.queue.update({
                        where: { queue_id: id },
                        data: { branch_machine_id: null }
                    })

                    // หาคิวถัดไปที่รออยู่ (order อื่นที่รอ type เดียวกัน)
                    const nextQueue = await tx.queue.findFirst({
                        where: {
                            branch_id: machine.branch_id,
                            machine_type: queue.machine_type,
                            finished_at: null,
                            branch_machine_id: null
                        },
                        orderBy: { created_at: "asc" }
                    })

                    if (nextQueue) {
                        await tx.queue.update({
                            where: { queue_id: nextQueue.queue_id },
                            data: {
                                branch_machine_id: machine.branch_machine_id,
                                estimated_start_at: null,
                                started_at: new Date()
                            }
                        })
                        await tx.branchMachine.update({
                            where: { branch_machine_id: machine.branch_machine_id },
                            data: { status: "UNAVAILABLE" }
                        })
                    }
                }
            }

            // สร้างคิว phase ถัดไปสำหรับ order นี้ (WASHER → DRYER) 
            const nextType = queue.machine_type ? getNextMachineType(queue.machine_type) : null
            if (nextType) {
                // ตรวจว่า order นี้ต้องการ machine type ถัดไปไหม
                const order = await tx.order.findUnique({
                    where: { order_id: queue.order_id },
                    include: {
                        items: { include: { machine: true } }
                    }
                })

                if (order) {
                    const allowedIds = order.items
                        .filter(item => item.machine?.type === nextType && item.machine_id)
                        .map(item => item.machine_id!)

                    if (allowedIds.length > 0) {
                        await createQueueForType(
                            tx,
                            queue.order_id,
                            queue.branch_id,
                            nextType,
                            allowedIds
                        )
                    }
                }
            }

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
                order: {
                    include: { user: true }
                }
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

// ดูคิวตาม order ID
export const getQueueByOrderId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const queues = await prisma.queue.findMany({
            where: { order_id: id },
            orderBy: { created_at: "asc" }
        })
        if (!queues.length) {
            return res.status(404).json({ message: "Queue not found for this order" })
        }
        return res.json(queues)
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch queue" })
    }
}