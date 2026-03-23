import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createOrderItem = async (req: Request, res: Response) => {
  const { order_id, main_service_id, quantity, subtotal } = req.body
  try {
    if (!order_id || !main_service_id || !quantity || !subtotal) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const orderItem = await prisma.orderItem.create({
      data: {
        order_id: order_id,
        main_service_id: main_service_id,
        quantity: Number(quantity),
        subtotal: Number(subtotal)
      }
    })

    res.status(201).json(orderItem)

  } catch (error) {
    console.error("CREATE ORDER ITEM ERROR:", error)
    res.status(500).json({ error: "Failed to create OrderItem" })
  }
}