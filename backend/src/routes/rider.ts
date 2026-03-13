import express from 'express'
import {createRider , getRider} from '../controllers/riderController';

const router = express.Router()

router.post('/', createRider)
router.get('/',  getRider)


export default router