import mongoose, { Schema } from 'mongoose'

const MessageSchema = new Schema({
    role: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Number, required: true },
    isImage: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    feedback: { type: String, enum: ['up', 'down', 'none'], default: 'none' }
});

const ChatSchema = new Schema({
    userId: { type: String, ref: 'User', required: true },
    userName: { type: String, required: true },
    name: { type: String, required: true },
    messages: [MessageSchema]
}, { timestamps: true });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;

