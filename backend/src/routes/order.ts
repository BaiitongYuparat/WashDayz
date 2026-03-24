import express from 'express'
import {createOrder , getOrder ,getOrderId ,putOrderId ,deleteOrderId} from '../controllers/orderController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router()
router.use(verifyToken);
router.post('/', createOrder)
router.get('/' ,getOrder)
router.get('/:id' ,getOrderId)
router.put('/:id' , putOrderId)
router.delete('/:id' , deleteOrderId)


export default router