import { PrismaClient, Prisma } from "@prisma/client"

type TX = Prisma.TransactionClient

/**
 * ดู queues ทั้งหมดของ order แล้วคำนวณว่า order ควรเป็น status อะไร
 * เรียกใช้ภายใน $transaction เท่านั้น
 */
export const syncOrderStatus = async (tx: any, order_id: string) => {
    const queues = await tx.queue.findMany({
        where: { order_id }
    })

    if (!queues.length) return

    const allFinished = queues.every((q: any) => q.finished_at !== null)
    const allAssigned = queues.every((q: any) => q.branch_machine_id !== null || q.finished_at !== null)
    // ↑ นับ queue ที่เสร็จแล้วว่า "ผ่าน" ด้วย

    let status: "WAITING" | "WASHING" | "FINISHED"

    if (allFinished) {
        status = "FINISHED"
    } else if (allAssigned) {
        // ทุก queue ได้เครื่องหมดแล้ว (หรือเสร็จไปแล้ว)
        status = "WASHING"
    } else {
        // ยังมี queue ที่รอเครื่องอยู่
        status = "WAITING"
    }

    await tx.order.update({
        where: { order_id },
        data: { status }
    })
}