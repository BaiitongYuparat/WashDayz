import express from 'express'
import {addMachineToBranch , getMachinesByBranch , deleteMachineByBranchId , getAllMachines} from '../controllers/branchMachineController'

const router = express.Router()

router.get("/machines", getAllMachines)  
router.get("/:id", getMachinesByBranch)
router.post("/", addMachineToBranch)
router.delete("/:id", deleteMachineByBranchId)

export default router;