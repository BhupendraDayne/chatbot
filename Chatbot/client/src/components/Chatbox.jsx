import React, { useEffect, useRef, useState } from 'react';
import Loader from "./Loader";
import { useAppContext } from '../context/AppContext';
import { assets } from "../assets/assets";
import Message from './Message';
import toast from 'react-hot-toast';
import { Mic, MicOff, Stethoscope, Building2 } from 'lucide-react';
import gsap from 'gsap';

const Chatbox = () => {
  const containerRef = useRef(null);
  const micRef = useRef(null);
  const { selectedChat, theme, user, axios, token, setUser } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');

  const [ispublished, setIspublished] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionUploading, setPrescriptionUploading] = useState(false);

  const recognitionRef = useRef(null);
  const isPrescriptionUploadingRef = useRef(false);

  // 🎙️ Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setPrompt(transcript);
      };
      recognitionRef.current = recognition;
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  }, []);

  // 🎬 Mic animation with GSAP
  useEffect(() => {
    if (isRecording && micRef.current) {
      gsap.to(micRef.current, {
        scale: 1.15,
        repeat: -1,
        yoyo: true,
        duration: 0.6,
        ease: 'power1.inOut',
      });
    } else {
      gsap.to(micRef.current, { scale: 1, duration: 0.3 });
    }
  }, [isRecording]);

  // 🎙️ Start/stop mic
  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast('🎤 Recording stopped');
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast('🎙️ Listening...');
    }
  };

  // 📩 Submit message
  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!user) return toast('Login to send message');
      setLoading(true);
      const promptCopy = prompt;
      setPrompt('');
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: prompt, timestamp: Date.now() },
      ]);

      const { data } = await axios.post(
        `/api/message/text`,
        { chatId: selectedChat._id, prompt, ispublished },
        { headers: { Authorization: token } }
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.reply]);
        // decrease credits
      setUser((prev) => ({ ...prev, credits: prev.credits - 1 }));

      } else {
        // Next chunks → update last message
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content += chunk;
          return updated;
        });
      }
    }

    // ✅ credits update
    setUser((prev) => ({
      ...prev,
      credits: prev.credits - 1,
    }));
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Stream stopped by user');
    } else {
      toast.error(error.message || 'Streaming error');
    }
  } finally {
    setLoading(false); // 🔥 ALWAYS STOP LOADER
    controllerRef.current = null;
  }
};

  // 📨 Load messages when selected chat changes
  useEffect(() => {
    if (!selectedChat) return;
    // Only sync from server if no prescription upload is in-flight
    if (!isPrescriptionUploadingRef.current) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  // 🔽 Auto scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Chat messages */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === 'dark' ? assets.logo_full_dark2 : assets.logo_full2}
              className="w-full max-w-56 sm:max-w-68"
              alt=""
            />
            <p className="mt-3 text-3xl sm:text-5xl text-center text-gray-500 font-medium dark:text-white">
              Ask Your Health-Related Questions
            </p>
            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              <button
                onClick={() => handleFindNearby('doctors')}
                disabled={isLocating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
              >
                <Stethoscope size={16} />
                Find Nearby Doctor
              </button>
              <button
                onClick={() => handleFindNearby('hospitals')}
                disabled={isLocating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors disabled:opacity-50"
              >
                <Building2 size={16} />
                Find Nearby Hospital
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const questionText = index > 0
            ? (messages[index - 1]?.role === 'user' ? messages[index - 1]?.content : '')
            : '';
          return (
            <Message
              key={index}
              message={message}
              questionText={questionText}
              onFindNearby={handleFindNearby}
              onSendFeedback={(value) => {
                if (message.role !== 'assistant') return;
                if (!user) return toast('Login to send feedback');
                if (!questionText) return;
                axios
                  .post(
                    '/api/message/feedback',
                    { chatId: selectedChat?._id, question: questionText, answer: message.content, value },
                    { headers: { Authorization: token } }
                  )
                  .then(() => toast(value === 'up' ? 'Thanks for the feedback!' : 'Feedback saved.'))
                  .catch(() => toast.error('Failed to send feedback'));
              }}
            />
          );
        })}

        {loading && (
          <div className="flex justify-start items-start my-6">
            <Loader />
          </div>
        )}

        {isLocating && (
          <div className="flex justify-start items-start my-6">
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Finding nearby places...</span>
            </div>
          </div>
        )}
      </div>

      {/* Prompt input box */}
      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 
        rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
      >
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Ask your health-related question"
          className="flex-1 w-full text-sm outline-none"
          required
        />

        {/* 🩺 Prescription file input (hidden) */}
        <input
          id="prescriptionFile"
          type="file"
          accept="image/*"
          capture="camera"
          className="hidden"
          onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
        />

        {/* 🩺 Prescription upload button */}
        <button
          type="button"
          onClick={() => document.getElementById('prescriptionFile')?.click()}
          disabled={prescriptionUploading || !selectedChat}
          className={`p-2 rounded-full transition-all relative ${
            prescriptionUploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
          }`}
          title="Upload prescription"
        >
          <span className="text-sm">🩺</span>
          {/* Show green dot when a file is selected but not yet sent */}
          {prescriptionFile && !prescriptionUploading && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
          )}
        </button>

        {/* 🎤 Mic button */}
        <button
          type="button"
          ref={micRef}
          onClick={handleMicClick}
          className={`p-2 rounded-full transition-all ${
            isRecording
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
          }`}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* 📤 Send button — routes to prescription upload OR text submit */}
        <button
          type="button"
          onClick={prescriptionFile ? onUploadPrescription : onSubmit}
          disabled={prescriptionUploading || loading}
        >
          <img
            src={prescriptionUploading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
            alt=""
          />
        </button>
      </form>
    </div>
  );
};

export default Chatbox;