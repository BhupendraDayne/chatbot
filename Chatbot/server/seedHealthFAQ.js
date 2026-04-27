import mongoose from "mongoose";
import HealthFAQ from "./models/HealthFAQ.js";
import { config } from "dotenv";

config();

const seedHealthFAQs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await HealthFAQ.deleteMany({});

    // Sample health FAQs
    const faqs = [
      {
        question: "What are the symptoms of the flu?",
        answer:
          "Common symptoms of the flu include fever, chills, cough, sore throat, runny or stuffy nose, muscle or body aches, headaches, and fatigue. Some people may also have vomiting and diarrhea.",
        keywords: ["flu", "symptoms", "influenza", "sick", "ill"],
        category: "symptoms",
      },
      {
        question: "How can I prevent getting sick?",
        answer:
          "To prevent illness: Wash your hands frequently, avoid touching your face, stay home when sick, get vaccinated, eat a healthy diet, exercise regularly, and get enough sleep.",
        keywords: ["prevent", "sick", "illness", "healthy", "hygiene"],
        category: "prevention",
      },
      {
        question: "What should I do if I have a fever?",
        answer:
          "If you have a fever: Rest, drink plenty of fluids, take over-the-counter fever reducers like acetaminophen or ibuprofen, and monitor your temperature. See a doctor if fever is over 103°F, lasts more than 3 days, or if you have other concerning symptoms.",
        keywords: ["fever", "temperature", "sick", "ill"],
        category: "symptoms",
      },
      {
        question: "How much water should I drink daily?",
        answer:
          "The recommended daily water intake varies, but generally: About 3.7 liters (125 ounces) for men and 2.7 liters (91 ounces) for women from all beverages and food. Factors like activity level, climate, and health conditions can affect this.",
        keywords: ["water", "hydration", "drink", "fluids"],
        category: "nutrition",
      },
      {
        question: "What are the benefits of exercise?",
        answer:
          "Regular exercise provides numerous benefits: improves cardiovascular health, strengthens muscles and bones, helps maintain healthy weight, boosts mental health, reduces risk of chronic diseases, and improves sleep quality.",
        keywords: ["exercise", "fitness", "workout", "health", "benefits"],
        category: "exercise",
      },
      {
        question: "How can I improve my mental health?",
        answer:
          "To improve mental health: Stay connected with others, be physically active, eat nutritious foods, get enough sleep, practice mindfulness or meditation, seek professional help when needed, and engage in activities you enjoy.",
        keywords: [
          "mental",
          "health",
          "stress",
          "anxiety",
          "depression",
          "mindfulness",
        ],
        category: "mental_health",
      },
      {
        question: "What foods are good for immunity?",
        answer:
          "Foods that support immunity include: Citrus fruits (vitamin C), garlic, ginger, yogurt (probiotics), almonds (vitamin E), green tea, kiwi, and foods rich in zinc like oysters and beef.",
        keywords: ["immunity", "immune", "foods", "nutrition", "vitamins"],
        category: "nutrition",
      },
      {
        question: "How much sleep do I need?",
        answer:
          "Adults typically need 7-9 hours of sleep per night. Children and teens need more: 9-12 hours for school-age children, 8-10 hours for teens. Quality sleep is as important as quantity.",
        keywords: ["sleep", "rest", "tired", "insomnia"],
        category: "general",
      },
    ];

    await HealthFAQ.insertMany(faqs);
    console.log("Health FAQs seeded successfully!");
  } catch (error) {
    console.error("Error seeding Health FAQs:", error);
  } finally {
    await mongoose.connection.close();
  }
};

seedHealthFAQs();
