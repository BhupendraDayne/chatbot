import express from 'express'
import { protect } from '../middlewares/auth.js'
import { saveFeedback } from '../controllers/feedbackController.js'

const feedbackRouter = express.Router()

feedbackRouter.post('/', protect, saveFeedback)

export default feedbackRouter;

