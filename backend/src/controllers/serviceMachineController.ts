import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

//ดู mainservice machine ทั้งหมด
export const getAllMainServiceMachines = async (req: Request, res: Response) => {
    try {
        const data = await prisma.mainServiceMachine.findMany({
            include: {
                mainService: true,
                machine: true,
            },
        })
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error })
    }
}

//ดู mainservice ทั้งหมดของ machine ตาม machine_id
export const getMainServicesByMachine = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string

        const data = await prisma.mainServiceMachine.findMany({
            where: { machine_id: id },
            include: {
                mainService: true,
                machine: true,
            },
        })
        if (!data.length) {
            res.status(404).json({ message: "No main services found for this machine" })
            return
        }
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error })
    }
}

//เพิ่ม mainservice ให้ machine
export const createMainServiceToMachine = async (req: Request, res: Response) => {
    try {
        const { machine_id, main_service_id } = req.body

        if (!machine_id || !main_service_id) {
            res.status(400).json({ message: "machine_id and main_service_id are required" })
            return
        }
        const data = await prisma.mainServiceMachine.create({
            data: {
                machine_id,
                main_service_id,
            },
            include: {
                mainService: true,
                machine: true,
            },
        })
        res.status(201).json(data)
    } catch (error: any) {
        
        //กรณี unique constraint
        if (error.code === "P2002") {
            res.status(409).json({ message: "This main service is already assigned to the machine" })
            return
        }
         console.error("ERROR:", error) 
        res.status(500).json({ message: "Internal server error", error })
    }
}

// ลบ mainservice ออกจาก machine
export const deleteMainServiceFromMachine = async (req: Request, res: Response) => {
    const id = req.params.id as string
    try {
        const existing = await prisma.mainServiceMachine.findUnique({
            where: {
                main_service_id_machine_id: {
                    main_service_id: id,
                    machine_id: id,
                },
            },
        })
        if (!existing) {
            res.status(404).json({ message: "Record not found" })
            return
        }
        await prisma.mainServiceMachine.delete({
            where: {
                main_service_id_machine_id: {
                    main_service_id: id,
                    machine_id: id,
                },
            },
        })

        res.status(200).json({ message: "Main service removed from machine successfully" })
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error })
    }
}

export const getMachinesByMainService = async (req: Request, res: Response) => {
  try {
    const id  = req.params.id as string

    const data = await prisma.mainServiceMachine.findMany({
  where: { main_service_id: id },
  include: { machine: true },
});

res.json(data.map((d) => d.machine));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};