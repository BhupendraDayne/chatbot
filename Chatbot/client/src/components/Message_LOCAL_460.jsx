 import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import moment from "moment";
import Markdown from "react-markdown";
import Prism from "prismjs";
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Message = ({ message }) => {
  const { axios, token } = useAppContext();
  const [showPlaces, setShowPlaces] = useState(null); // 'doctor' or 'hospital'
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [message.content]);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log('User location retrieved:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          reject(new Error('Unable to retrieve your location. Please enable location access.'));
        }
      );
    });
  };

  const fetchNearbyPlaces = async (type) => {
    try {
      setLoadingPlaces(true);
      const location = await getLocation();
      
      const { data } = await axios.post(
        '/api/message/nearby-places',
        { type, location },
        { headers: { Authorization: token } }
      );

      if (data.success) {
        setPlaces(data.places || []);
        setShowPlaces(type);
        if (!data.places || data.places.length === 0) {
          console.log('No nearby places found for the given location and type.', data);
          toast('No nearby places found for your location.');
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch nearby places');
    } finally {
      setLoadingPlaces(false);
    }
  };

  const renderPlaceCard = (place, type) => {
    if (type === 'doctor') {
      return (
        <div key={place.name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-3">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{place.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            <span className="font-medium">Profession:</span> {place.types?.join(', ') || 'Medical Professional'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Rating:</span> ⭐ {place.rating || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">Address:</span> {place.address}
          </p>
          {place.reviews && place.reviews.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Feedback:</p>
              {place.reviews.slice(0, 2).map((review, idx) => (
                <p key={idx} className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                  "{review.text?.substring(0, 100)}..."
                </p>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div key={place.name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-3">
          <div className="flex items-start gap-3">
            {place.photoUrl && (
              <img
                src={place.photoUrl}
                alt={place.name}
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{place.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="font-medium">Location:</span> {place.address}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Rating:</span> ⭐ {place.rating || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      );
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
            <span className="text-xs text-gray-400 dark:text-[B1A6C0]">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      ) : (
        // AI generated text or image
        <div className="inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20
          dark:bg-[#57317C]/30 border border-[#80609F]/30 rounded-md my-4">
          {
            message.Isimage ||
            /\.(png|jpg|jpeg|gif)$/i.test(message.content) ||
            (message.content && message.content.startsWith("http")) ? (
              <img
                src={message.content}
                className="w-full max-w-md mt-2 rounded-md"
                alt="Generated content"
              />
            ) : (
              <div className="text-sm dark:text-primary reset-tw">
                <Markdown>{message.content}</Markdown>
              </div>
            )
          }
          
          {/* Action buttons for AI messages */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => fetchNearbyPlaces('doctor')}
              disabled={loadingPlaces}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors disabled:opacity-50"
            >
              {loadingPlaces ? 'Loading...' : '👨‍⚕️ Nearby Doctor'}
            </button>
            <button
              onClick={() => fetchNearbyPlaces('hospital')}
              disabled={loadingPlaces}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors disabled:opacity-50"
            >
              {loadingPlaces ? 'Loading...' : '🏥 Nearby Hospital'}
            </button>
          </div>

          {/* Display places */}
          {showPlaces && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                {showPlaces === 'doctor' ? 'Nearby Doctors' : 'Nearby Hospitals'}
              </h4>
              {places.length > 0 ? (
                <div className="space-y-2">
                  {places.map((place) => renderPlaceCard(place, showPlaces))}
                </div>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300 p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                  No nearby {showPlaces === 'doctor' ? 'doctors' : 'hospitals'} were found for your current location.
                </div>
              )}
            </div>
          )}

          <span className="text-xs text-gray-400 dark:text-[B1A6C0]">
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  );
};

export default Message;
