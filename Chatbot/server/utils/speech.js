// 🔊 Detect language (basic)
const detectLang = (text) => {
  const hindiRegex = /[\u0900-\u097F]/;
  return hindiRegex.test(text) ? "hi-IN" : "en-IN";
};

// 🎤 Get best voice (prefer female)
const getVoice = (lang) => {
  const voices = window.speechSynthesis.getVoices();

  // try female voice
  const female = voices.find(
    (v) => v.lang.includes(lang) && v.name.toLowerCase().includes("female")
  );

  if (female) return female;

  // fallback any matching lang
  const match = voices.find((v) => v.lang.includes(lang));
  return match || voices[0];
};

// ▶️ Speak
export const speakText = (text, rate = 1) => {
  const lang = detectLang(text);

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = lang;
  speech.rate = rate;

  const voice = getVoice(lang);
  if (voice) speech.voice = voice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
};

// ⛔ Stop
export const stopSpeech = () => {
  window.speechSynthesis.cancel();
};