import Chat from "../models/chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";
import { searchWHOData } from "../configs/who.js";
import FAQ from "../models/FAQ.js";
import Feedback from "../models/Feedback.js";
import multer from 'multer';
import imagekit from "../configs/imagekit.js";
import { isHealthRelated } from "../utils/healthEnhancer.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeKey = (s) =>
  (s || '').toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

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

const extractKeywords = (text) =>
  (text || '').toLowerCase().split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

// What fraction of wordsA appear in wordsB (0 to 1)
const similarityScore = (wordsA, wordsB) => {
  if (!wordsA.length || !wordsB.length) return 0;
  const matched = wordsA.filter(w => wordsB.includes(w)).length;
  return matched / Math.max(wordsA.length, wordsB.length);
};

// ─── Multer ───────────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mimeOk = /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype);
    cb(mimeOk ? null : new Error('Invalid file type'), mimeOk);
  },
});

export const prescriptionUploadMiddleware = upload.single('file');

// ─── Feedback Controller ──────────────────────────────────────────────────────

export const feedbackController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { question, answer, value } = req.body;

    if (!question || !answer || !value)
      return res.status(400).json({ success: false, message: 'question, answer, and value are required' });

    if (value !== 'up' && value !== 'down')
      return res.status(400).json({ success: false, message: 'value must be up or down' });

    const questionKey = normalizeKey(question);
    const answerKey   = normalizeKey(answer);

    // Upsert: one record per user+question+answer, update value if vote changes
    await Feedback.findOneAndUpdate(
      { userId, questionKey, answerKey },
      { $set: { value, answer: answer.trim() } },
      { upsert: true, new: true }
    );

    return res.json({ success: true });
  } catch (err) {
    if (err.code === 11000) return res.json({ success: true }); // race condition safe
    console.error('Feedback error:', err);
    return res.status(500).json({ success: false, message: 'Feedback failed' });
  }
};

// ─── Text Message Controller ──────────────────────────────────────────────────

