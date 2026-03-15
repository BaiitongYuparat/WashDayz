import express from 'express'
import {createMainService , getMainService , getMainServiceId ,putMainServiceId ,deleteMainServiceId} from '../controllers/mainServiceController'

const router = express.Router()


router.post('/' ,createMainService)
router.get('/',getMainService)
router.get('/:id',getMainServiceId)
router.put('/:id' ,putMainServiceId)
router.delete('/:id' , deleteMainServiceId)

export default router