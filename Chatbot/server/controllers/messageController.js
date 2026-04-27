import axios from "axios";
import Chat from "../models/chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openai.js";
import { searchWHOData } from "../configs/who.js";
import { isHealthRelated } from "../utils/healthEnhancer.js";
import FAQ from "../models/FAQ.js";

// --- TEXT BASED AI CHAT MESSAGE CONTROLLER - API FALLBACK MODE ---
export const textMessageController = async (req, res) => {
  let chat;
  try {
    const userId = req.user._id;

    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You don't have enough credits.",
      });
    }

    const { chatId, prompt } = req.body;
    chat = await Chat.findOne({ userId, _id: chatId });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found." });
    }

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // PRIORITY 1: FAQ Match (no credits/API)
    const normalizedPrompt = prompt.toLowerCase().trim();

    const stopWords = new Set([
      'a','an','the','is','are','was','were','be','been','being',
      'have','has','had','do','does','did','will','would','could',
      'should','may','might','must','shall','can','need','dare',
      'ought','used','to','of','in','for','on','with','at','by',
      'from','as','into','through','during','before','after',
      'above','below','between','under','and','but','or','yet',
      'so','if','because','although','though','while','where',
      'when','that','which','who','whom','whose','what','this',
      'these','those','i','me','my','myself','we','our','you',
      'your','he','him','his','she','her','it','its','they',
      'them','their','s','am','having','got','get','getting'
    ]);
    const meaningfulWords = normalizedPrompt.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

    // Score FAQ by counting how many query keywords appear in question + tags
    const scoreRelevance = (faq, words) => {
      const haystack = (faq.question + ' ' + (faq.tags?.join(' ') || '')).toLowerCase();
      return words.reduce((score, word) => score + (haystack.includes(word) ? 1 : 0), 0);
    };

    let faqMatch = null;
    let bestScore = 0;

    // Step 1: MongoDB $text search — verify result is actually relevant
    const textResult = await FAQ.findOne({
      $text: { $search: normalizedPrompt }
    }).sort({ score: { $meta: "textScore" } }).lean();

    if (textResult) {
      const score = scoreRelevance(textResult, meaningfulWords);
      if (score > 0) {
        faqMatch = textResult;
        bestScore = score;
      }
    }

    // Step 2: Keyword fallback — fetch ALL candidates and pick best by relevance score
    if (!faqMatch && meaningfulWords.length > 0) {
      const keywords = meaningfulWords.slice(0, 4).join('|');
      const candidates = await FAQ.find({
        $or: [
          { question: { $regex: keywords, $options: 'i' } },
          { tags: { $in: meaningfulWords.slice(0, 3) } }
        ]
      }).lean();

      for (const candidate of candidates) {
        const score = scoreRelevance(candidate, meaningfulWords);
        if (score > bestScore) {
          bestScore = score;
          faqMatch = candidate;
        }
      }
    }

    // PRIORITY 2: History match (only if no relevant FAQ found)
    if (!faqMatch) {
      const recentUserMsgs = chat.messages.slice(-10).filter(m => m.role === 'user');
      const similarMsg = recentUserMsgs.find((msg) => {
        const msgWords = msg.content.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
        if (msgWords.length === 0 || meaningfulWords.length === 0) return false;
        const matchCount = meaningfulWords.filter(w => msgWords.includes(w)).length;
        return matchCount / meaningfulWords.length > 0.5;
      });
      if (similarMsg) {
        const userIdx = chat.messages.findIndex(msg => msg.content === similarMsg.content && msg.role === 'user');
        const replyIdx = chat.messages.findIndex((m, i) => i > userIdx && m.role === 'assistant');
        if (replyIdx !== -1) {
          faqMatch = { answer: chat.messages[replyIdx].content.replace(/\*[^\*]*\*/g, '').trim() };
        }
      }
    }

    // Use match
    if (faqMatch) {
      let dbDoc = null;
      if (faqMatch._id) {
        dbDoc = await FAQ.findById(faqMatch._id);
        if (dbDoc) dbDoc.usageCount += 1, await dbDoc.save();
      }

      const reply = {
        role: "assistant",
        content: `${faqMatch.answer}\n\n*(Smart match - credits saved!)*`,
        timestamp: Date.now(),
        isImage: false,
      };

      chat.messages.push(reply);
      await chat.save();

      res.json({ success: true, reply });
      return;
    }

    // PRIORITY 3: WHO direct response (no API needed)
    const whoData = await searchWHOData(prompt);
    if (whoData.length) {
      const response = `Based on WHO data:\n\n${whoData.slice(0,3).map((d, i) => `${i+1}. ${d.title}: ${d.description || 'See source'}`).join('\n')}\n\nFor detailed advice, consult a healthcare professional.`;
      const reply = {
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        isImage: false,
      };

      chat.messages.push(reply);
      await chat.save();

      res.json({ success: true, reply });
      return;
    }

    // PRIORITY 4: OpenAI API call
    const userPrompt = `You are a trusted health assistant. Answer clearly and accurately. User question: ${prompt}`;

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

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);
    await chat.save();

    res.json({ success: true, reply });
    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });

  } catch (error) {
    console.error("Text Error:", error);
    // Handle all API errors (429 quota, 503 service, etc.)
    const isApiError = error.status >= 400 || error.name === 'RateLimitError' || error.name === 'InternalServerError';
    if (isApiError) {
      const fallbackReply = {
        role: "assistant",
        content: "Gemini API temporarily unavailable (quota/service). Fallback active - FAQ/WHO for health, general tips here. No credits deducted! 🔄",
        timestamp: Date.now(),
        isImage: false,
      };
      if (chat) {
        chat.messages.push(fallbackReply);
        await chat.save();
      }
      res.json({ success: true, reply: fallbackReply });
    } else {
      res.json({ success: false, message: "Try again soon." });
    }
  }
};

// --- IMAGE CONTROLLER (unaffected by text API) ---
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    if (req.user.credits < 2) return res.json({ success: false, message: "Insufficient credits for image." });

    const { prompt, chatId, isPublished = false } = req.body;
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found." });

    chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false });

    const encodedPrompt = encodeURIComponent(prompt);
    const genUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/${Date.now()}.png?tr=w-800,h-800`;
    const imgResp = await axios.get(genUrl, { responseType: "arraybuffer" });
    const base64 = `data:image/png;base64,${Buffer.from(imgResp.data).toString('base64')}`;

    const upload = await imagekit.upload({ file: base64, fileName: `${Date.now()}.png`, folder: "Chatbot" });

    const reply = {
      role: "assistant",
      content: upload.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    res.json({ success: true, reply });

    chat.messages.push(reply);
    await chat.save();
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    console.error("Image Error:", error);
    res.json({ success: false, message: error.message });
  }
};

