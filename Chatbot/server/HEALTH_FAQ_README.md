# Health FAQ Fallback System - Documentation

## Overview
This system provides a predefined database of health questions and answers that serves as a fallback when the Gemini API is unavailable or fails to provide a response.

## Files Created/Modified

### 1. **Model: [models/HealthFAQ.js](models/HealthFAQ.js)**
Defines the MongoDB schema for storing health FAQs with:
- `question` - The health question
- `answer` - The answer/solution
- `keywords` - Search keywords for matching
- `category` - FAQ category (general, symptoms, prevention, nutrition, exercise, mental_health)

### 2. **Seeding Script: [seedHealthFAQ.js](seedHealthFAQ.js)**
Populates the database with predefined health FAQs. 

**Run once to seed data:**
```bash
node seedHealthFAQ.js
```

Includes 8 initial FAQs covering common health topics. Add more FAQs by editing the `faqs` array in this file.

### 3. **Controller Update: [controllers/messageController.js](controllers/messageController.js)**
Updated `textMessageController` to:
- Try calling Gemini API first
- If API fails, call `findFallbackAnswer()` to search the HealthFAQ database
- Return FAQ answer if found, otherwise return generic message

**New Helper Function:** `findFallbackAnswer(userPrompt)`
- Performs exact question matching
- Falls back to partial keyword matching
- Returns the best matching answer or null

### 4. **Routes: [routes/healthFAQRoutes.js](routes/healthFAQRoutes.js)**
Two endpoints:
- `GET /api/health-faq/` - Get all FAQs (limit 100)
- `GET /api/health-faq/search?query=<search_term>` - Search FAQs

### 5. **Server Update: [server.js](server.js)**
- Added healthFAQRouter import
- Registered new routes at `/api/health-faq`

## How It Works

### Fallback Flow
```
User Question
    ↓
Try Gemini API
    ↓
Success? → Return AI Response
    ↓ No
Try Finding FAQ
    ↓
FAQ Found? → Return FAQ Answer
    ↓ No
Return Generic Message
```

### FAQ Matching Logic
1. **Exact Match**: Tries to match the exact question (case-insensitive)
2. **Keyword Match**: Searches by keywords extracted from the question
3. **Partial Match**: Searches for similar questions in the database

## Adding More FAQs

Edit [seedHealthFAQ.js](seedHealthFAQ.js) and add objects to the `faqs` array:

```javascript
{
  question: "Your health question here?",
  answer: "Detailed answer here...",
  keywords: ["keyword1", "keyword2", "keyword3"],
  category: "general" // or: symptoms, prevention, nutrition, exercise, mental_health
}
```

Then run the seed script again:
```bash
node seedHealthFAQ.js
```

## Testing

### Test Fallback Functionality
When testing the chat API, you can:
1. Disable your internet or Gemini API key to trigger fallback
2. Ask a question that matches an FAQ
3. Verify the FAQ answer is returned

### Test FAQ Endpoints
```bash
# Get all FAQs
curl http://localhost:3000/api/health-faq/

# Search FAQs
curl "http://localhost:3000/api/health-faq/search?query=fever"
```

## Environment Setup
No additional environment variables needed. Uses existing `MONGODB_URI`.

## Benefits
✅ Reliable fallback when AI API fails  
✅ Fast response from local database  
✅ Reduced API calls for common questions  
✅ Offline functionality support  
✅ Easy to extend with more FAQs  

## Future Enhancements
- Admin panel to manage FAQs
- User feedback on FAQ quality
- AI-powered FAQ quality scoring
- Multi-language support
- Analytics on FAQ usage
