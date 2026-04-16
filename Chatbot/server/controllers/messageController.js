import axios from "axios";
import Chat from "../models/chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";
import { searchWHOData } from "../configs/who.js";
import { isHealthRelated } from "../utils/healthEnhancer.js";

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

    const { chatId, prompt } = req.body;

    // 1. Find the chat
    const chat = await Chat.findOne({ userId, _id: chatId });

    // **FIX**: Check if chat exists (Null Check)
    if (!chat) {
      return res
        .status(404)
        .json({
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

    // 4. Send response
    const reply = {
      ...choices[0].message,
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
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check credits
    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You don't have enough credits to use this feature",
      });
    }

    const { prompt, chatId, isPublished } = req.body;

    // 1. Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });

    // **FIX**: Check if chat exists (Null Check)
    if (!chat) {
      return res
        .status(404)
        .json({
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

    // 3. Image Generation Logic (No change here)
    const encodedPrompt = encodeURIComponent(prompt);
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/${Date.now()}.png?tr=w-800,h-800`;
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });
    const base64Image = `dada:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;

    // 4. Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "Chatbot",
    });

    // 5. Send response
    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    res.json({ success: true, reply });

    // 6. Save chat and deduct credit
    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    // Log the actual error for debugging
    console.error("Image Message Error:", error);
    res.json({ success: false, message: error.message });
  }
};
