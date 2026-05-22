import React, { useEffect } from 'react';
import { assets } from '../assets/assets';
import moment from 'moment';
import Markdown from 'react-markdown';
import Prism from 'prismjs';
import LocationCards from './LocationCards';
import { Stethoscope, Building2 } from 'lucide-react';

const Message = ({ message, questionText, onFindNearby, onSendFeedback, voiceLang = 'en-IN' }) => {

  // If user wrote Hindi (Devanagari), speak in Hindi automatically.
  const detectHindi = (text) => /[\u0900-\u097F]/.test(text || '');


  // const speakText = (text) => {
  //   if (!('speechSynthesis' in window)) return;

  //   const synth = window.speechSynthesis;
  //   synth.cancel();

  //   const clean = (text || '')
  //     .replace(/\*\*([^*]+)\*\*/g, '$1')
  //     .replace(/\*([^*]+)\*/g, '$1')
  //     .replace(/`([^`]+)`/g, '$1')
  //     .replace(/[_#>-]/g, ' ')
  //     .replace(/\s+/g, ' ')
  //     .trim();

  //   const utter = new SpeechSynthesisUtterance(clean);
  //   const lang = detectHindi(text) ? 'hi-IN' : (voiceLang === 'hi-IN' ? 'hi-IN' : 'en-IN');
  //   utter.lang = lang;

  //   utter.rate = 1;
  //   utter.pitch = 1;

  //   synth.speak(utter);
  // };
const speakText = (text) => {
  if (!('speechSynthesis' in window)) return;

  const synth = window.speechSynthesis;
  synth.cancel();

  const clean = (text || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[_#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const lang = detectHindi(text) ? 'hi-IN' : (voiceLang === 'hi-IN' ? 'hi-IN' : 'en-IN');
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = lang;
  utter.rate = 1;
  utter.pitch = 1;

  const assignVoiceAndSpeak = () => {
    const voices = synth.getVoices();

    // Try exact match first (e.g. "hi-IN"), then language prefix (e.g. "hi")
    const preferred = voices.find(v => v.lang === lang)
      || voices.find(v => v.lang.startsWith(lang.split('-')[0]));

    if (preferred) utter.voice = preferred;
    synth.speak(utter);
  };

  // Voices may not be loaded yet on first call
  if (synth.getVoices().length > 0) {
    assignVoiceAndSpeak();
  } else {
    synth.addEventListener('voiceschanged', assignVoiceAndSpeak, { once: true });
  }
};
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  const isAssistant = message.role === 'assistant';
  const hasLocation = message.locationType && message.locationData?.length > 0;
  const isImage =
    message.isImage ||
    /\.(png|jpg|jpeg|gif)$/i.test(message.content) ||
    (message.content && message.content.startsWith('http'));

  return (
    <div>
      {message.role === 'user' ? (
        <div className="flex items-start justify-end my-4 gap-2">
          <img src={assets.user_icon} className="w-8 rounded-full" alt="" />
          <div
            className="flex flex-col gap-2 p-2 px-2 bg-slate-50
            dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl"
          >
            <p className="text-sm dark:text-primary">{message.content}</p>
            <span className="text-xs text-gray-400 dark:text-[B1A6C0]">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20
          dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4"
        >
          {isImage ? (
            <img
              src={message.content}
              className="w-full max-w-md mt-2 rounded-md"
              alt="Generated content"
            />
          ) : hasLocation ? (
            <>
              <div className="text-sm dark:text-primary reset-tw">
                <Markdown>{message.content}</Markdown>
              </div>
              <LocationCards type={message.locationType} data={message.locationData} />
            </>
          ) : (
            <div className="text-sm dark:text-primary reset-tw">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          <span className="text-xs text-gray-400 dark:text-[B1A6C0]">
            {moment(message.timestamp).fromNow()}
          </span>

          {isAssistant && !hasLocation && !isImage && (
            <div className="flex flex-wrap gap-2 mt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(message.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200
                    border border-purple-200 dark:border-purple-700 rounded-full
                    hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                >
                  🔊 Speak
                </button>
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                    bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white
                    border border-gray-200 dark:border-gray-600 rounded-full
                    hover:bg-gray-200 dark:hover:bg-gray-600/70 transition-colors"
                >
                  ⏹ Stop
                </button>
              </div>

              {onSendFeedback && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSendFeedback('up')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200
                      border border-green-200 dark:border-green-700 rounded-full
                      hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    title="Thumbs up"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => onSendFeedback('down')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200
                      border border-red-200 dark:border-red-700 rounded-full
                      hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    title="Thumbs down"
                  >
                    👎
                  </button>
                </div>
              )}

              {onFindNearby && (
                <>
                  <button
                    onClick={() => onFindNearby('doctors')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300
                      border border-blue-200 dark:border-blue-700 rounded-full
                      hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Stethoscope size={14} />
                    Nearby Doctor
                  </button>

                  <button
                    onClick={() => onFindNearby('hospitals')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                      bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300
                      border border-teal-200 dark:border-teal-700 rounded-full
                      hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                  >
                    <Building2 size={14} />
                    Nearby Hospital
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Message;

