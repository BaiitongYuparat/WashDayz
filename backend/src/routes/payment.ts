import express from "express"
import { createPayment , getPayment , getPaymentId , putPaymentId , deletePaymentId } from "../controllers/paymentController"

const router = express.Router()

router.post("/", createPayment)
router.get('/', getPayment)
router.get('/:id' ,getPaymentId)
router.put('/:id', putPaymentId)
router.delete('/id', deletePaymentId)

export default router