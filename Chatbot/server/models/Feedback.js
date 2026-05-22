import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Stable normalized key for the question (lowercased, stripped punctuation)
    questionKey: {
      type: String,
      required: true,
      index: true,
    },

    // What the assistant answered (human-readable, for reuse in smart match)
    answer: {
      type: String,
      required: true,
    },

    // Normalized answer key for deduplication
    answerKey: {
      type: String,
      default: null,
    },

    // thumbs up / thumbs down
    value: {
      type: String,
      enum: ['up', 'down'],
      required: true,
      index: true,
    },

    // Optional reference to the chat this feedback came from
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// ✅ Unique at DB level: one vote per user per question+answer combo
// If user changes from 'down' to 'up', use findOneAndUpdate with upsert
FeedbackSchema.index(
  { userId: 1, questionKey: 1, answerKey: 1 },
  { unique: true }
);

const Feedback = mongoose.model('Feedback', FeedbackSchema);
export default Feedback;