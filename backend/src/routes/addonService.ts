import express from 'express'
import {createAddonService , getAddonService ,getAddonServiceId ,putAddonServiceId ,deleteAddonServiceId} from '../controllers/addonServiceController'


const router = express.Router()

router.post('/', createAddonService)
router.get('/',getAddonService)
router.get('/:id',getAddonServiceId)
router.put('/:id', putAddonServiceId)
router.delete('/:id' ,deleteAddonServiceId)

export default router