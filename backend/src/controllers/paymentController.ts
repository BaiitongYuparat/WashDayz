import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createPayment = async (req: Request, res: Response) => {
  const { order_id, payment_method, status, paid_at } = req.body
  try {
    if (!order_id || !payment_method || !status) {
      return res.status(400).json({ error: "order_id, payment_method, and status are required" })
    }

    const payment = await prisma.payment.create({
      data: {
        order_id: (order_id),
        payment_method,
        status,
        paid_at: paid_at ? new Date(paid_at) : null
      }
    })

    res.json(payment)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create payment" })
  }
}

export const getPayment = async (req: Request, res: Response) => {
  try {
    const payment = await prisma.payment.findMany()
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment" });
  }
}


export const getPaymentId = async (req: Request, res: Response) => {
  const id = req.params.id as string
  try {
    const payment = await prisma.payment.findUnique({
      where: {
        payment_id: id
      }
    })
    res.json(payment)
  }
  catch (error) {
    res.status(500).json({ error: "Failed to fetch payment" });
  }
}

export const putPaymentId = async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { order_id, payment_method, status, paid_at } = req.body

  try {
    const payment = await prisma.payment.update({
      where: {
        payment_id: id
      },
      data: {
        order_id: (order_id),
        payment_method,
        status,
        paid_at: paid_at ? new Date(paid_at) : null
      }
    })
    res.json(payment)
  }
  catch {
    res.status(500).json({ error: "Failed to update payment" });
  }
}


export const deletePaymentId = async (req: Request , res: Response) => {
  const id = req.params.id as string
  try {
    const payment = await prisma.payment.delete({
      where: {
        payment_id: id
      }
    })
    res.json(payment)
  }
  catch {
     res.status(500).json({ error: "Failed to update payment" });
  }
}