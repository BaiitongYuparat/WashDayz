import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"
import { syncOrderStatus } from "../../lib/syncOrderStatus"

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

            // เช็ค order และดึง machine type ที่ต้องใช้
            const order = await tx.order.findUnique({
                where: { order_id },
                include: {
                    items: {
                        include: { machine: true }
                    }
                }
            })
            if (!order) throw new Error("ORDER_NOT_FOUND")
            // เอา machine_type แบบไม่ซ้ำ
            const requiredTypes = [
                ...new Set(
                    order.items
                        .filter(item => item.machine?.type)
                        .map(item => item.machine!.type)
                )
            ]
            if (requiredTypes.length === 0) {
                throw new Error("NO_MACHINE_TYPE")
            }

            const queues = []
            for (const machineType of requiredTypes) {
                // กันสร้างซ้ำต่อ type (ไม่ error แค่ข้าม)
                const existingQueue = await tx.queue.findFirst({
                    where: { order_id, machine_type: machineType }
                })
                if (existingQueue) continue

                // นับ queue_number แยกต่อ machine_type ไม่รวมกัน
                // เพราะ WASHER กับ DRYER คนละคิว ไม่ควรใช้เลขเดียวกัน
                const lastQueue = await tx.queue.findFirst({
                    where: { branch_id, machine_type: machineType },
                    orderBy: { queue_number: "desc" }
                })
                const typeMachineMap = new Map<string, string[]>()
                for (const item of order.items) {
                    if (!item.machine?.type) continue
                    const type = item.machine.type
                    if (!typeMachineMap.has(type)) typeMachineMap.set(type, [])
                    typeMachineMap.get(type)!.push(item.machine_id)
                }

                const nextQueueNumber = lastQueue ? lastQueue.queue_number + 1 : 1


                const allowedMachineIds = typeMachineMap.get(machineType) ?? []
                // หาเครื่องว่างของ type นั้น ในสาขานั้น
                const availableMachine = await tx.branchMachine.findFirst({
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

                //คำนวณเวลาที่คาดว่าจะได้ใช้เครื่อง สำหรับคิวที่ต้องรอ
                let estimatedStartAt: Date | null = null
                if (!availableMachine) {
                    // นับจำนวนคิวที่กำลังใช้เครื่องอยู่ (assigned แต่ยังไม่เสร็จ)
                    const busyCount = await tx.queue.count({
                        where: {
                            branch_id,
                            machine_type: machineType,
                            finished_at: null,
                            branch_machine_id: { not: null }
                        }
                    })

                    // นับคิวที่รออยู่ก่อนหน้า (ยังไม่ได้เครื่อง)
                    const waitingAhead = await tx.queue.count({
                        where: {
                            branch_id,
                            machine_type: machineType,
                            finished_at: null,
                            branch_machine_id: null
                        }
                    })

                    // ดึง duration จาก machine type (ใช้ตัวแรกที่เจอ)
                    const machineInfo = await tx.machine.findFirst({
                        where: { type: machineType }
                    })
                    const minutesPerCycle = machineInfo?.duration_minutes ?? 30

                    // ETA = รอบที่กำลังรัน + คิวที่รออยู่ก่อนหน้า
                    // หารจำนวนเครื่องที่กำลัง busy เพื่อให้ตรงกับความเป็นจริง
                    const totalBusyMachines = await tx.branchMachine.count({
                        where: {
                            branch_id,
                            machine: { type: machineType },
                            status: "UNAVAILABLE"
                        }
                    })
                    const machinesTotal = await tx.branchMachine.count({
                        where: {
                            branch_id,
                            machine: { type: machineType }
                        }
                    })

                    // คิวที่รออยู่ก่อนหน้า / จำนวนเครื่องทั้งหมด = รอบที่ต้องรอ
                    const cyclesAhead = Math.ceil(waitingAhead / (machinesTotal || 1))
                    const waitMinutes = (cyclesAhead + (totalBusyMachines > 0 ? 1 : 0)) * minutesPerCycle
                    estimatedStartAt = new Date(Date.now() + waitMinutes * 60 * 1000)
                }

                // สร้าง queue
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
            if (queues.length === 0) {
                throw new Error("QUEUE_ALREADY_EXISTS")
            }
            return queues
        })
        return res.status(201).json({
            message: "Queue created successfully",
            data: result
        })
    } catch (error: any) {
        console.error("CREATE QUEUE ERROR:", error)
        if (error.message === "ORDER_NOT_FOUND") {
            return res.status(404).json({ message: "Order not found" })
        }
        if (error.message === "QUEUE_ALREADY_EXISTS") {
            return res.status(400).json({ message: "Queue already exists" })
        }
        if (error.message === "NO_MACHINE_TYPE") {
            return res.status(400).json({ message: "No machine type in order" })
        }
        if (error.code === "P2002") {
            return res.status(400).json({ message: "Duplicate queue (race condition)" })
        }
        return res.status(500).json({ message: error.message })
    }
}

// ปิดคิว
export const finishQueue = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const result = await prisma.$transaction(async (tx) => {
            // ปิดคิว row นี้
            const queue = await tx.queue.update({
                where: { queue_id: id },
                data: { finished_at: new Date() }
            })
            if (!queue.branch_machine_id) return queue
            // ดึงเครื่องที่ใช้อยู่
            const machine = await tx.branchMachine.findUnique({
                where: { branch_machine_id: queue.branch_machine_id }
            })
            if (!machine) return queue
            // คืนสถานะเครื่องเป็น AVAILABLE
            await tx.branchMachine.update({
                where: { branch_machine_id: machine.branch_machine_id },
                data: { status: "AVAILABLE" }
            })
            // ถอด branch_machine_id ออกจากคิวที่เพิ่งปิด
            await tx.queue.update({
                where: { queue_id: id },
                data: { branch_machine_id: null }
            })
            // หาคิวถัดไปที่รอ type เดียวกันในสาขาเดียวกัน (เรียงตาม created_at)
            const nextQueue = await tx.queue.findFirst({
                where: {
                    branch_id: machine.branch_id,
                    machine_type: queue.machine_type,
                    finished_at: null,
                    branch_machine_id: null,
                },
                orderBy: { created_at: "asc" }
            })
            // assign เครื่องให้คิวถัดไป + lock เครื่องอีกครั้ง
            if (nextQueue) {
                await tx.queue.update({
                    where: { queue_id: nextQueue.queue_id },
                    data: {
                        branch_machine_id: machine.branch_machine_id,
                        //clear estimated_start_at เพราะได้เครื่องแล้ว
                        estimated_start_at: null,
                        started_at: new Date()
                    }
                })
                await tx.branchMachine.update({
                    where: { branch_machine_id: machine.branch_machine_id },
                    data: { status: "UNAVAILABLE" }
                })
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
        //ดึงทุก queue ของ order นี้ (findMany แทน findFirst เพราะ 1 order มีหลาย queue ได้)
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