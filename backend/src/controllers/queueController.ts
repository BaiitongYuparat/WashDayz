// import { Request, Response } from "express"
// import { prisma } from "../../lib/prisma"

// export const createQueue = async (req: Request, res: Response) => {
//      const { order_id, branch_id } = req.body
//     try {
//         if (!order_id || !branch_id) {
//             return res.status(400).json({ message: "order_id and branch_id are required" })
//         }

//         // ใช้ transaction กัน race condition
//         const result = await prisma.$transaction(async (tx) => {

//             //เช็ค order
//             const order = await tx.order.findUnique({
//                 where: { order_id }
//             })

//             if (!order) {
//                 throw new Error("ORDER_NOT_FOUND")
//             }

//             // เช็คว่า order นี้มี queue แล้วหรือยัง
//             const existingQueue = await tx.queue.findUnique({
//                 where: { order_id }
//             })

//             if (existingQueue) {
//                 throw new Error("QUEUE_ALREADY_EXISTS")
//             }

//             // หา queue ล่าสุดของ branch
//             const lastQueue = await tx.queue.findFirst({
//                 where: { branch_id },
//                 orderBy: { queue_number: "desc" }
//             })

//             const nextQueueNumber = lastQueue
//                 ? lastQueue.queue_number + 1
//                 : 1



//             // สร้าง queue
//             const queue = await tx.queue.create({
//                 data: {
//                     order_id,
//                     branch_id,
//                     queue_number: nextQueueNumber,
//                 }
//             })

//             // หาเครื่องว่าง
//             const machine = await tx.machine.findFirst({
//                 where: {
//                     branch_id,
//                     status: "AVAILABLE"
//                 }
//             })

//             // ถ้ามีเครื่อง → assign
//             if (machine) {
//                 // 1. ใส่ machine_id ให้ queue
//                 await tx.queue.update({
//                     where: { queue_id: queue.queue_id },
//                     data: {
//                         machine_id: machine.machine_id
//                     }
//                 })

//                 // 2. เปลี่ยนสถานะเครื่อง
//                 await tx.machine.update({
//                     where: { machine_id: machine.machine_id },
//                     data: {
//                         status: "UNAVAILABLE"
//                     }
//                 })
//             }

//             return queue
//         })

//         return res.status(201).json({
//             message: "Queue created successfully",
//             data: result
//         })

//     } catch (error: any) {
//         console.error("CREATE QUEUE ERROR:", error)

//         //handle error แบบชัดเจน
//         if (error) {
//             return res.status(404).json({
//                 message: "Order not found"
//             })
//         }

//         if (error) {
//             return res.status(400).json({
//                 message: "Queue already exists for this order"
//             })
//         }

//         //กัน queue_number ซ้ำ
//         if (error) {
//             return res.status(409).json({
//                 message: "Queue number conflict, please retry"
//             })
//         }

//         return res.status(500).json({
//             message: "Internal server error"
//         })

//     }

// }

// //ดูคิวแยกสาขา
// export const getQueu = async (req: Request, res: Response) => {
//     const { branch_id } = req.query
//     try {
//         const queue = await prisma.queue.findMany({
//             where:                            //กรณีมี         |  //กรณีไม่มีดึงทั้งหมด
//                 branch_id ? { branch_id: String(branch_id) } : {},
//             orderBy: { queue_number: "asc" } //แรียงจากน้อยไปมาห
//         })
//         res.json(queue)
//     }
//     catch (error) {
//         res.status(500).json({ error: 'Failed to fetch queu' })
//     }
// }

// //ดูคิว
// export const getQueuId = async (req: Request, res: Response) => {
//     const id = req.params.id as string
//     try {
//         const queue = await prisma.queue.findUnique({
//             where: {
//                 queue_id: id
//             }
//         })
//         if (!queue) {
//             return res.status(404).json({ message: "Queue not found" })
//         }
//         res.json(queue)
//     }
//     catch (error) {
//         res.status(500).json({ error: 'Failed to fetch queu' })
//     }
// }


