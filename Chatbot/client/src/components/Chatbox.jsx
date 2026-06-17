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
  // const onSubmit = async (e) => {
  //   try {
  //     e.preventDefault();
  //     if (!user) return toast('Login to send message');
  //     if (!selectedChat?._id) return toast('Please select a chat first');

  //     setLoading(true);
  //     const promptCopy = prompt;
  //     const userMessage = { role: 'user', content: prompt, timestamp: Date.now() };

  //     setMessages((prev) => [...prev, userMessage]);
  //     setPrompt('');

  //     const response = await fetch(`/api/message/text?stream=true`, {
  //       method: 'POST',
  //       headers: {
  //         Authorization: token,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         chatId: selectedChat._id,
  //         prompt,
  //         location: selectedChat.location || null,
  //         ispublished,
  //       }),
  //     });

  //     if (!response.ok || !response.body) {
  //       const errorText = await response.text();
  //       throw new Error(errorText || 'Unable to stream response from server');
  //     }

  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder();
  //     let streamedText = '';
  //     let assistantMessageAdded = false;

  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) break;
  //       const chunk = decoder.decode(value, { stream: true });
  //       streamedText += chunk;

  //       // Add assistant message on first chunk
  //       if (!assistantMessageAdded) {
  //         setMessages((prev) => [
  //           ...prev,
  //           {
  //             role: 'assistant',
  //             content: chunk,
  //             timestamp: Date.now(),
  //             isImage: false,
  //           },
  //         ]);
  //         assistantMessageAdded = true;
  //       } else {
  //         // Update assistant message with new chunks
  //         setMessages((prev) => {
  //           const updated = [...prev];
  //           updated[updated.length - 1] = {
  //             ...updated[updated.length - 1],
  //             content: updated[updated.length - 1].content + chunk,
  //           };
  //           return updated;
  //         });
  //       }
  //     }

  //     setUser((prev) => ({ ...prev, credits: prev.credits - 1 }));
  //   } catch (error) {
  //     toast.error(error.message || 'Something went wrong while streaming the answer');
  //     setPrompt(promptCopy);
  //     // Remove the last user message on error
  //     setMessages((prev) => prev.slice(0, -1));
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const controllerRef = useRef(null);

const onSubmit = async (e) => {
  e.preventDefault();

  // 🔴 अगर already loading है → STOP STREAM
  if (loading && controllerRef.current) {
    controllerRef.current.abort();
    setLoading(false);
    return;
  }

  try {
    if (!user) return toast('Login to send message');
    if (!selectedChat?._id) return toast('Please select a chat first');

    setLoading(true);

    const promptCopy = prompt;

    const userMessage = {
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    // setMessages((prev) => [...prev, userMessage]);
    // setPrompt('');

    // 🔥 AbortController setup
    const controller = new AbortController();
    controllerRef.current = controller;

    const response = await fetch(`/api/message/text?stream=true`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: selectedChat._id,
        prompt,
        location: selectedChat.location || null,
        ispublished,
      }),
      signal: controller.signal, // 🔥 important
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      throw new Error(errorText || 'Stream failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let assistantMessageAdded = false;

    while (true) {
      const { done, value } = await reader.read();

      // ✅ STREAM COMPLETE
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });

      // First chunk → create message
      if (!assistantMessageAdded) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: chunk,
            timestamp: Date.now(),
            isImage: false,
          },
        ]);
        assistantMessageAdded = true;
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
