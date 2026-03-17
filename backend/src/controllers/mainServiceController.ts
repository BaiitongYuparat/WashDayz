import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"


export const createMainService = async (req: Request, res: Response) => {
    const { name, description, price_per_unit } = req.body
    try {
        const mainservice = await prisma.mainService.create({
            data: {
                name,
                description,
                price_per_unit
            }
        })
        res.json(mainservice)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to create mainService' })
    }
}

export const getMainService = async (req: Request, res: Response) => {
    try {
        const mainservice = await prisma.mainService.findMany();
        res.json(mainservice)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch mainService' })
    }
}

export const getMainServiceId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const mainservice = await prisma.mainService.findUnique({
            where: {
                main_service_id: id
            }
        });
        res.json(mainservice)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch mainService' })
    }
}

export const putMainServiceId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const { name, description, price_per_unit } = req.body
    try {
        const mainservice = await prisma.mainService.update({
            where: {
                main_service_id: id
            },
            data: {
                name,
                description,
                price_per_unit
            }
        });
        res.json(mainservice)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to update mainService' })
    }
}

export const deleteMainServiceId = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const mainservice = await prisma.mainService.delete({
            where: {
                main_service_id: id
            }
        });
        res.json(mainservice)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to delete mainService' })
    }
}