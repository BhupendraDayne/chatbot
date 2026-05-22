import React from "react";
import { Star, MapPin, Stethoscope, Building2 } from "lucide-react";

const DoctorCard = ({ doctor }) => {
  const { name, rating, feedback, specialty, address } = doctor;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;

  return (
    <div className="bg-white dark:bg-[#3A2155] border border-[#80609F]/20 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
          <Stethoscope size={20} className="text-blue-600 dark:text-blue-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{specialty}</p>

          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < fullStars
                      ? "text-yellow-400 fill-yellow-400"
                      : i === fullStars && hasHalf
                      ? "text-yellow-400 fill-yellow-400/50"
                      : "text-gray-300 dark:text-gray-600"
                  }
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{rating}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">({feedback} reviews)</span>
          </div>

          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={12} />
            <span className="truncate">{address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HospitalCard = ({ hospital }) => {
  const { name, image, address, rating } = hospital;

  return (
    <div className="bg-white dark:bg-[#3A2155] border border-[#80609F]/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 relative">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNDAwIDIwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2NjYyIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiPkhvc3BpdGFsPC90ZXh0Pjwvc3ZnPg==";
          }}
        />
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-semibold text-gray-800 dark:text-white">{rating || "N/A"}</span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start gap-2">
          <Building2 size={18} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</h4>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <MapPin size={12} />
              <span className="truncate">{address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LocationCards = ({ type, data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        No {type} found nearby.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
      {type === "doctors"
        ? data.map((doc, i) => <DoctorCard key={i} doctor={doc} />)
        : data.map((hosp, i) => <HospitalCard key={i} hospital={hosp} />)}
    </div>
  );
};

export default LocationCards;

