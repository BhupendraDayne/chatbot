import React, { useEffect } from 'react';
import { assets } from '../assets/assets';
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";
import LocationCards from "./LocationCards";
import { Stethoscope, Building2 } from "lucide-react";

const Message = ({ message, onFindNearby }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  const isAssistant = message.role === "assistant";
  const hasLocation = message.locationType && message.locationData?.length > 0;
  const isImage = message.isImage ||

    /\.(png|jpg|jpeg|gif)$/i.test(message.content) ||
    (message.content && message.content.startsWith("http"));

  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-4 gap-2">
          <img src={assets.user_icon} className="w-8 rounded-full" alt="" />
          <div className="flex flex-col gap-2 p-2 px-2 bg-slate-50
            dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md max-w-2xl">
            <p className="text-sm dark:text-primary">{message.content}</p>
            <span className="text-xs text-gray-400 dark:text-[B1A6C0]">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      ) : (
        // AI generated text or image
        <div className="inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20
          dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4">
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

          {/* Action buttons for assistant text messages that don't already have location data */}
          {isAssistant && !hasLocation && !isImage && onFindNearby && (
            <div className="flex flex-wrap gap-2 mt-1">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Message;
