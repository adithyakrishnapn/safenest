require('dotenv').config();  // Load environment variables from .env file

const express = require('express');
const path = require('path');
const axios = require('axios');  // Import axios for making API calls
const app = express();
const indexRoutes = require('./Routes/index');
const dashboardRoutes = require('./Routes/dashboard');
const surveyRoutes = require('./Routes/survey');  // Import the new survey route
const chatRoutes = require('./Routes/chat')
const db = require('./Config/connection');
const session = require('express-session');
const fileUpload = require("express-fileupload");
const cors = require('cors');

// Use the CORS middleware to handle cross-origin requests
app.use(cors());

// Set up middleware to handle JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up file upload middleware
app.use(fileUpload());

// Set the view engine to hbs (Handlebars)
app.set('view engine', 'hbs');

// Set the views directory to the 'views' folder
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'Public' directory
app.use(express.static(path.join(__dirname, 'Public')));

// Database connection
db.connect((err) => {
    if (err) {
        console.log("Error found: " + err);
    } else {
        console.log("Connected to database");
    }
});

// Set up session middleware with security options
app.use(session({
    secret: process.env.SESSION_SECRET || 'this12session#', // Use an environment variable for session secret
    resave: false, 
    saveUninitialized: true, 
    cookie: { 
        maxAge: 600000, 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' 
    }
}));

// Define route handlers
app.use('/', indexRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/survey', surveyRoutes); // Add the survey route here
app.use('/chat', chatRoutes); 

// Error handling middleware
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Generic error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', { error: err });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
