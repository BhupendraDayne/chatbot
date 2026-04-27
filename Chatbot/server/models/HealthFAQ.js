import mongoose from "mongoose";

const HealthFAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    answer: {
      type: String,
      required: true,
    },
    keywords: [
      {
        type: String,
        index: true,
      },
    ],
    category: {
      type: String,
      enum: [
        "general",
        "symptoms",
        "prevention",
        "nutrition",
        "exercise",
        "mental_health",
      ],
      default: "general",
    },
  },
  { timestamps: true },
);

const HealthFAQ = mongoose.model("HealthFAQ", HealthFAQSchema);
export default HealthFAQ;
