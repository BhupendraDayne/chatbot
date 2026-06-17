import mongoose from 'mongoose';

const FAQSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    index: true
  },
  answer: { 
    type: String, 
    required: true 
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    default: 'general'
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Text index for search
FAQSchema.index({ question: 'text' });

const FAQ = mongoose.model('FAQ', FAQSchema);
export default FAQ;
