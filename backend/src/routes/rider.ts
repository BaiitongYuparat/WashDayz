import express from 'express'
import {createRider} from '../controllers/riderController';

const router = express.Router()

router.post('/', createRider)


export default router