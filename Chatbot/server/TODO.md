# Implementation TODO

## Backend
- [x] Update `models/chat.js` - add locationType and locationData to message schema
- [x] Create `controllers/locationController.js` - handle nearby doctors/hospitals fetching
- [x] Create `routes/locationRoutes.js` - define POST /doctors and POST /hospitals
- [x] Update `server.js` - register location routes

## Frontend
- [x] Create `components/LocationCards.jsx` - display doctor/hospital cards
- [x] Update `components/Message.jsx` - show action buttons & location cards
- [x] Update `components/Chatbox.jsx` - handle geolocation + API calls, remove old MapPin

## Testing
- [x] Ask a health question → verify buttons appear
- [x] Click "Nearby Hospital" → verify location prompt → verify cards
- [x] Click "Nearby Doctor" → verify location prompt → verify cards
