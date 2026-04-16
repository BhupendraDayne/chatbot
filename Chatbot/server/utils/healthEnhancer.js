const healthKeywords = [
  "symptoms",
  "disease",
  "illness",
  "health",
  "medical",
  "doctor",
  "medicine",
  "treatment",
  "diagnosis",
  "condition",
  "pain",
  "fever",
  "cough",
  "headache",
  "nausea",
  "vomit",
  "diabetes",
  "cancer",
  "heart",
  "lung",
  "kidney",
  "liver",
  "brain",
  "mental",
  "anxiety",
  "depression",
  "stress",
  "therapy",
  "vaccine",
  "infection",
  "virus",
  "bacteria",
  "immune",
  "nutrition",
  "diet",
  "exercise",
  "sleep",
  "pregnancy",
  "childbirth",
  "menopause",
  "aging",
  "chronic",
  "acute",
  "emergency",
  "first aid",
];

export const isHealthRelated = async (text) => {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  // Check for health-related keywords
  try {
    const healthWordCount = words.filter((word) =>
      healthKeywords.some(
        (keyword) => word.includes(keyword) || keyword.includes(word),
      ),
    ).length;

    // Consider it health-related if more than 20% of words are health-related
    return healthWordCount / words.length > 0.2 || healthWordCount >= 2;
  } catch (error) {
    console.error("Health classifier error:", error);
    return false;
  }
};
