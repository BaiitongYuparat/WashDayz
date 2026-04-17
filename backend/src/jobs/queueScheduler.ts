import cron from "node-cron"
import { prisma } from "../../lib/prisma"
import { syncOrderStatus } from "../../lib/syncOrderStatus"

export function startQueueScheduler() {
    // รันทุก 10 วินาที
    cron.schedule("*/10 * * * * *", async () => {
        console.log("[Scheduler] Checking expired queues...")

        try {
            await prisma.$transaction(async (tx) => {
                // หา queue ที่
                // 1. ได้เครื่องแล้ว (branch_machine_id ไม่ null)
                // 2. ยังไม่ finish
                const expiredQueues = await tx.queue.findMany({
                    where: {
                        finished_at: null,
                        branch_machine_id: { not: null },
                    },
                    include: {
                        branchMachine: {
                            include: { machine: true }
                        }
                    }
                })

                for (const queue of expiredQueues) {
                    // ถ้า started_at เป็น null (queue เก่าที่หลุดมา) → patch ให้เริ่มนับเวลาตอนนี้แล้วข้ามรอบนี้
                    if (!queue.started_at) {
                        console.log(`[Scheduler] Patching missing started_at for queue ${queue.queue_id}`)
                        await tx.queue.update({
                            where: { queue_id: queue.queue_id },
                            data: { started_at: new Date() }
                        })
                        continue
                    }

                    const duration =
                        queue.branchMachine?.machine?.duration_minutes ?? 30
                    const startedAt = queue.started_at
                    const finishTime = new Date(
                        startedAt.getTime() + duration * 60 * 1000
                    )

                    // ยังไม่ถึงเวลา → ข้าม
                    if (new Date() < finishTime) continue

                    console.log(`[Scheduler] Finishing queue ${queue.queue_id}`)

                    // ปิด queue
                    await tx.queue.update({
                        where: { queue_id: queue.queue_id },
                        data: { finished_at: new Date() }
                    })

                    // คืนเครื่อง
                    await tx.branchMachine.update({
                        where: {
                            branch_machine_id: queue.branch_machine_id!
                        },
                        data: { status: "AVAILABLE" }
                    })

                    // ถอด machine ออกจาก queue
                    await tx.queue.update({
                        where: { queue_id: queue.queue_id },
                        data: { branch_machine_id: null }
                    })

                    // หาคิวถัดไปที่รออยู่ type เดียวกัน
                    const nextQueue = await tx.queue.findFirst({
                        where: {
                            branch_id: queue.branch_id,
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
                                branch_machine_id: queue.branch_machine_id,
                                estimated_start_at: null,
                                started_at: new Date()
                            }
                        })
                        await tx.branchMachine.update({
                            where: {
                                branch_machine_id: queue.branch_machine_id!
                            },
                            data: { status: "UNAVAILABLE" }
                        })
                    }
                    

                    // sync order status
                    await syncOrderStatus(tx, queue.order_id)
                    
                    
                }
            })
        } catch (error) {
            console.error("[Scheduler] Error:", error)
        }
    })

    console.log("[Scheduler] Queue scheduler started")
}

