import axios from "axios";

const MAPMYINDIA_CLIENT_ID = process.env.MAPMYINDIA_CLIENT_ID;
const MAPMYINDIA_CLIENT_SECRET = process.env.MAPMYINDIA_CLIENT_SECRET;
const TOKEN_URL = "https://outpost.mapmyindia.com/api/security/oauth/token";
const NEARBY_URL = "https://atlas.mapmyindia.com/api/places/nearby/json";

let mapMyIndiaToken = null;
let tokenExpiry = 0;

const getMapMyIndiaToken = async () => {
  const now = Date.now();
  if (mapMyIndiaToken && tokenExpiry > now + 60000) {
    return mapMyIndiaToken;
  }

  const response = await axios.post(
    `${TOKEN_URL}?grant_type=client_credentials&client_id=${MAPMYINDIA_CLIENT_ID}&client_secret=${MAPMYINDIA_CLIENT_SECRET}`,
    null,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  mapMyIndiaToken = response.data.access_token;
  tokenExpiry = now + (response.data.expires_in || 3600) * 1000;
  return mapMyIndiaToken;
  console.log("MapMyIndia token obtained:", mapMyIndiaToken);
};

function normalizePlace(place) {
  const lat = Number(
    place.latitude ?? place.lat ?? place.geometry?.location?.lat,
  );
  const lng = Number(
    place.longitude ?? place.lng ?? place.geometry?.location?.lng,
  );

  return {
    name: place.placeName || place.place_name || place.name || "Unknown",
    address:
      place.fullAddress ||
      place.address ||
      place.vicinity ||
      place.formatted_address ||
      "Address not available",
    rating: place.rating || place.user_rating || null,
    reviews: [],
    photoUrl: null,
    types: place.poiType ? [place.poiType] : place.types || [],
    location: {
      lat: Number.isNaN(lat) ? null : lat,
      lng: Number.isNaN(lng) ? null : lng,
    },
  };
}

export const findNearbyPlaces = async (location, type, radius = 5000) => {
  try {
    const token = await getMapMyIndiaToken();
    const keyword = type === "doctor" ? "doctor" : "hospital";

    const response = await axios.get(NEARBY_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        keyword,
        refLocation: `${location.lat},${location.lng}`,
        radius,
        limit: 5,
      },
    });

    const places =
      response.data.suggestedLocations ||
      response.data.results ||
      response.data.places ||
      [];

    return places.map(normalizePlace).slice(0, 5);
  } catch (error) {
    console.error(
      "Error fetching nearby places from MapMyIndia:",
      error.message || error,
    );
    return [];
  }
};

export const findNearbyDoctors = (location) =>
  findNearbyPlaces(location, "doctor");
export const findNearbyHospitals = (location) =>
  findNearbyPlaces(location, "hospital");
