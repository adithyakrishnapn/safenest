// twilio.js
const twilio = require('twilio');

// Use your Twilio credentials (replace with your actual credentials)
const accountSid = 'ACcacabb9bac24566ee31808baee62c90d'; // Your Account SID from www.twilio.com/console
const authToken = '2f386d394a2feb00119416680a365cde';   // Your Auth Token from www.twilio.com/console

// Initialize Twilio client
const client = twilio(accountSid, authToken);

module.exports = client;
