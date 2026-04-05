import express from 'express'
import  {createService , getService , deleteService,getServiceByMainServiceId} from '../controllers/serviceController'

const router = express.Router()

router.post('/' ,createService)
router.get('/', getService)
router.delete('/' , deleteService)
router.get('/addons', getServiceByMainServiceId); 

export default router