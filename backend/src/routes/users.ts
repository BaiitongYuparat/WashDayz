import express from 'express'
import { createUser ,getUser ,getUserId ,putUserId ,deleteUserId} from '../controllers/userController'


const router = express.Router()

router.post('/', createUser)
router.get("/", getUser);
router.get('/:id', getUserId)
router.put('/:id' ,putUserId)
router.delete('/:id' ,deleteUserId)




export default router