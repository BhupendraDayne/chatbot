 import React, { useEffect, useRef, useState } from 'react';
 import Loader from "./Loader";
import { useAppContext } from '../context/AppContext';
import { assets } from "../assets/assets";
import Message from './Message';
import toast from 'react-hot-toast';
import { Mic, MicOff } from 'lucide-react';
import gsap from 'gsap';
import Credits from '../pages/Credits';
import NearbyPlaces from './NearbyPlaces';

const Chatbox = () => {
  const containerRef = useRef(null);
  const micRef = useRef(null);
  const { selectedChat, theme, user, axios, token, setUser } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
 
  const [ispublished, setIspublished] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
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
                {/* 🔥 BUTTONS (Reusable Component) */}
    <div className="mt-4">
      <NearbyPlaces />
    </div>
          </div>
        )}
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {/* Loading animation */}
        {/* {loading && (
          <div className="loader flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )} */}
     {/* smart loading animation */}
{loading && (
  <div className="flex justify-start items-start my-6">
    <Loader />
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
