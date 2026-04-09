import express from 'express'
import {createQueue , getQueu , getQueuId  , deleteQueuId , finishQueue , resetQueue} from '../controllers/queueController'

const router = express.Router()

router.post('/', createQueue) //สร้างคิว
router.get('/', getQueu) //ดูทั้งหมด
router.get('/:id', getQueuId) //ดูคิวเดียว
router.delete('/:id', deleteQueuId) //ลบ
// router.get('/waiting', getWaitingQueue) //คิวรอ
// router.get('/finished', getFinishedQueue) //ดูคิวเดียว
router.patch('/:id/finish', finishQueue) //ปิดคิว
router.patch('/:id/reset', resetQueue) //รีเซจคิว

export default router