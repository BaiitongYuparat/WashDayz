import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createBranch = async (req: Request, res: Response) => {
    const { branch_name } = req.body
    try {
        const branch = await prisma.branch.create({
            data: {
                branch_name
            }
        })
        res.json(branch)

    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Failed to create branch" })
    }
}

export const getBranch = async (req: Request, res: Response) => {
    try {
        const branch = await prisma.branch.findMany();
        res.json(branch);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch branch' })
    }
}

export const getBranchId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const branch = await prisma.branch.findUnique({
            where: {
                branch_id: id
            }
        })
        if (!branch) {
            return res.status(404).json({ error: 'Branch not found' })
        }
        res.json(branch)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Branch' })
    }
}


export const putBranchId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { branch_name } = req.body

    try {
        const branch = await prisma.branch.update({
            where: { branch_id: id },
            data: { branch_name }
        })
        res.json(branch);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Branch' })
    }
}


export const deleteBranch = async (req: Request , res : Response) => {
     const id = Number(req.params.id)
    try {
        const branch = await prisma.branch.delete({
            where: {
                branch_id: id
            }
        });
        res.json({
            message: 'Branch deleted successfully',
            user: branch
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete branch' });
    }
}