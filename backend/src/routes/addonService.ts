import express from 'express'
import {createaddonService} from '../controllers/addonServiceController'


const router = express.Router()

router.post('/', createaddonService)


export default router