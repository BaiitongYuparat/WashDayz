import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"


export const createMachine = async (req: Request, res: Response) => {
    const { type, capacity, duration_minutes, price } = req.body
    if (!type || !capacity || !duration_minutes || !price) {
        return res.status(400).json({
            message: "type, capacity, duration_minutes, price are required"
        })
    }
    try {
        const machine = await prisma.machine.create({
            data: {
                type,
                capacity,
                duration_minutes,
                price
            }
        })
        res.json(machine)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }

}

export const deleteMachineId = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
        return res.status(400).json({ message: "Machine ID is required" })
    }

    try {
        const existing =  await prisma.machine.delete({
            where: { machine_id: id }
        })
        res.json(existing)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getMachine = async (req: Request, res: Response) => {
    try {
        const machines = await prisma.machine.findMany()
        return res.json(machines) 
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}