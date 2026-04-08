import express from "express";
import {getAllMainServiceMachines , getMainServicesByMachine , createMainServiceToMachine , deleteMainServiceFromMachine } from  '../controllers/serviceMachineController'

const router = express.Router();

router.get("/main-service-machine", getAllMainServiceMachines)
router.get("/main-service-machine/:machine_id", getMainServicesByMachine)
router.post("/", createMainServiceToMachine)
router.delete("/:id", deleteMainServiceFromMachine)

export default router;