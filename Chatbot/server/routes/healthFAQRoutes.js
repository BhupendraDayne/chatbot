import express from "express";
import HealthFAQ from "../models/HealthFAQ.js";

const router = express.Router();

// Get all FAQs (Public endpoint for reference)
router.get("/", async (req, res) => {
  try {
    const faqs = await HealthFAQ.find().limit(100);
    res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    console.error("Get FAQs Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search FAQs by keyword
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const faqs = await HealthFAQ.find({
      $or: [
        { question: { $regex: query, $options: "i" } },
        { answer: { $regex: query, $options: "i" } },
        { keywords: { $in: [new RegExp(query, "i")] } },
      ],
    }).limit(10);

    res.json({ success: true, count: faqs.length, faqs });
  } catch (error) {
    console.error("Search FAQs Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
