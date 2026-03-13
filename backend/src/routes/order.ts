import express from 'express'
import {createOrder , getOrder ,getOrderId ,putOrderId ,deleteOrderId} from '../controllers/orderController';

const router = express.Router()

router.post('/', createOrder)
router.get('/' ,getOrder)
router.get('/:id' ,getOrderId)
router.put('/:id' , putOrderId)
router.delete('/:id' , deleteOrderId)


export default router