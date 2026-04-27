export const initialFAQData = [
  {
    question: 'what are the symptoms of diabetes?',
    answer: 'Common symptoms include increased thirst, frequent urination, fatigue, blurred vision, and unexplained weight loss. Consult a healthcare professional for diagnosis. (Source: WHO)',
    tags: ['diabetes', 'symptoms'],
    category: 'health'
  },
  {
    question: 'how to prevent heart disease?',
    answer: 'Maintain healthy diet, regular exercise, avoid smoking, manage blood pressure and cholesterol. Regular check-ups recommended. (WHO guidelines)',
    tags: ['heart', 'prevention'],
    category: 'health'
  },
  {
    question: 'what is hypertension?',
    answer: 'High blood pressure (hypertension) increases risk of heart attack and stroke. Managed with lifestyle changes and medication if needed.',
    tags: ['blood pressure', 'hypertension'],
    category: 'health'
  },
  {
    question: 'signs of covid 19?',
    answer: 'Fever, cough, shortness of breath, loss of taste/smell. Test and isolate if symptomatic. Vaccination recommended. (WHO)',
    tags: ['covid', 'symptoms'],
    category: 'health'
  },
  {
    question: 'how to manage stress?',
    answer: 'Practice mindfulness, exercise, healthy sleep, social support. Seek professional help if persistent. Mental health matters (WHO)',
    tags: ['mental health', 'stress'],
    category: 'health'
  },
  {
    question: 'what is anemia?',
    answer: 'Condition with low red blood cells or hemoglobin, causing fatigue, weakness. Common in women and children. Iron-rich diet helps. (WHO)',
    tags: ['anemia', 'nutrition'],
    category: 'health'
  },
  {
    question: 'benefits of vaccination?',
    answer: 'Vaccines prevent serious diseases, save lives, build herd immunity. Safe and effective per WHO.',
    tags: ['vaccination', 'prevention'],
    category: 'health'
  },
  {
    question: 'how to improve sleep?',
    answer: 'Consistent sleep schedule, limit screens before bed, comfortable environment, avoid caffeine late. 7-9 hours recommended.',
    tags: ['sleep', 'lifestyle'],
    category: 'health'
  },
  {
    question: 'what causes obesity?',
    answer: 'Combination of poor diet, lack of exercise, genetics, environment. Leads to diabetes, heart disease. Balanced lifestyle key (WHO).',
    tags: ['obesity', 'nutrition'],
    category: 'health'
  },
  {
    question: 'first aid for burns?',
    answer: 'Cool with running water 10-20 min, cover loosely, pain relief. Seek medical for severe burns. Do not use ice.',
    tags: ['first aid', 'burns', 'emergency'],
    category: 'health'
  },
  {
    question: 'how to recognize stroke?',
    answer: 'FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency. Act fast!',
    tags: ['stroke', 'emergency'],
    category: 'health'
  },
  {
    question: 'importance of handwashing?',
    answer: 'Reduces spread of infections like diarrhea by 30-50%, respiratory by 20%. Soap and water 20 seconds. (WHO)',
    tags: ['hygiene', 'prevention'],
    category: 'health'
  },
  {
    question: 'symptoms of depression?',
    answer: 'Persistent sadness, loss of interest, fatigue, appetite changes, sleep issues. Seek professional support. Helplines available.',
    tags: ['mental health', 'depression'],
    category: 'health'
  },
  {
    question: 'how to lower cholesterol?',
    answer: 'Eat fiber-rich foods, exercise, healthy fats, quit smoking. Statins if prescribed. Regular screening.',
    tags: ['cholesterol', 'diet'],
    category: 'health'
  },
  {
    question: 'what is osteoporosis?',
    answer: 'Weak brittle bones, risk of fractures. Calcium, vitamin D, weight-bearing exercise prevent. Common post-menopause.',
    tags: ['bones', 'osteoporosis'],
    category: 'health'
  },
  {
    question: 'prevent malaria?',
    answer: 'Use insecticide nets, repellents, indoor spraying. Take prophylaxis if traveling. Mosquito control key (WHO).',
    tags: ['malaria', 'prevention'],
    category: 'health'
  },
  {
    question: 'signs of dehydration?',
    answer: 'Dry mouth, dizziness, dark urine, fatigue. Drink fluids, especially in heat/exercise. Oral rehydration for severe.',
    tags: ['dehydration', 'hydration'],
    category: 'health'
  },
  {
    question: 'benefits of exercise?',
    answer: '150 min moderate/week: reduces heart disease, diabetes, improves mental health, weight control (WHO).',
    tags: ['exercise', 'fitness'],
    category: 'health'
  },
  {
    question: 'what is asthma?',
    answer: 'Chronic lung condition causing wheezing, shortness of breath. Managed with inhalers, avoid triggers.',
    tags: ['asthma', 'respiratory'],
    category: 'health'
  },
  {
    question: 'how to check blood sugar?',
    answer: 'Use glucometer: clean hands, insert strip, prick finger, read result. Track patterns, consult doctor.',
    tags: ['diabetes', 'monitoring'],
    category: 'health'
  },
  {
    question: 'prevent skin cancer?',
    answer: 'Use sunscreen SPF30+, shade 10am-4pm, protective clothing, avoid tanning beds. Early detection saves lives.',
    tags: ['cancer', 'skin', 'prevention'],
    category: 'health'
  },
  {
    question: 'what to do for sprained ankle?',
    answer: 'RICE: Rest, Ice, Compression, Elevation. Pain relief, see doctor if swelling persists.',
    tags: ['injury', 'sprain', 'first aid'],
    category: 'health'
  },
  {
    question: 'importance of dental hygiene?',
    answer: 'Brush 2x/day, floss, regular check-ups prevent cavities, gum disease. Fluoride strengthens teeth.',
    tags: ['dental', 'hygiene'],
    category: 'health'
  },
  {
    question: 'symptoms of food poisoning?',
    answer: 'Nausea, vomiting, diarrhea, stomach cramps within hours. Hydrate, rest; seek care if severe/dehydrated.',
    tags: ['food poisoning', 'gastro'],
    category: 'health'
  },
  {
    question: 'how to stop smoking?',
    answer: 'Set quit date, nicotine replacement, counseling, avoid triggers. Benefits start immediately (WHO).',
    tags: ['smoking', 'quit'],
    category: 'health'
  },
  {
    question: 'what to do for headache?',
    answer: 'Rest in a quiet, dark room. Drink water, apply a cold or warm compress. Over-the-counter pain relievers like paracetamol or ibuprofen can help. Seek medical care for severe, sudden, or frequent headaches. (WHO general guidance)',
    tags: ['headache', 'pain', 'migraine'],
    category: 'health'
  }
];

// Function to seed if empty
export const seedFAQ = async (FAQ) => {
  try {
    const count = await FAQ.countDocuments();

    if (count === 0) {
      if (!initialFAQData || initialFAQData.length === 0) {
        console.log("No FAQ data found to seed.");
        return;
      }

      const faqs = initialFAQData.map(data => ({
        question: data.question.toLowerCase().trim(),
        answer: data.answer.trim(),
        tags: data.tags?.map(tag => tag.toLowerCase()),
        category: data.category?.toLowerCase()
      }));

      await FAQ.insertMany(faqs);

      console.log(`✅ Seeded ${faqs.length} FAQ entries.`);
    } else {
      console.log('⚡ FAQ database already has data, skipping seed.');
    }

  } catch (error) {
    console.error("❌ Error seeding FAQ:", error.message);
  }
};

