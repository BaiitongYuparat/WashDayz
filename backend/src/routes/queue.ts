import express from 'express'
import {
    createQueue,
    getQueue,
    getQueueById,
    deleteQueueById,
    finishQueue,
    resetQueue
} from '../controllers/queueController'

const router = express.Router()

router.post('/', createQueue)
router.get('/', getQueue)
router.get('/:id', getQueueById)
router.delete('/:id', deleteQueueById)
router.patch('/:id/finish', finishQueue)
router.patch('/:id/reset', resetQueue)

export default router