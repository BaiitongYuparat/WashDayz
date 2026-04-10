import express from "express";
import {createMachine ,deleteMachineId , getMachine} from "../controllers/machineController"

const router = express.Router();

router.post("/", createMachine);
router.delete("/:id" ,deleteMachineId)
router.get('/',getMachine)
router.get('/:id',getMachine)


export default router;