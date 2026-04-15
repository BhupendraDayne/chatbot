 import express from 'express'
import { protect } from '../middlewares/auth.js'
import { imageMessageController, textMessageController } from '../controllers/messageController.js'

const messageRouter = express.Router()

messageRouter.post('/text', protect, textMessageController)
 
export default messageRouter;
