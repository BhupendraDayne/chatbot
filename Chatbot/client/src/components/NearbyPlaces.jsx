import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Stethoscope,
  Building2,
  MapPin,
  Star,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const NearbyPlaces = () => {
  const { axios, token } = useAppContext();
  const [activeType, setActiveType] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchPlaces = (type) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setActiveType(type);
    setPlaces([]);
    setHasSearched(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { data } = await axios.get("/api/nearby", {
            params: { lat: latitude, lng: longitude, type },
            headers: { Authorization: token },
          });
          if (data.success) {
            setPlaces(data.places);
            setHasSearched(true);
          } else {
            toast.error(data.message);
            console.error("Nearby API Error:", data);
          }
        } catch (err) {
          console.error("Nearby Request Failed:", err);
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Failed to fetch nearby places";
          toast.error(msg);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        console.error("Geolocation Error:", error);
        if (error.code === 1) {
          toast.error("Location permission denied. Please allow location access.");
        } else if (error.code === 2) {
          toast.error("Location unavailable. Please try again.");
        } else if (error.code === 3) {
          toast.error("Location request timed out. Please try again.");
        } else {
          toast.error("Location access denied or unavailable");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => fetchPlaces("doctor")}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
            bg-[#80609F]/20 dark:bg-[#57317C]/50 border border-[#80609F]/30
            text-[#4A306D] dark:text-[#D8CCE6] hover:bg-[#80609F]/30 transition disabled:opacity-50"
        >
          <Stethoscope size={14} />
          Nearby Doctor
        </button>
        <button
          onClick={() => fetchPlaces("hospital")}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
            bg-[#80609F]/20 dark:bg-[#57317C]/50 border border-[#80609F]/30
            text-[#4A306D] dark:text-[#D8CCE6] hover:bg-[#80609F]/30 transition disabled:opacity-50"
        >
          <Building2 size={14} />
          Nearby Hospital
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 mt-3 text-gray-500 dark:text-[#B1A6C0]">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-xs">Fetching nearby {activeType}s...</span>
        </div>
      )}

      {hasSearched && places.length === 0 && !loading && (
        <div className="mt-3 text-xs text-gray-500 dark:text-[#B1A6C0]">
          No nearby {activeType}s found in your area.
        </div>
      )}

      {places.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {places.map((place, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#3A2255]/50 border border-[#80609F]/20 rounded-md overflow-hidden
                hover:shadow-md transition"
            >
              <img
                src={place.photoUrl}
                alt={place.name}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Image";
                }}
              />
              <div className="p-2.5 flex flex-col gap-1">
                <h4 className="font-semibold text-sm text-gray-800 dark:text-[#F0E6FA] line-clamp-1">
                  {place.name}
                </h4>

                {activeType === "doctor" ? (
                  <>
                    <p className="text-xs text-gray-500 dark:text-[#B1A6C0] capitalize">
                      {place.profession}
                    </p>
                    <div className="flex items-center gap-1 text-xs mt-0.5">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-gray-700 dark:text-[#D8CCE6]">
                        {place.rating || "N/A"}
                      </span>
                      <span className="text-gray-400 dark:text-[#80609F]">
                        ({place.userRatingsTotal || 0} reviews)
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-1 text-xs text-gray-500 dark:text-[#B1A6C0] mt-0.5">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-2">
                      {place.vicinity || "Location unavailable"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyPlaces;

