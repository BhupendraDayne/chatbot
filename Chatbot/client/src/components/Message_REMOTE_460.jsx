import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";
import { ThumbsUp, ThumbsDown, Volume2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { speakText, stopSpeech } from "../utils/speech";
import NearbyPlaces from './NearbyPlaces';

const Message = ({ message }) => {
  const { axios, token, selectedChat, user } = useAppContext();

  const [feedbackGiven, setFeedbackGiven] = useState(
    message.feedback && message.feedback !== 'none' ? message.feedback : null
  );

  // 🔊 TTS STATE
  const [speaking, setSpeaking] = useState(false);

  // 🔊 TOGGLE SPEAK / STOP
  const handleToggleSpeech = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
    } else {
      speakText(message.content, () => setSpeaking(false));
      setSpeaking(true);
    }
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  const handleFeedback = async (type) => {
    if (!user) return toast('Login to give feedback');
    if (!message._id) return toast('Cannot give feedback on this message');
    if (feedbackGiven) return;

    try {
      const { data } = await axios.post(
        '/api/feedback',
        { chatId: selectedChat._id, messageId: message._id, feedback: type },
        { headers: { Authorization: token } }
      );

      if (data.success) {
        setFeedbackGiven(type);
        toast.success('Feedback saved');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-4 gap-2">
          <img src={assets.user_icon} className="w-8 rounded-full" alt="" />
          <div className="flex flex-col gap-2 p-2 px-2 bg-slate-50
            dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl">
            <p className="text-sm dark:text-primary">{message.content}</p>
            <span className="text-xs text-gray-400">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      ) : (
        <div className="inline-flex flex-col gap-2 p-3 px-4 max-w-2xl bg-primary/20
          dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4">

          {/* AI TEXT (NO HIGHLIGHT) */}
          <div className="text-sm dark:text-primary">
            <Markdown>{message.content}</Markdown>
          </div>

          {/* 📍 Nearby Buttons */}
          <div className="mt-3">
            <NearbyPlaces />
          </div>

          {/* ⏱ TIME + 👍 👎 + 🔊 */}
          <div className="flex items-center justify-between mt-2">

            <span className="text-xs text-gray-400">
              {moment(message.timestamp).fromNow()}
            </span>

            <div className="flex items-center gap-3">

              {/* 👍 */}
              <button
                onClick={() => handleFeedback('up')}
                disabled={feedbackGiven !== null}
                className={`p-1 ${
                  feedbackGiven === 'up'
                    ? 'text-green-500'
                    : 'text-gray-400 hover:text-green-500'
                }`}
              >
                <ThumbsUp size={16} />
              </button>

              {/* 👎 */}
              <button
                onClick={() => handleFeedback('down')}
                disabled={feedbackGiven !== null}
                className={`p-1 ${
                  feedbackGiven === 'down'
                    ? 'text-red-500'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <ThumbsDown size={16} />
              </button>

              {/* 🔊 SPEECH */}
              <button
                onClick={handleToggleSpeech}
                className={`p-2 rounded-full transition ${
                  speaking
                    ? "text-purple-600 bg-purple-100 dark:bg-purple-900/30"
                    : "text-gray-400 hover:text-purple-500"
                }`}
              >
                <Volume2 size={18} />
              </button>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Message;