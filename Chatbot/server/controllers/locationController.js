import axios from "axios";
import Chat from "../models/chat.js";

/* ------------------------------------------------------------------ */
/*  Helper – generate a static map image URL (OpenStreetMap based)    */
/* ------------------------------------------------------------------ */
const staticMapUrl = (lat, lon) =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=400x200&maptype=mapnik&markers=${lat},${lon},ol-marker`;

/* ------------------------------------------------------------------ */
/*  Helper – realistic mock data (used when no API key / fallback)    */
/* ------------------------------------------------------------------ */
const mockDoctors = (lat, lon) => [
  { name: "Dr. A. Sharma Clinic", rating: 4.5, feedback: 124, specialty: "General Physician", address: "Sector 12, Near City Mall", lat: lat + 0.002, lon: lon + 0.001 },
  { name: "Apollo Medical Centre", rating: 4.8, feedback: 312, specialty: "Multi-Speciality", address: "Main Road, Block B", lat: lat - 0.001, lon: lon + 0.003 },
  { name: "City Health Care", rating: 4.2, feedback: 89, specialty: "Family Medicine", address: "Green Park Avenue", lat: lat + 0.003, lon: lon - 0.002 },
  { name: "Wellness Point", rating: 4.6, feedback: 156, specialty: "Internal Medicine", address: "Near Metro Station", lat: lat - 0.002, lon: lon - 0.001 },
];

const mockHospitals = (lat, lon) => [
  { name: "City General Hospital", image: staticMapUrl(lat + 0.002, lon + 0.001), address: "Sector 5, Downtown", lat: lat + 0.002, lon: lon + 0.001, rating: 4.3 },
  { name: "Sunrise Multi-Speciality Hospital", image: staticMapUrl(lat - 0.001, lon + 0.003), address: "Ring Road, East Wing", lat: lat - 0.001, lon: lon + 0.003, rating: 4.7 },
  { name: "Care & Cure Hospital", image: staticMapUrl(lat + 0.003, lon - 0.002), address: "Green Valley, Phase 2", lat: lat + 0.003, lon: lon - 0.002, rating: 4.1 },
  { name: "Hope Medical Institute", image: staticMapUrl(lat - 0.002, lon - 0.001), address: "Near Central Park", lat: lat - 0.002, lon: lon - 0.001, rating: 4.5 },
];

/* ------------------------------------------------------------------ */
/*  Google Places helper                                               */
/* ------------------------------------------------------------------ */
const fetchGooglePlaces = async (lat, lng, type, radius = 5000) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
  const { data } = await axios.get(url);
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") return null;
  return data.results || [];
};

const photoUrl = (ref, apiKey) =>
  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${apiKey}`;

/* ------------------------------------------------------------------ */
/*  POST /api/location/doctors                                         */
/* ------------------------------------------------------------------ */
export const findNearbyDoctors = async (req, res) => {
  try {
    const { chatId, lat, lng } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found." });

    let doctors = [];
    const googleResults = await fetchGooglePlaces(lat, lng, "doctor");

    if (googleResults && googleResults.length > 0) {
      doctors = googleResults.slice(0, 6).map((p) => ({
        name: p.name,
        rating: p.rating || 0,
        feedback: p.user_ratings_total || 0,
        specialty: p.types?.[0]?.replace(/_/g, " ") || "General Physician",
        address: p.vicinity || "",
        lat: p.geometry?.location?.lat,
        lon: p.geometry?.location?.lng,
        placeId: p.place_id,
      }));
    } else {
      doctors = mockDoctors(lat, lng);
    }

    const content = `👨‍⚕️ **Nearby Doctors** (${doctors.length} found within 5 km)`;
    const reply = {
      role: "assistant",
      content,
      timestamp: Date.now(),
      isImage: false,
      locationType: "doctors",
      locationData: doctors,
    };

    chat.messages.push(reply);
    await chat.save();

    res.json({ success: true, reply });
  } catch (error) {
    console.error("Doctor fetch error:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/location/hospitals                                       */
/* ------------------------------------------------------------------ */
export const findNearbyHospitals = async (req, res) => {
  try {
    const { chatId, lat, lng } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found." });

    let hospitals = [];
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const googleResults = await fetchGooglePlaces(lat, lng, "hospital");

    if (googleResults && googleResults.length > 0) {
      hospitals = googleResults.slice(0, 6).map((p) => ({
        name: p.name,
        image: p.photos?.[0]?.photo_reference
          ? photoUrl(p.photos[0].photo_reference, apiKey)
          : staticMapUrl(p.geometry?.location?.lat, p.geometry?.location?.lng),
        address: p.vicinity || "",
        lat: p.geometry?.location?.lat,
        lon: p.geometry?.location?.lng,
        rating: p.rating || 0,
        placeId: p.place_id,
      }));
    } else {
      hospitals = mockHospitals(lat, lng);
    }

    const content = `🏥 **Nearby Hospitals** (${hospitals.length} found within 5 km)`;
    const reply = {
      role: "assistant",
      content,
      timestamp: Date.now(),
      isImage: false,
      locationType: "hospitals",
      locationData: hospitals,
    };

    chat.messages.push(reply);
    await chat.save();

    res.json({ success: true, reply });
  } catch (error) {
    console.error("Hospital fetch error:", error);
    res.json({ success: false, message: error.message });
  }
};