export const textMessageController = async (req, res) => {
  let chat;
  try {
    const userId = req.user._id;

    if (req.user.credits < 1)
      return res.json({ success: false, message: "You don't have enough credits." });

    const { chatId, prompt } = req.body;
    chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat)
      return res.status(404).json({ success: false, message: "Chat not found." });

    chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false });

    // ── GATE: Block non-health prompts ────────────────────────────────────────
    // Single check using healthEnhancer.js — no duplicate regex needed
    const healthOk = await isHealthRelated(prompt);
    if (!healthOk) {
      const reply = {
        role: "assistant",
        content: "I am a health-related agent and can only answer health-related questions.",
        timestamp: Date.now(),
        isImage: false,
      };
      chat.messages.push(reply);
      await chat.save();
      return res.json({ success: true, reply, blocked: true });
    }

    const normalizedPrompt = normalizeKey(prompt);
    const promptKeywords   = extractKeywords(prompt);

    const scoreRelevance = (faq) => {
      const haystack = (faq.question + ' ' + (faq.tags?.join(' ') || '')).toLowerCase();
      return promptKeywords.reduce((score, word) => score + (haystack.includes(word) ? 1 : 0), 0);
    };

    // ── PRIORITY 1: Feedback Smart Reuse ─────────────────────────────────────
    // User-approved (thumbs-up) answers checked FIRST.
    // Completely bypasses Gemini — saves credits on repeated questions.

    // 1a. Exact question match
    const exactUpFeedback = await Feedback.findOne({
      userId,
      questionKey: normalizedPrompt,
      value: 'up',
    }).lean();

    if (exactUpFeedback) {
      const reply = {
        role: "assistant",
        content: `${exactUpFeedback.answer}\n\n*(Saved from your feedback ✓)*`,
        timestamp: Date.now(),
        isImage: false,
      };
      chat.messages.push(reply);
      await chat.save();
      return res.json({ success: true, reply });
    }

    // 1b. Fuzzy match — similar questions from thumbs-up history
    if (promptKeywords.length >= 2) {
      const upFeedbacks = await Feedback.find({ userId, value: 'up' }).limit(100).lean();

      let bestFeedback = null;
      let bestFeedbackScore = 0;

      for (const fb of upFeedbacks) {
        const fbKeywords = extractKeywords(fb.questionKey);
        const score = similarityScore(promptKeywords, fbKeywords);
        // Require at least 60% keyword overlap to reuse
        if (score > bestFeedbackScore && score >= 0.6) {
          bestFeedbackScore = score;
          bestFeedback = fb;
        }
      }

      if (bestFeedback) {
        const reply = {
          role: "assistant",
          content: `${bestFeedback.answer}\n\n*(Saved from your feedback ✓)*`,
          timestamp: Date.now(),
          isImage: false,
        };
        chat.messages.push(reply);
        await chat.save();
        return res.json({ success: true, reply });
      }
    }

    // ── PRIORITY 2: FAQ Match ─────────────────────────────────────────────────
    let faqMatch = null;
    let bestFaqScore = 0;

    const textResult = await FAQ.findOne({
      $text: { $search: normalizedPrompt }
    }).sort({ score: { $meta: "textScore" } }).lean();

    if (textResult) {
      const score = scoreRelevance(textResult);
      if (score > 0) { faqMatch = textResult; bestFaqScore = score; }
    }

    if (!faqMatch && promptKeywords.length > 0) {
      const keywords = promptKeywords.slice(0, 4).join('|');
      const candidates = await FAQ.find({
        $or: [
          { question: { $regex: keywords, $options: 'i' } },
          { tags: { $in: promptKeywords.slice(0, 3) } }
        ]
      }).lean();

      for (const candidate of candidates) {
        const score = scoreRelevance(candidate);
        if (score > bestFaqScore) { bestFaqScore = score; faqMatch = candidate; }
      }
    }

    if (faqMatch) {
      if (faqMatch._id) {
        await FAQ.updateOne({ _id: faqMatch._id }, { $inc: { usageCount: 1 } });
      }
      const reply = {
        role: "assistant",
        content: `${faqMatch.answer}\n\n*(Smart match - credits saved!)*`,
        timestamp: Date.now(),
        isImage: false,
      };
      chat.messages.push(reply);
      await chat.save();
      return res.json({ success: true, reply });
    }

    // ── PRIORITY 3: Chat History Match ────────────────────────────────────────
    const recentUserMsgs = chat.messages.slice(-20).filter(m => m.role === 'user');
    const similarMsg = recentUserMsgs.find((msg) => {
      const msgKeywords = extractKeywords(msg.content);
      return similarityScore(promptKeywords, msgKeywords) >= 0.6;
    });

    if (similarMsg) {
      const userIdx  = chat.messages.findIndex(m => m.content === similarMsg.content && m.role === 'user');
      const replyIdx = chat.messages.findIndex((m, i) => i > userIdx && m.role === 'assistant');
      if (replyIdx !== -1) {
        const reply = {
          role: "assistant",
          content: chat.messages[replyIdx].content,
          timestamp: Date.now(),
          isImage: false,
        };
        chat.messages.push(reply);
        await chat.save();
        return res.json({ success: true, reply });
      }
    }

    // ── PRIORITY 4: WHO Data ──────────────────────────────────────────────────
    const whoData = await searchWHOData(prompt);
    if (whoData.length) {
      const reply = {
        role: "assistant",
        content: `Based on WHO data:\n\n${whoData
          .slice(0, 3)
          .map((d, i) => `${i + 1}. **${d.title}**: ${d.description || 'See source'}`)
          .join('\n')}\n\nFor detailed advice, consult a healthcare professional.`,
        timestamp: Date.now(),
        isImage: false,
      };
      chat.messages.push(reply);
      await chat.save();
      return res.json({ success: true, reply });
    }

    // ── PRIORITY 5: Gemini API (last resort — costs 1 credit) ────────────────
    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      reasoning_effort: "medium",
      messages: [
        {
          role: "system",
          content: "You are a trusted health assistant. Answer clearly, accurately, and concisely. Always recommend consulting a healthcare professional for serious concerns.",
        },
        {
          role: "user",
          content: prompt,
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

    // Respond BEFORE credit deduction — failure here is non-fatal
    res.json({ success: true, reply });

    try {
      await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
    } catch (creditErr) {
      console.error("Credit deduction failed (non-fatal):", creditErr.message);
    }

  } catch (error) {
    console.error("Text message error:", error);
    const fallbackReply = {
      role: "assistant",
      content: "Our AI service is temporarily unavailable. Please try again in a moment.",
      timestamp: Date.now(),
      isImage: false,
    };
    try {
      if (chat) { chat.messages.push(fallbackReply); await chat.save(); }
    } catch (_) {}
    return res.json({ success: true, reply: fallbackReply });
  }
};

