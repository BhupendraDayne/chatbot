import express from "express";
import { protect } from "../middlewares/auth.js";
import HealthLocation from "../models/HealthLocation.js";

const healthLocationRouter = express.Router();

// Get user's location search history
healthLocationRouter.get("/history", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await HealthLocation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, history });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Get specific location query details
healthLocationRouter.get("/details/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const locationData = await HealthLocation.findOne({ _id: id, userId });

    if (!locationData) {
      return res.json({
        success: false,
        message: "Location data not found",
      });
    }

    res.json({ success: true, data: locationData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default healthLocationRouter;
