import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createOrderItem = async (req: Request, res: Response) => {
  const { order_id, main_service_id, quantity, subtotal } = req.body

  try {
    const orderItem = await prisma.orderItem.create({
      data: {
        order_id: Number(order_id),
        main_service_id: Number(main_service_id),
        quantity: Number(quantity),
        subtotal: Number(subtotal)
      }
    })

    res.json(orderItem)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create OrderItem" })
  }
}