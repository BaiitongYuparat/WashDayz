import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"


export const createPayment = async (req: Request, res: Response) => {
  const { order_id, payment_method } = req.body

  try {
    // ตรวจสอบ required fields
    if (!order_id || !payment_method) {
      return res.status(400).json({ error: "order_id and payment_method are required" })
    }

    // เช็คว่า order มีอยู่จริงไหม
    const existingOrder = await prisma.order.findUnique({ where: { order_id } })
    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" })
    }

    // เช็คว่า order นี้มี payment อยู่แล้วหรือยัง (order_id เป็น unique)
    const existingPayment = await prisma.payment.findUnique({ where: { order_id } })
    if (existingPayment) {
      return res.status(409).json({ error: "Payment already exists for this order" })
    }

    // สร้าง payment โดย status เริ่มต้นเป็น PENDING เสมอ
    const payment = await prisma.payment.create({
      data: {
        order_id,
        payment_method,
        status: "PENDING",
      },
    })

    res.status(201).json(payment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create payment" })
  }
}

// ดึง payment ทั้งหมด พร้อม pagination
export const getPayment = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100) // max 100 ต่อหน้า

  try {
    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          order: {
            include: {
              user: true,
              branch: true,
              items: {
                include: {
                  machine: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.count(),
    ])

    res.json({
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch payments" })
  }
}


export const getPaymentId = async (req: Request, res: Response) => {
  const id = req.params.id as string

  try {
    const payment = await prisma.payment.findUnique({
      where: { payment_id: id },
      include: {
        order: {
          include: {
            user: true,
            branch: true,
            items: {
              include: {
                machine: true,
              },
            },
          },
        },
      },
    })

    // หาไม่เจอ
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    res.json(payment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch payment" })
  }
}

// อัปเดต payment และ sync Order status
export const putPaymentId = async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { payment_method, status, paid_at } = req.body

  try {
    // เช็คว่า payment มีอยู่จริงไหม
    const existingPayment = await prisma.payment.findUnique({
      where: { payment_id: id },
    })
    if (!existingPayment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    // ใช้ transaction เพื่อ update payment และ order พร้อมกัน
    const payment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { payment_id: id },
        data: {
          ...(payment_method && { payment_method }),
          ...(status && { status }),
          paid_at: paid_at ? new Date(paid_at) : status === "PAID" ? new Date() : undefined,
        },
      })

      // ถ้า payment สำเร็จ ให้เปลี่ยน Order status เป็น WASHING
      if (status === "PAID") {
        await tx.order.update({
          where: { order_id: updated.order_id },
          data: { status: "WASHING" },
        })
      }

      return updated
    })

    res.json(payment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to update payment" })
  }
}

// ลบ payment ห้ามลบถ้า PAID แล้ว
export const deletePaymentId = async (req: Request, res: Response) => {
  const id = req.params.id as string

  try {
    // เช็คว่า payment มีอยู่จริงไหม
    const existingPayment = await prisma.payment.findUnique({
      where: { payment_id: id },
    })
    if (!existingPayment) {
      return res.status(404).json({ error: "Payment not found" })
    }

    // ห้ามลบ payment ที่จ่ายแล้ว
    if (existingPayment.status === "PAID") {
      return res.status(400).json({ error: "Cannot delete a completed payment" })
    }

    const payment = await prisma.payment.delete({
      where: { payment_id: id },
    })

    res.json({ message: "Payment deleted successfully", payment })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to delete payment" })
  }
}

export const getPaymentByOrderId = async (req: Request, res: Response) => {
  const order_id = req.params.order_id as string
  try {
    const payment = await prisma.payment.findUnique({
      where: { order_id },
    })
    if (!payment) return res.status(404).json({ error: "Payment not found" })
    res.json(payment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch payment" })
  }
}