import express from 'express'
import {createOrder , getOrder ,getOrdersById ,putOrderId ,deleteOrder , putOrderStatus , getOrdersByUser} from '../controllers/orderController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router()

router.post('/', createOrder)
router.get('/' ,getOrder)
router.get("/user/:userId", verifyToken, getOrdersByUser)
router.get('/:id' ,getOrdersById)
router.put('/:id' , putOrderId)
router.delete('/:id' , deleteOrder)
router.put('/status/:id', putOrderStatus)


export default router