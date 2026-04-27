import axios from "axios";
import Chat from "../models/chat.js";
import User from "../models/User.js";
import HealthFAQ from "../models/HealthFAQ.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";
import { searchWHOData } from "../configs/who.js";
import { isHealthRelated } from "../utils/healthEnhancer.js";
import {
  findNearbyDoctors,
  findNearbyHospitals,
} from "../configs/mapMyIndia.js";

// Helper function to find fallback answer from predefined database
const findFallbackAnswer = async (userPrompt) => {
  try {
    // Try exact match first
    let faq = await HealthFAQ.findOne({
      question: { $regex: new RegExp(`^${userPrompt}$`, "i") },
    });

    if (faq) return faq.answer;

    // Try partial match on keywords
    const keywords = userPrompt.toLowerCase().split(/\s+/);
    faq = await HealthFAQ.findOne({
      $or: [
        { question: { $regex: userPrompt, $options: "i" } },
        { keywords: { $in: keywords } },
      ],
    });

    return faq ? faq.answer : null;
  } catch (error) {
    console.error("Fallback search error:", error);
    return null;
  }
};

// --- TEXT BASED AI CHAT MESSAGE CONTROLLER (FIXED) ---
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check credits
    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { chatId, prompt, location } = req.body;

    // 1. Find the chat
    const chat = await Chat.findOne({ userId, _id: chatId });

    // **FIX**: Check if chat exists (Null Check)
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or invalid Chat ID.",
      });
    }

    // 2. Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // 3. Augment prompt with WHO data when the question is health-related
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

    let replyContent = "";
    let aiResponseSuccessful = false;

    try {
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

      replyContent = choices[0].message.content;
      aiResponseSuccessful = true;
    } catch (aiError) {
      console.error("AI API Error:", aiError.message);
      // Fallback to predefined database
      const fallbackAnswer = await findFallbackAnswer(prompt);
      if (fallbackAnswer) {
        replyContent = fallbackAnswer;
      } else {
        replyContent =
          "I'm sorry, I couldn't find an answer to your question. Please consult a healthcare professional for medical advice.";
      }
    }

    // Add nearby suggestions if health-related and location provided
    if (isHealthQuery && location) {
      const doctors = await findNearbyDoctors(location);
      const hospitals = await findNearbyHospitals(location);

      if (doctors.length > 0 || hospitals.length > 0) {
        let suggestions = "\n\n**Nearby Healthcare Facilities:**\n";
        if (doctors.length > 0) {
          suggestions +=
            "\n**Doctors:**\n" +
            doctors
              .slice(0, 3)
              .map((doc) => `- ${doc.name} (${doc.address})`)
              .join("\n");
        }
        if (hospitals.length > 0) {
          suggestions +=
            "\n**Hospitals:**\n" +
            hospitals
              .slice(0, 3)
              .map((hosp) => `- ${hosp.name} (${hosp.address})`)
              .join("\n");
        }
        replyContent += suggestions;
      }
    }

    // 4. Send response
    const reply = {
      role: "assistant",
      content: replyContent,
      timestamp: Date.now(),
      isImage: false,
    };
    res.json({ success: true, reply });

    // 5. Save chat and deduct credit (After sending successful response)
    chat.messages.push(reply);
    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    // Log the actual error for debugging
    console.error("Text Message Error:", error);
    res.json({ success: false, message: error.message });
  }
};

// --- IMAGE GENERATION MESSAGE CONTROLLER (FIXED) ---
