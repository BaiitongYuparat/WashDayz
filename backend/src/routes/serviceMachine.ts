import express from "express";
import {getAllMainServiceMachines , getMainServicesByMachine , createMainServiceToMachine , deleteMainServiceFromMachine,getMachinesByMainService } from  '../controllers/serviceMachineController'

const router = express.Router();

router.get("/main-service-machine", getAllMainServiceMachines)
router.get("/:id", getMainServicesByMachine)
router.post("/", createMainServiceToMachine)
router.delete("/:id", deleteMainServiceFromMachine)
router.get("/by-main-service/:id", getMachinesByMainService)

export default router;