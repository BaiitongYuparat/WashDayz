import express from "express";
import {createMachine ,deleteMachineId , getMachine, getMachineByIds} from "../controllers/machineController"

const router = express.Router();

router.post("/", createMachine);
router.delete("/:id" ,deleteMachineId)
router.get('/',getMachine)
router.get('/by-ids',getMachineByIds)


export default router;