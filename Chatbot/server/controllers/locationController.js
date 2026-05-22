import Chat from "../models/chat.js";

const buildContent = (emoji, label, count) =>
  count
    ? `${emoji} **${label}** (${count} found nearby).`
    : `${emoji} **${label}** (No ${label.toLowerCase()} found nearby at the moment).`;

// Predefined nearby listings for Khandwa (no Google API calls / no API keys)
const PREDEFINED_DOCTORS = [
  {
    name: "Dr. Suresh Patel",
    rating: 4.7,
    feedback: 320,
    specialty: "General Physician",
    address: "Anand Nagar, Khandwa",
  },
  {
    name: "Dr. Neha Sharma",
    rating: 4.6,
    feedback: 210,
    specialty: "Gynecologist",
    address: "Civil Lines, Khandwa",
  },
  {
    name: "Dr. Amit Verma",
    rating: 4.5,
    feedback: 180,
    specialty: "Pediatrician",
    address: "Near Bus Stand, Khandwa",
  },
  {
    name: "Dr. Pooja Jain",
    rating: 4.8,
    feedback: 410,
    specialty: "Dermatologist",
    address: "Moghat Road, Khandwa",
  },
  {
    name: "Dr. Rahul Mishra",
    rating: 4.4,
    feedback: 150,
    specialty: "ENT Specialist",
    address: "Padam Nagar, Khandwa",
  },
  {
    name: "Dr. Vivek Dubey",
    rating: 4.5,
    feedback: 198,
    specialty: "Orthopedic",
    address: "Near Railway Station, Khandwa",
  },
  {
    name: "Dr. Meena Joshi",
    rating: 4.7,
    feedback: 275,
    specialty: "Family Medicine",
    address: "Jawar Road, Khandwa",
  },
  {
    name: "Dr. Rakesh Agrawal",
    rating: 4.3,
    feedback: 132,
    specialty: "Cardiologist",
    address: "Teen Pulia, Khandwa",
  },
  {
    name: "Dr. Nidhi Tiwari",
    rating: 4.6,
    feedback: 240,
    specialty: "Eye Specialist",
    address: "Near Ghantaghar, Khandwa",
  },
];

const HOSPITAL_PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64," +
  Buffer.from(`
<svg xmlns='http://www.w3.org/2000/svg' width='800' height='360'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#e0f2fe'/>
      <stop offset='100%' stop-color='#bae6fd'/>
    </linearGradient>
  </defs>
  <rect width='800' height='360' fill='url(#g)'/>
  <rect x='40' y='60' width='720' height='240' rx='22' fill='#0f172a' opacity='0.08'/>
  <text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='34' fill='#0f172a'>Hospital</text>
  <text x='50%' y='62%' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='18' fill='#334155'>Predefined nearby listing</text>
</svg>`.trim()).toString('base64');

const PREDEFINED_HOSPITALS = [
  {
    name: "District Hospital Khandwa",
    rating: 4.4,
    address: "Civil Lines, Khandwa",
  },
  {
    name: "Charitable Hospital",
    rating: 4.2,
    address: "Bombay Bazaar, Khandwa",
  },
  {
    name: "Aarogya Hospital",
    rating: 4.5,
    address: "Moghat Road, Khandwa",
  },
  {
    name: "Sanjeevani Hospital",
    rating: 4.6,
    address: "Near Bus Stand, Khandwa",
  },
  {
    name: "City Care Hospital",
    rating: 4.3,
    address: "Anand Nagar, Khandwa",
  },
  {
    name: "Lifeline Multispeciality Hospital",
    rating: 4.7,
    address: "Padam Nagar, Khandwa",
  },
  {
    name: "Narmada Trauma Center",
    rating: 4.5,
    address: "Near Railway Station, Khandwa",
  },
  {
    name: "Shree Krishna Hospital",
    rating: 4.4,
    address: "Jawar Road, Khandwa",
  },
  {
    name: "Sunrise Hospital",
    rating: 4.3,
    address: "Teen Pulia, Khandwa",
  },
  {
    name: "Metro Hospital Khandwa",
    rating: 4.6,
    address: "Near Ghantaghar, Khandwa",
  },
];

// --- POST /api/location/doctors ---
export const findNearbyDoctors = async (req, res) => {
  try {
    const { chatId, lat, lng } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found." });

    // Return Khandwa doctors list (9)
    const doctors = PREDEFINED_DOCTORS.map((d, i) => ({
      ...d,
      lat,
      lon: lng,
      placeId: `predefined-doctor-${i + 1}`,
    }));

    const reply = {
      role: "assistant",
      content: buildContent("👨‍⚕️", "Nearby Doctors", doctors.length),
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

// --- POST /api/location/hospitals ---
export const findNearbyHospitals = async (req, res) => {
  try {
    const { chatId, lat, lng } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found." });

    // Return Khandwa hospitals list (10)
    const hospitals = PREDEFINED_HOSPITALS.map((h, i) => ({
      ...h,
      image: HOSPITAL_PLACEHOLDER_IMAGE,
      lat,
      lon: lng,
      placeId: `predefined-hospital-${i + 1}`,
    }));

    const reply = {
      role: "assistant",
      content: buildContent("🏥", "Nearby Hospitals", hospitals.length),
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

