import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"


export const createAddonService = async (req: Request, res: Response) => {
    const { name, description, price } = req.body
    try {
        const addonservice = await prisma.addonService.create({
            data: {
                name,
                description,
                price
            }
        })
        res.json(addonservice)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create mainService' })
    }
}

export const getAddonService = async (req: Request, res: Response) => {
    try {
        const service = await prisma.addonService.findMany();
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch service" });
    }
}

export const getAddonServiceId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const service = await prisma.addonService.findUnique({
            where: {
                addon_service_id: id
            }
        })
        res.json(service);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch  mainService' })
    }
}

export const putAddonServiceId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { name, description, price } = req.body
    try {
        const service = await prisma.addonService.update({
            where: {
                addon_service_id: id
            },
            data: {
                name,
                description,
                price
            }
        })
        res.json(service);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to update mainService' })
    }
}

export const deleteAddonServiceId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const service = await prisma.addonService.delete({
            where: {
                addon_service_id: id
            }
        })
        res.json(service);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to delete mainService' })
    }
}

