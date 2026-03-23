import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createItemAddon = async (req: Request, res: Response) => {
  const { order_item_id, addon_service_id } = req.body
  try {
     if (!order_item_id || !addon_service_id) {
      return res.status(400).json({ error: "Missing required fields" })
    }
     // กัน add ซ้ำ
    const existing = await prisma.orderItemAddon.findFirst({
      where: {
        order_item_id,
        addon_service_id
      }
    })
     if (existing) {
      return res.status(400).json({ error: "Addon already added to this item" })
    }

     const itemAddon = await prisma.orderItemAddon.create({
      data: {
        order_item_id ,
        addon_service_id
      }
      ,
      include: {
        addonService: true
      }
    })


    res.json(itemAddon)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to create ItemAddon" })
  }
}