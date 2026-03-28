import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createMachine = async (req: Request, res: Response) => {
    try {
        const { branch_id, machines } = req.body

        if (!branch_id || !machines || !Array.isArray(machines)) {
            return res.status(400).json({
                message: "branch_id and machines[] are required"
            })
        }

        const branch = await prisma.branch.findUnique({
            where: { branch_id }
        })

        if (!branch) {
            return res.status(404).json({
                message: "Branch not found"
            })
        }

        // 🔥 ตรงนี้คือหัวใจ
        const data: any[] = []

        for (const m of machines) {
            const total = m.total || 1

            for (let i = 0; i < total; i++) {
                data.push({
                    branch_id,
                    type: m.type,
                    capacity: m.capacity
                })
            }
        }

        const result = await prisma.machine.createMany({
            data
        })

        return res.status(201).json({
            message: "Machines created successfully",
            total_created: result.count
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const countMachines = async (req: Request, res: Response) => {
    const { branch_id } = req.query
    try {
        if (!branch_id) {
            return res.status(400).json({
                message: "branch_id is required"
            })
        }

        const total = await prisma.machine.count({
            where: {
                branch_id: String(branch_id)
            }
        })

        return res.json({
            branch_id,
            total_machines: total
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
}