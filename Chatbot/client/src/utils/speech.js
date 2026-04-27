let currentUtterance = null;

export const speakText = (text, onEnd) => {
  if (!window.speechSynthesis) {
    alert("Text-to-Speech not supported in this browser");
    return;
  }

  // stop previous
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "en-IN";
  utterance.rate = 1;
  utterance.pitch = 1;

  // 🔥 IMPORTANT: wait for voices
  const setVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();

    const voice =
      voices.find(v => v.lang === "en-IN") ||
      voices.find(v => v.lang.includes("en")) ||
      voices[0];

    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  };

  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
  } else {
    setVoiceAndSpeak();
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;
};

export const stopSpeech = () => {
  window.speechSynthesis.cancel();
};