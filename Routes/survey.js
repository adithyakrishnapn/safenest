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
        const apiKey = process.env.GEMINI_API_KEY;  // API key stored in environment variables

        // Log the API key for debugging (ensure it's not logged in production)
        console.log("Using API Key:", apiKey);

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
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("API Response:", response.data);  // Log the full response for debugging

        // Check if there are candidates and if content exists
        const candidate = response.data.candidates[0];  // Get the first candidate

        if (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0]) {
            const message = candidate.content.parts[0].text || 'No message returned';  // Extract the feedback message from text
            
            // Analyze the sentiment of the response (positive or neutral)
            let strengthScore = 0;
            if (message.includes('positive') || message.includes('brave') || message.includes('great') || message.includes('doing well')) {
                strengthScore = 80;  // High score for positive, encouraging feedback
            } else if (message.includes('struggling') || message.includes('difficult') || message.includes('help')) {
                strengthScore = 50;  // Neutral to slightly negative feedback, encouraging action
            } else if (message.length > 100) {
                strengthScore = 60;  // Longer responses could indicate more personalized attention
            }

            res.render('surveyResult', { score: strengthScore, message: message });  // Render result with the calculated score
        } else {
            res.render('surveyResult', { score: 'No score returned', message: 'No message returned' });
        }

    } catch (err) {
        console.error("Error during AI integration:", err.response ? err.response.data : err.message);
        res.status(500).send("Error processing the survey.");
    }
});

module.exports = router;
