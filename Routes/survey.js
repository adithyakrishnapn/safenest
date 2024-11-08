const express = require('express');
const router = express.Router();
const axios = require('axios');

// Route to display the survey form
router.get('/', (req, res) => {
    res.render('survey');  // Render the survey form in Handlebars (survey.hbs)
});

// Route to handle survey form submission
router.post('/submit', async (req, res) => {
    const surveyData = req.body;  // Get the data sent from the form
    console.log("Received survey data:", surveyData);  // Log the received data

    try {
        const geminiApiKey = process.env.GEMINI_API_KEY;  // Gemini API key stored in environment variables
        const youtubeApiKey = process.env.YOUTUBE_API_KEY;  // YouTube API key

        // Log the API keys for debugging (ensure they're not logged in production)
        console.log("Using Gemini API Key:", geminiApiKey);
        console.log("Using YouTube API Key:", youtubeApiKey);

        // Prepare the data for Gemini API request
        const payload = {
            contents: [
                {
                    parts: [
                        {
                            text: surveyData.answers.join(', ')  // Combine answers into one string
                        }
                    ]
                }
            ]
        };

        // Send request to Gemini API
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Gemini API Response:", geminiResponse.data);  // Log the full response for debugging

        // Check if there are candidates and if content exists
        const candidate = geminiResponse.data.candidates[0];  // Get the first candidate
        let message = candidate?.content?.parts[0]?.text || 'No message returned';

        // Analyze the sentiment of the response (positive or neutral)
        let strengthScore = 0;
        if (message.includes('positive') || message.includes('brave') || message.includes('great') || message.includes('doing well')) {
            strengthScore = 80;  // High score for positive, encouraging feedback
        } else if (message.includes('struggling') || message.includes('difficult') || message.includes('help')) {
            strengthScore = 50;  // Neutral to slightly negative feedback, encouraging action
        } else if (message.length > 100) {
            strengthScore = 60;  // Longer responses could indicate more personalized attention
        }

        // Set search query based on the feedback message
        let searchQuery = 'self improvement';
        if (message.includes('motivation')) searchQuery = 'motivational videos';
        if (message.includes('focus')) searchQuery = 'focus improvement';
        if (message.includes('confidence')) searchQuery = 'boost confidence';

        // Fetch YouTube videos based on the search query
        const youtubeResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: searchQuery,
                type: 'video',
                key: youtubeApiKey,
                maxResults: 3
            }
        });

        const videoResults = youtubeResponse.data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        // Render the survey results page with the score, message, and video recommendations
        res.render('surveyResult', { score: strengthScore, message, videoResults });

    } catch (err) {
        console.error("Error during AI or YouTube API integration:", err.response ? err.response.data : err.message);
        res.status(500).send("Error processing the survey.");
    }
});

module.exports = router;
