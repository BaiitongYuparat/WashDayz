import express from 'express'
import {createOrder , getOrder ,getOrdersById ,putOrderId ,deleteOrder , putOrderStatus} from '../controllers/orderController';


const router = express.Router()

router.post('/', createOrder)
router.get('/' ,getOrder)
router.get('/:id' ,getOrdersById)
router.put('/:id' , putOrderId)
router.delete('/:id' , deleteOrder)
router.put('/status/:id', putOrderStatus)



export default router