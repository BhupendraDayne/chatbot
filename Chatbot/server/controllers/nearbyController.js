import axios from "axios";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// export const getNearbyPlaces = async (req, res) => {
//   try {
//     const { lat, lng, type } = req.query;

//     if (!lat || !lng || !type) {
//       return res.status(400).json({
//         success: false,
//         message: "lat, lng, and type are required",
//       });
//     }

//     if (!GOOGLE_PLACES_API_KEY) {
//       return res.status(500).json({
//         success: false,
//         message: "Server configuration error: GOOGLE_PLACES_API_KEY is missing",
//       });
//     }

//     const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
//     const { data } = await axios.get(url, {
//       params: {
//         location: `${lat},${lng}`,
//         radius: 5000,
//         type,
//         key: GOOGLE_PLACES_API_KEY,
//       },
//     });

//     if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
//       return res.status(500).json({
//         success: false,
//         message: `Google Places API error: ${data.status}`,
        
        
//       });
//        console.log("Google Places API Error:",data);
//     }

//     const places = (data.results || []).slice(0, 5).map((place) => {
//       const photoUrl =
//         place.photos && place.photos.length > 0
//           ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
//           : "https://via.placeholder.com/400x300?text=No+Image";

//       let profession = "Doctor";
//       if (type === "doctor") {
//         const excluded = ["point_of_interest", "establishment", "health"];
//         const profType = place.types?.find((t) => !excluded.includes(t));
//         if (profType) {
//           profession = profType
//             .replace(/_/g, " ")
//             .replace(/\b\w/g, (c) => c.toUpperCase());
//         }
//       }

//       return {
//         name: place.name,
//         photoUrl,
//         rating: place.rating,
//         userRatingsTotal: place.user_ratings_total,
//         vicinity: place.vicinity,
//         profession,
//       };
//     });

//     res.json({ success: true, places });
//   } catch (error) {
//     console.error("Nearby Places Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, type } = req.query;

    // 🔥 DUMMY RESPONSE (TESTING)
    return res.json({
      success: true,
      places: [
        {
          name: "City Hospital",
          photoUrl: "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG9zcGl0YWwlMjBidWlsZGluZ3xlbnwwfHwwfHx8MA%3D%3D",
          rating: 4.5,
          userRatingsTotal: 120,
          vicinity: "Near Main Road",
          profession: "Hospital",
        },
        {
          name: "Dr. Sharma Clinic",
          photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          rating: 4.2,
          userRatingsTotal: 80,
          vicinity: "Sector 21",
          profession: "Doctor",
        },
          {
          name: "Dr.Bhupendra Clinic",
          photoUrl: "https://plus.unsplash.com/premium_photo-1658506671316-0b293df7c72b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZG9jdG9yfGVufDB8fDB8fHww",
          rating: 4.2,
          userRatingsTotal: 80,
          vicinity: "Sector 21",
          profession: "Doctor",
        },
      ],
    });

    // ❌ niche ka code temporarily ignore hoga
  } catch (error) {
    console.error("Nearby Places Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};