import axios from 'axios'
import { truncates } from "bcryptjs";
import Chat from "../models/chat.js";
import User from '../models/User.js'
import imagekit from '../configs/imageKit.js';
import openai from '../configs/openai.js'

// --- TEXT BASED AI CHAT MESSAGE CONTROLLER (FIXED) ---
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Check credits
        if (req.user.credits < 1) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature" })
        }
        
        const { chatId, prompt } = req.body;
        
        // 1. Find the chat
        const chat = await Chat.findOne({ userId, _id: chatId });
        
        // **FIX**: Check if chat exists (Null Check)
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found or invalid Chat ID." });
        }

        // 2. Push user message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
        });

        // 3. Get AI response
        const { choices } = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            reasoning_effort: "low",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });
        
        // 4. Send response
        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false }
        res.json({ success: true, reply })
        
        // 5. Save chat and deduct credit (After sending successful response)
        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } })

    } catch (error) {
        // Log the actual error for debugging
        console.error("Text Message Error:", error); 
        res.json({ success: false, message: error.message })
    }
};

// --- IMAGE GENERATION MESSAGE CONTROLLER (FIXED) ---
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Check credits
        if (req.user.credits < 2) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature" })
        }
        
        const { prompt, chatId, isPublished } = req.body

        // 1. Find chat
        const chat = await Chat.findOne({ userId, _id: chatId })
        
        // **FIX**: Check if chat exists (Null Check)
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat not found or invalid Chat ID." });
        }

        // 2. Push user message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false,
        })
        
        // 3. Image Generation Logic (No change here)
        const encodedPrompt = encodeURIComponent(prompt)
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/${Date.now()}.png?tr=w-800,h-800`;
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" })
        const base64Image = `dada:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`

        // 4. Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "Chatbot"
        })

        // 5. Send response
        const reply = {
            role: "assistant",
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        }

        res.json({ success: true, reply })

        // 6. Save chat and deduct credit
        chat.messages.push(reply)
        await chat.save()
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } })
        
    } catch (error) {
        // Log the actual error for debugging
        console.error("Image Message Error:", error); 
        res.json({ success: false, message: error.message })
    }
}