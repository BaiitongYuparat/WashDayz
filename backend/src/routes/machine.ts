import express from "express";
import {createMachine , countMachines} from "../controllers/machineController"

const router = express.Router();

router.post("/", createMachine);
router.get("/:id" ,countMachines)


export default router;