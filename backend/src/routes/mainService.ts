import express from 'express'
import {createmainService} from '../controllers/mainServiceController'

const router = express.Router()


router.post('/' ,createmainService)

export default router