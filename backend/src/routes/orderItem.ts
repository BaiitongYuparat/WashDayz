import {createOrderItem , deleteOrderItem} from '../controllers/orderItemController'
import  express  from 'express'

const router = express.Router()

router.post('/',createOrderItem)
router.delete('/:id', deleteOrderItem)



export default router