// ─── Prescription Upload Controller ──────────────────────────────────────────

export const prescriptionUploadController = async (req, res) => {
  try {
    const userId = req.user._id;

    if (req.user.credits < 2)
      return res.json({ success: false, message: "Insufficient credits for prescription upload." });

    const { chatId, prompt = '' } = req.body;
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat)
      return res.status(404).json({ success: false, message: "Chat not found." });

    const file = req.file;
    if (!file)
      return res.status(400).json({ success: false, message: "Prescription image file is required." });

    const mimeOk = /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype);
    if (!mimeOk)
      return res.status(400).json({ success: false, message: "Invalid file type. Upload an image." });

    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    let uploaded;
    try {
      uploaded = await imagekit.upload({
        file: dataUrl,
        fileName: `prescription_${userId}_${Date.now()}`,
        folder: '/healthagent/prescriptions',
        useUniqueFileName: true,
      });
    } catch (imgErr) {
      console.error('ImageKit upload failed:', imgErr?.message);
      return res.status(500).json({ success: false, message: 'Image upload failed', details: imgErr?.message });
    }

    if (!uploaded?.url)
      return res.status(500).json({ success: false, message: 'Image upload failed (no URL returned)' });

    const imageUrl = uploaded.url;
    chat.messages.push({ role: "user", content: imageUrl, timestamp: Date.now(), isImage: true });

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gemini-2.5-flash",
        reasoning_effort: "medium",
        messages: [
          { role: 'system', content: 'You are an accurate OCR + medical interpretation assistant.' },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a medical assistant. Read the prescription image and extract:
1) Patient name (if present)
2) Doctor name/clinic (if present)
3) Medicines (name + dosage + frequency + duration)
4) Any notes/instructions
5) Any red flags (illegible parts, missing dosage, dangerous instructions)

Return the result in clear bullet points.${prompt ? `\nUser request: ${prompt}` : ''}`
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      });
    } catch (ocrErr) {
      console.error('OCR failed:', ocrErr?.message);
      return res.status(500).json({ success: false, message: 'Prescription OCR failed', details: ocrErr?.message });
    }

    const reply = {
      role: "assistant",
      content: completion?.choices?.[0]?.message?.content || "Unable to read the prescription clearly.",
      timestamp: Date.now(),
      isImage: false,
    };

    chat.messages.push(reply);
    await chat.save();

    // Respond BEFORE credit deduction — failure is non-fatal
    res.json({ success: true, reply });

    try {
      await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
    } catch (creditErr) {
      console.error("Credit deduction failed (non-fatal):", creditErr.message);
    }

  } catch (error) {
    console.error("Prescription Upload Error:", error);
    return res.status(500).json({ success: false, message: error?.message || 'Prescription upload failed' });
  }
};