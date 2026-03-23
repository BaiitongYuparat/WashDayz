import express from 'express'
import  {createService , getService , deleteService} from '../controllers/serviceController'

const router = express.Router()

router.post('/' ,createService)
router.get('/', getService)
router.delete('/' , deleteService)

export default router