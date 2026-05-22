const healthKeywords = [
  // General medical
  "symptom", "symptoms", "disease", "illness", "health", "medical",
  "doctor", "medicine", "treatment", "diagnosis", "condition",
  "pain", "fever", "cough", "headache", "nausea", "vomit", "vomiting",
  "chronic", "acute", "emergency", "disorder", "syndrome", "infection",
  "therapy", "therapist", "clinic", "hospital", "nurse", "surgeon",
  "prescription", "medication", "dose", "dosage", "side effect",

  // BP / cardiovascular
  "blood pressure", "high blood pressure", "low blood pressure",
  "hypertension", "hypotension", "high bp", "bp high", "low bp",
  "bp low", "systolic", "diastolic", "bp", "pulse", "heart rate",
  "heart", "cardiac", "artery", "vein", "cholesterol", "stroke",
  "heart attack", "chest pain", "palpitation",

  // Common conditions
  "diabetes", "sugar", "insulin", "thyroid", "cancer", "tumor",
  "asthma", "allergy", "arthritis", "osteoporosis", "anemia",
  "kidney", "liver", "lung", "brain", "nerve", "bone", "joint",
  "muscle", "skin", "eye", "ear", "nose", "throat",

  // Mental health
  "mental", "anxiety", "depression", "stress", "panic", "phobia",
  "bipolar", "schizophrenia", "insomnia", "sleep disorder", "ptsd",
  "ocd", "adhd", "autism", "psychological", "psychiatrist",

  // Symptoms
  "dizziness", "fatigue", "weakness", "swelling", "rash", "itching",
  "bleeding", "bruise", "wound", "fracture", "sprain", "burn",
  "dehydration", "constipation", "diarrhea", "bloating", "cramp",
  "shortness of breath", "breathing", "wheezing", "sneezing",
  "runny nose", "sore throat", "blurred vision", "numbness",
  "tingling", "tremor", "seizure", "fainting", "unconscious",
  "obesity", "weight loss", "weight gain", "appetite",

  // Reproductive / lifecycle
  "pregnancy", "pregnant", "childbirth", "menopause", "menstrual",
  "period", "fertility", "ovulation", "breastfeeding", "newborn",
  "infant", "aging", "elderly",

  // Preventive / lifestyle
  "vaccine", "vaccination", "immunization", "nutrition", "diet",
  "exercise", "fitness", "sleep", "hydration", "hygiene", "sanitation",
  "first aid", "oxygen", "immune", "virus", "bacteria", "parasite",
  "malaria", "dengue", "tuberculosis", "hiv", "aids", "hepatitis",
  "covid", "flu", "influenza",

  // Hindi health terms (Hinglish / Devanagari-romanized)
  "bukhar",       // fever
  "dard",         // pain
  "sar dard",     // headache
  "pet dard",     // stomach pain
  "khoon",        // blood
  "dawai",        // medicine
  "sehat",        // health
  "bimari",       // disease/illness
  "ilaj",         // treatment
  "doctor",       // same in Hindi
  "bp kam",       // low bp
  "bp zyada",     // high bp
  "sugar",        // diabetes (commonly used in Hindi)
  "nabz",         // pulse
  "sans",         // breath
  "ulti",         // vomit
  "dast",         // diarrhea
  "khansi",       // cough
  "bukhaar",      // fever (alternate spelling)
  "neend",        // sleep
  "kamzori",      // weakness
  "thakan",       // fatigue
  "aankhein",     // eyes
  "chest",        // chest (used in Hinglish)
  "pet",          // stomach
  "ghabrahat",    // anxiety/panic
  "chikitsa",     // treatment/medical care
];

export const isHealthRelated = async (text) => {
  try {
    const lowerText = (text || '').toLowerCase().trim();

    if (!lowerText) return false;

    // STEP 1: Check multi-word phrase keywords against full text
    // e.g. "blood pressure", "first aid", "heart attack", "high bp"
    const phraseMatch = healthKeywords
      .filter(kw => kw.includes(' '))
      .some(kw => lowerText.includes(kw));

    if (phraseMatch) return true;

    // STEP 2: Check individual words against single-word keywords
    const singleKeywords = healthKeywords.filter(kw => !kw.includes(' '));
    const words = lowerText.split(/\s+/);

    const matchedCount = words.filter(word =>
      word.length > 2 && singleKeywords.some(kw => word.includes(kw))
    ).length;

    // Pass if 2+ health words found, or >20% of words are health-related
    return matchedCount >= 2 || matchedCount / words.length > 0.2;

  } catch (error) {
    console.error("Health classifier error:", error);
    return false;
  }
};