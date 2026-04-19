import express from 'express'
import {createAddonService , getAddonService ,getAddonServiceId ,putAddonServiceId ,deleteAddonServiceId,uploadAddonImage,upload} from '../controllers/addonServiceController'


const router = express.Router()

router.post('/', createAddonService)
router.get('/',getAddonService)
router.get('/:id',getAddonServiceId)
router.put('/:id', putAddonServiceId)
router.delete('/:id' ,deleteAddonServiceId)
router.post("/addon", upload.single("file"), uploadAddonImage);

export default router