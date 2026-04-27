import express from "express";
import { protect } from "../middlewares/auth.js";
import { textMessageController } from "../controllers/messageController.js";
import {
  healthLocationController,
  fetchNearbyPlaces,
} from "../controllers/healthLocationController.js";

const messageRouter = express.Router();

messageRouter.post("/text", protect, textMessageController);
messageRouter.post("/health-location", protect, healthLocationController);
messageRouter.post("/nearby-places", protect, fetchNearbyPlaces);

export default messageRouter;
