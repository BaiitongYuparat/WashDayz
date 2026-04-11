import express from 'express'
import { createAddresses , deleteAddress , getAddress ,getAddressId ,putAddress } from '../controllers/addressesController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router()

router.use(verifyToken)
router.post('/', createAddresses)
router.delete('/:id',deleteAddress )
router.get('/' ,getAddress)
router.get('/:id', getAddressId)
router.put('/:id' , putAddress)


export default router