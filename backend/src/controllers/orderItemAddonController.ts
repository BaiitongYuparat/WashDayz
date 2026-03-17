import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createItemAddon = async (req: Request, res: Response) => {
  const { order_item_id, addon_service_id } = req.body
  try {
    const itemAddon = await prisma.orderItemAddon.create({
      data: {
        order_item_id: (order_item_id),
        addon_service_id: (addon_service_id)
      }
    })

    res.json(itemAddon)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create ItemAddon" })
  }
}