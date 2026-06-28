import Chat from "../models/chat.js";

export const saveFeedback = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, messageId, feedback } = req.body;

    if (!chatId || !messageId || !feedback) {
      return res.status(400).json({
        success: false,
        message: "chatId, messageId and feedback are required",
      });
    }

    const chat = await Chat.findOne({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const message = chat.messages.id(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    message.feedback = feedback;
    await chat.save();

    res.json({ success: true, message: "Feedback saved successfully" });
  } catch (error) {
    console.error("Feedback Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

