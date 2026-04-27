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
  const recognitionRef = useRef(null);

  // 🎙️ Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // change to 'hi-IN' for Hindi
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

  // 🎬 Mic animation with GSAP (no glow)
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
      gsap.to(micRef.current, {
        scale: 1,
        duration: 0.3,
      });
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

  // 🔍 Detect if user is asking for nearby doctors/hospitals
  const detectLocationIntent = (text) => {
    const normalized = text.toLowerCase();
    const doctorPatterns = [
      /nearby doctor/i, /doctors? near me/i, /find doctor/i,
      /show doctor/i, /doctor nearby/i, /nearest doctor/i,
      /need a doctor/i, /looking for doctor/i
    ];
    const hospitalPatterns = [
      /nearby hospital/i, /hospitals? near me/i, /find hospital/i,
      /show hospital/i, /hospital nearby/i, /nearest hospital/i,
      /need a hospital/i, /looking for hospital/i
    ];
    if (doctorPatterns.some(p => p.test(normalized))) return 'doctors';
    if (hospitalPatterns.some(p => p.test(normalized))) return 'hospitals';
    return null;
  };

  // 🔍 Find nearby doctors / hospitals (triggered from message action buttons)
  const handleFindNearby = (type) => {

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    if (!user) {
      toast('Login to find nearby ' + type);
      return;
    }
    if (!selectedChat) {
      toast('Please select a chat first');
      return;
    }

    setIsLocating(true);
    toast('📍 Locating you...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const { data } = await axios.post(
            `/api/location/${type}`,
            { chatId: selectedChat._id, lat: latitude, lng: longitude },
            { headers: { Authorization: token } }
          );

          if (data.success) {
            setMessages((prev) => [...prev, data.reply]);
          } else {
            toast.error(data.message || `Failed to fetch nearby ${type}.`);
          }
        } catch (error) {
          toast.error(error.message || `Failed to fetch nearby ${type}.`);
          console.error(error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === 1) {
          toast.error('Location permission denied. Please enable location access.');
        } else {
          toast.error('Unable to retrieve your location.');
        }
      }
    );
  };

  // 📩 Submit message
  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!user) return toast('Login to send message');
      
      // Check if user is asking for nearby doctors/hospitals
      const locationType = detectLocationIntent(prompt);
      if (locationType) {
        setPrompt('');
        handleFindNearby(locationType);
        return;
      }
      
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
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPrompt('');
      setLoading(false);
    }
  };

  // 📨 Load chat messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
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

        {messages.map((message, index) => (
          <Message key={index} message={message} onFindNearby={handleFindNearby} />
        ))}

        {/* smart loading animation */}
        {loading && (
          <div className="flex justify-start items-start my-6">
            <Loader />
          </div>
        )}

        {/* location loading indicator */}
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

        {/* 📤 Send button */}
        <button type="submit" disabled={loading}>
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
            alt=""
          />
        </button>
      </form>
    </div>
  );
};

export default Chatbox;
