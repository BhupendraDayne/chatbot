import express from "express";
import { protect } from "../middlewares/auth.js";
import { findNearbyDoctors, findNearbyHospitals } from "../controllers/locationController.js";

const locationRouter = express.Router();

locationRouter.post("/doctors", protect, findNearbyDoctors);
locationRouter.post("/hospitals", protect, findNearbyHospitals);

export default locationRouter;

