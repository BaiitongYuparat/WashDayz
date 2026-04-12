import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"


export const createAddonService = async (req: Request, res: Response) => {
    const { name, description, price , type } = req.body

    try {
        const addonservice = await prisma.addonService.create({
            data: {
                name,
                description,
                price,
                type
                
            }
        })

        res.json(addonservice)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create addonService' })
    }
}

export const getAddonService = async (req: Request, res: Response) => {
    try {
        const service = await prisma.addonService.findMany()
        res.json(service)
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch service" })
    }
}

export const getAddonServiceId = async (req: Request, res: Response) => {
    const id = req.params.id as string

    try {
        const service = await prisma.addonService.findUnique({
            where: {
                addon_service_id: id
            }
        })
        if (!service) {
            return res.status(404).json({ error: "AddonService not found" })
        }

        res.json(service)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch addonService' })
    }
}

export const putAddonServiceId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const { name, description, price , type } = req.body

    try {
        const service = await prisma.addonService.update({
            where: {
                addon_service_id: id
            },
            data: {
                name,
                description,
                price,
                type
            }
        })

        res.json(service)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to update addonService' })
    }
}

export const deleteAddonServiceId = async (req: Request, res: Response) => {
    const id = req.params.id as string

    try {
        await prisma.orderItemAddon.deleteMany({
            where: { addon_service_id: id },
        });

        await prisma.service.deleteMany({
            where: { addon_service_id: id },
        });

        // ค่อยลบตัวแม่
        const service = await prisma.addonService.delete({
            where: { addon_service_id: id },
        });


        res.json(service)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to delete addonService' })
    }
}

export const getAddonByIds = async (req: Request, res: Response) => {
  try {
    const ids = (req.query.ids as string)?.split(",")

    const addons = await prisma.addonService.findMany({
      where: {
        addon_service_id: {
          in: ids,
        },
      },
    })

    return res.json(addons)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal server error" })
  }
}