# Feedback Feature - Implementation Steps

- [x] Analyze codebase and create plan
- [x] Update `Chatbot/server/models/chat.js` — add MessageSchema with `_id`, `feedback`, `isImage`, `isPublished`
- [x] Update `Chatbot/server/controllers/messageController.js` — save chat before sending reply so `_id` is included
- [x] Create `Chatbot/server/controllers/feedbackController.js`
- [x] Create `Chatbot/server/routes/feedbackRoutes.js`
- [x] Update `Chatbot/server/server.js` — register `/api/feedback` route
- [x] Update `Chatbot/client/src/components/Message.jsx` — add thumbs up/down buttons + API call
- [ ] Test and verify integration

