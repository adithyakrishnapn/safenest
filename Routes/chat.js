// routes/chat.js
const express = require('express');
const router = express.Router();
const axios = require('axios');


const loggedin = (req,res,next)=>{
    if(req.session.loggedIn){
        next()
    } else {
        res.redirect('/login')
    }
}




// Route to display the chat interface
router.get('/',loggedin, (req, res) => {
    res.render('chat');  // Render the chat interface in Handlebars (chat.hbs)
});

// Route to handle chat messages
router.post('/message', async (req, res) => {
    const userMessage = req.body.message;
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        const payload = {
            contents: [
                {
                    parts: [
                        {
                            text: userMessage
                        }
                    ]
                }
            ]
        };

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Get the bot's reply from the API response
        const candidate = response.data.candidates[0];
        let botReply = candidate && candidate.content && candidate.content.parts[0]
            ? candidate.content.parts[0].text
            : "I'm here to listen.";

        // Format the bot reply for better readability
        botReply = botReply
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Convert **text** to <strong>text</strong> for bold text
            .replace(/\n/g, '<br>')  // Preserve newlines as <br> for structure

        res.json({ reply: botReply });

    } catch (err) {
        console.error("Error during AI integration:", err.response ? err.response.data : err.message);
        res.status(500).json({ reply: "I'm sorry, something went wrong. Please try again later." });
    }
});

module.exports = router;
