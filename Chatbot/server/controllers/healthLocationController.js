import axios from "axios";
import Chat from "../models/chat.js";
import User from "../models/User.js";
import HealthLocation from "../models/HealthLocation.js";
import openai from "../configs/openai.js";
import { searchWHOData } from "../configs/who.js";
import { isHealthRelated } from "../utils/healthEnhancer.js";
import {
  findNearbyDoctors,
  findNearbyHospitals,
} from "../configs/mapMyIndia.js";

// Fetch nearby doctors or hospitals
export const fetchNearbyPlaces = async (req, res) => {
  try {
    const { type, location } = req.body; // type: 'doctor' or 'hospital'

    if (!location || !location.lat || !location.lng) {
      return res.json({
        success: false,
        message: "Location (latitude and longitude) is required",
      });
    }

    if (!["doctor", "hospital"].includes(type)) {
      return res.json({
        success: false,
        message: "Type must be 'doctor' or 'hospital'",
      });
    }

    let places = [];
    if (type === "doctor") {
      places = await findNearbyDoctors(location);
    } else {
      places = await findNearbyHospitals(location);
    }

    res.json({ success: true, places });
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    res.json({ success: false, message: error.message });
  }
};

// Health query with nearby doctors and hospitals
export const healthLocationController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check credits
    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You need at least 2 credits for this feature",
      });
    }

    const { chatId, prompt, location } = req.body;

    // Validate location
    if (!location || !location.lat || !location.lng) {
      return res.json({
        success: false,
        message: "Location (latitude and longitude) is required",
      });
    }

    // Find the chat
    const chat = await Chat.findOne({ userId, _id: chatId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Check if it's health-related
    const isHealthQuery = await isHealthRelated(prompt);
    let whoContext = "";

    if (isHealthQuery) {
      const whoResults = await searchWHOData(prompt);
      if (whoResults.length) {
        const summary = whoResults
          .map(
            (item, index) =>
              `WHO reference ${index + 1}: ${item.title} - ${item.description || item.title}`,
          )
          .join("\n");
        whoContext = `Use the following WHO information when answering this health-related query:\n${summary}\n\n`;
      }
    }

    const userPrompt = `You are a trusted health assistant. Answer clearly and accurately. ${whoContext}User question: ${prompt}`;

    // Get Gemini response
    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      reasoning_effort: "medium",
      messages: [
        {
          role: "system",
          content:
            "You are an authoritative medical assistant. If WHO data is available, use it as a reference when responding.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    let replyContent = choices[0].message.content;

    // Fetch nearby doctors and hospitals if health-related
    if (isHealthQuery) {
      try {
        const [doctors, hospitals] = await Promise.all([
          findNearbyDoctors(location),
          findNearbyHospitals(location),
        ]);

        if (doctors.length > 0 || hospitals.length > 0) {
          let suggestions = "\n\n---\n**🏥 Nearby Healthcare Facilities:**\n";

          if (doctors.length > 0) {
            suggestions += "\n**👨‍⚕️ Doctors:**\n";
            doctors.slice(0, 3).forEach((doc, idx) => {
              suggestions += `${idx + 1}. **${doc.name}**\n   📍 ${doc.address}\n   ⭐ Rating: ${doc.rating || "N/A"}\n`;
            });
          }

          if (hospitals.length > 0) {
            suggestions += "\n**🏨 Hospitals:**\n";
            hospitals.slice(0, 3).forEach((hosp, idx) => {
              suggestions += `${idx + 1}. **${hosp.name}**\n   📍 ${hosp.address}\n   ⭐ Rating: ${hosp.rating || "N/A"}\n`;
            });
          }

          replyContent += suggestions;

          // Save location query for history
          await HealthLocation.create({
            userId,
            prompt,
            location,
            doctorsFound: doctors.slice(0, 3),
            hospitalsFound: hospitals.slice(0, 3),
          });
        }
      } catch (locationError) {
        console.error("Error fetching locations:", locationError);
        // Continue with response even if location fetch fails
      }
    }

    // Create reply
    const reply = {
      ...choices[0].message,
      content: replyContent,
      timestamp: Date.now(),
      isImage: false,
    };

    res.json({ success: true, reply });

    // Save chat and deduct credits
    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    console.error("Health Location Error:", error);
    res.json({ success: false, message: error.message });
  }
};