// //ลบคอว
// export const deleteQueuId = async (req: Request, res: Response) => {
//     const id = req.params.id as string
//     try {
//         const queue = await prisma.queue.delete({
//             where: {
//                 queue_id: id
//             }
//         })
//         res.json(queue)
//     }
//     catch (error: any) {
//         if (error) {
//             return res.status(404).json({ message: "Queue not found" })
//         }
//         res.status(500).json({ error: 'Failed to delete queu' })
//     }
// }


// // //ดูคิวที่รอ
// // export const getWaitingQueue = async (req: Request, res: Response) => {
// //     const { branch_id , status } = req.query

// //     try {
// //         const queue = await prisma.queue.findMany({
// //             where: {
// //                  ...(branch_id && { branch_id: String(branch_id) }),
// //             },
// //             orderBy: { queue_number: "asc" }
// //         })

// //         res.json(queue)
// //     } catch (error) {
// //         res.status(500).json({ error: "Failed to fetch waiting queue" })
// //     }
// // }


// // //ดูคิวที่เสร็จ
// // export const getFinishedQueue = async (req: Request, res: Response) => {
// //     const { branch_id } = req.query

// //     try {
// //         const queue = await prisma.queue.findMany({
// //             where: {
// //                 ...(branch_id && { branch_id: String(branch_id) })
// //             },
// //             orderBy: { finished_at: "desc" }
// //         })

// //         res.json(queue)
// //     } catch (error) {
// //         res.status(500).json({ error: "Failed to fetch finished queue" })
// //     }
// // }

// //ปิดคิว
// export const finishQueue = async (req: Request, res: Response) => {
//     const id = req.params.id as string

//     try {
//         const result = await prisma.$transaction(async (tx) => {

//             // update queue
//             const queue = await tx.queue.update({
//                 where: { queue_id: id },
//                 data: {
//                     finished_at: new Date()
//                 }
//             })

//             // หา machine จาก queue
//             const machine = queue.machine_id
//                 ? await tx.machine.findUnique({
//                     where: { machine_id: queue.machine_id }
//                 })
//                 : null

//             if (machine) {
//                 // คืนเครื่อง
//                 await tx.machine.update({
//                     where: { machine_id: machine.machine_id },
//                     data: {
//                         status: "AVAILABLE"
//                     }
//                 })

//                 // เอา machine ออกจาก queue
//                 await tx.queue.update({
//                     where: { queue_id: id },
//                     data: {
//                         machine_id: null
//                     }
//                 })

//                 // หา queue ถัดไป (ที่ยังไม่มีเครื่อง)
//                 const nextQueue = await tx.queue.findFirst({
//                     where: {
//                         // branch_id: machine.branch_id,
//                         finished_at: null,
//                         machine_id: null
//                     },
//                     orderBy: {
//                         created_at: "asc"
//                     }
//                 })

//                 if (nextQueue) {
//                     // assign เครื่องให้ queue ถัดไป
//                     await tx.queue.update({
//                         where: { queue_id: nextQueue.queue_id },
//                         data: {
//                             machine_id: machine.machine_id
//                         }
//                     })

//                     await tx.machine.update({
//                         where: { machine_id: machine.machine_id },
//                         data: {
//                             status: "UNAVAILABLE"
//                         }
//                     })
//                 }
//             }

//             return queue
//         })

//         res.json(result)

//     } catch (error: any) {
//         if (error) {
//             return res.status(404).json({ message: "Queue not found" })
//         }

//         res.status(500).json({ error: "Failed to finish queue" })
//     }
// }


// //รีเซ็ตคิว
// export const resetQueue = async (req: Request, res: Response) => {
//     const id = req.params.id as string

//     try {
//         const queue = await prisma.queue.update({
//             where: { queue_id: id },
//             data: {
//                 finished_at: null
//             }
//         })

//         res.json(queue)
//     } catch (error) {
//         res.status(500).json({ error: "Failed to reset queue" })
//     }
// }