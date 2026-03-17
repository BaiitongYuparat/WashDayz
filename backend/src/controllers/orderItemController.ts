import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createOrderItem = async (req: Request, res: Response) => {
  const { order_id, main_service_id, quantity, subtotal } = req.body
  try {
    const orderItem = await prisma.orderItem.create({
      data: {
        order_id: (order_id),
        main_service_id: (main_service_id),
        quantity: (quantity),
        subtotal: (subtotal)
      }
    })

    res.json(orderItem)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create OrderItem" })
  }
}