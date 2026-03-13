import express from 'express'
import { createAddresses , deleteAddress , getAddress ,getAddressId ,putAddress } from '../controllers/addressesController';

const router = express.Router()

router.post('/', createAddresses)
router.delete('/:id',deleteAddress )
router.get('/' ,getAddress)
router.get('/:id', getAddressId)
router.put('/:id' , putAddress)

export default router