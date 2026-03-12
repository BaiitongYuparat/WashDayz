import {createBranch , getBranch , getBranchId , putBranchId , deleteBranch} from '../controllers/branchController'
import express from 'express'

const router = express.Router()

router.post('/', createBranch)
router.get('/', getBranch)
router.get('/:id', getBranchId)
router.put('/:id', putBranchId)
router.delete('/:id', deleteBranch)



export default router