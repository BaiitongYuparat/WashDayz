import express from 'express'
import {createOrder , getOrder ,getOrderId ,putOrderId ,deleteOrderId , putOrderStatus} from '../controllers/orderController';


const router = express.Router()

router.post('/', createOrder)
router.get('/' ,getOrder)
router.get('/:id' ,getOrderId)
router.put('/:id' , putOrderId)
router.delete('/:id' , deleteOrderId)
router.put('/status/:id', putOrderStatus)


export default router