import express from 'express'
import {addMachineToBranch , getMachinesByBranch , deleteMachineByBranchId} from '../controllers/branchMachineController'

const router = express.Router()

router.post("/",addMachineToBranch)
router.get("/:id", getMachinesByBranch)
router.delete("/:id" , deleteMachineByBranchId)

export default router;