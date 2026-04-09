import express from "express";
import {getAllMainServiceMachines , getMainServicesByMachine , createMainServiceToMachine , deleteMainServiceFromMachine,getMachinesByMainService } from  '../controllers/serviceMachineController'

const router = express.Router();

router.get("/", getAllMainServiceMachines)
router.get("/:id", getMainServicesByMachine)
router.post("/", createMainServiceToMachine)
router.delete("/:id", deleteMainServiceFromMachine)
router.get("/by-main-service/:id", getMachinesByMainService) //ดึงว่าmachine มี mainservice อะไรบ้าง

export default router;