import express from "express";
import { protect } from "../middlewares/auth.js";
import { getNearbyPlaces } from "../controllers/nearbyController.js";

const nearbyRouter = express.Router();

nearbyRouter.get("/", protect, getNearbyPlaces);


export default nearbyRouter;

