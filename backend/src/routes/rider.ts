import express from 'express'
import {createRider , getRider , getRiderId , putRiderId , deleteRiderId} from '../controllers/riderController';

const router = express.Router()

router.post('/', createRider)
router.get('/',  getRider)
router.get('/:id' , getRiderId)
router.put('/:id' ,putRiderId)
router.delete('/:id' , deleteRiderId)


export default router