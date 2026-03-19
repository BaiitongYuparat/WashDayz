import {createItemAddon} from '../controllers/orderItemAddonController'
import  express  from 'express'

const router = express.Router()

router.post('/', createItemAddon)


export default router