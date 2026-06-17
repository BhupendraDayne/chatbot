<<<<<<< HEAD
import express from "express";
import { protect } from "../middlewares/auth.js";
import { textMessageController } from "../controllers/messageController.js";
import {
  healthLocationController,
  fetchNearbyPlaces,
} from "../controllers/healthLocationController.js";
=======
import express from 'express'
import { protect } from '../middlewares/auth.js'
import { prescriptionUploadController, prescriptionUploadMiddleware, textMessageController, feedbackController } from '../controllers/messageController.js'

>>>>>>> ec5d6bef4256aadca91b0b4a5baacfe6caa28da8

const messageRouter = express.Router();

messageRouter.post("/text", protect, textMessageController);
messageRouter.post("/health-location", protect, healthLocationController);
messageRouter.post("/nearby-places", protect, fetchNearbyPlaces);

<<<<<<< HEAD
=======
messageRouter.post('/text', protect, textMessageController)
messageRouter.post('/feedback', protect, feedbackController)
messageRouter.post('/upload/prescription', protect, prescriptionUploadMiddleware, prescriptionUploadController)

>>>>>>> ec5d6bef4256aadca91b0b4a5baacfe6caa28da8
export default messageRouter;



