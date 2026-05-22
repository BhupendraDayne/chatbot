import express from 'express'
import { protect } from '../middlewares/auth.js'
import { prescriptionUploadController, prescriptionUploadMiddleware, textMessageController, feedbackController } from '../controllers/messageController.js'


const messageRouter = express.Router()

messageRouter.post('/text', protect, textMessageController)
messageRouter.post('/feedback', protect, feedbackController)
messageRouter.post('/upload/prescription', protect, prescriptionUploadMiddleware, prescriptionUploadController)

export default messageRouter;



