import express from 'express'
import {createAddonService , getAddonService ,getAddonServiceId ,putAddonServiceId ,deleteAddonServiceId , getAddonByIds} from '../controllers/addonServiceController'


const router = express.Router()

router.post('/', createAddonService)
router.get('/',getAddonService)
router.get("/by-ids", getAddonByIds)
router.get('/:id',getAddonServiceId)
router.put('/:id', putAddonServiceId)
router.delete('/:id' ,deleteAddonServiceId)


export default router