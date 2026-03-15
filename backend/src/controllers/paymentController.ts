import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createPayment = async (req: Request, res: Response) => {
  const { order_id, payment_method, status, transaction_ref, paid_at } = req.body

  try {
    const payment = await prisma.payment.create({
      data: {
        order_id: Number(order_id),
        payment_method,
        status,
        transaction_ref, // generate เอง
        paid_at: paid_at ? new Date(paid_at) : null
      }
    })

    res.json(payment)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create payment" })
  }
}