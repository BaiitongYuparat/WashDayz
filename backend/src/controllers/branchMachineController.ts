import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"


// เพิ่มเครื่องให้สาขา สาขา A มีเครื่อง WASHER 10kg 3 เครื่อง 
export const addMachineToBranch = async (req: Request, res: Response) => {
  const { branch_id, machine_id, quantity = 1 } = req.body

  if (!branch_id || !machine_id) {
    return res.status(400).json({ message: "branch_id, machine_id are required" })
  }

  try {
    // สร้างหลายเครื่องพร้อมกัน
    const data = Array.from({ length: quantity }, () => ({
      branch_id,
      machine_id,
      status: "AVAILABLE" as const
    }))

    const result = await prisma.branchMachine.createMany({ data })

    return res.json({ message: `Added ${result.count} machine(s) to branch` })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

// ดูเครื่องทั้งหมดในสาขา
export const getMachinesByBranch = async (req: Request, res: Response) => {
  const id = req.params.id as string

  try {
    const machines = await prisma.branchMachine.findMany({
      where: { branch_id: id },
      include: { machine: true },
    })

    return res.json(machines)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

export const deleteMachineByBranchId = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    return res.status(400).json({ message: "Machine ID is required" })
  }

  try {
    const existing = await prisma.branchMachine.delete({
      where: { branch_machine_id: id }
    })
    res.json(existing)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

//ดูทั้งหมด
export const getAllMachines = async (req: Request, res: Response) => {
  try {
    const machines = await prisma.machine.findMany()
    return res.json(machines)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal server error" })
  }
}