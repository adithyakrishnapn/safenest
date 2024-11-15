const express = require('express');
const router = express.Router();
const helper = require('../helpers/userhelper');
const twilioClient = require('../Config/twilio');


const loggedin = (req,res,next)=>{
    if(req.session.loggedIn){
        next()
    } else {
        res.redirect('/login')
    }
}

const logcheck = (req,res,next)=>{
    if(req.session.loggedIn){
        redirect('/')
    } else{
        next();
    }
}

router.get('/',(req,res)=>{
    let user = req.session.loggedIn;
    res.render('index',{user});
})
router.get('/login', logcheck,(req,res)=>{
    res.render('login');
})
router.get('/signup', logcheck,(req,res)=>{
    res.render('signup');
})


router.post('/signup', (req, res) => {
    console.log(req.body);
    helper.DoSignup(req.body)
        .then((response) => {
            console.log("Registered as", req.body.username);
            req.session.loggedIn = true;
            req.session.user = response.user;
            req.session.mail = response.user.email; // Assuming email is provided in req.body
            console.log(response.user.email);
            res.redirect('/');
        })
        .catch((err) => {
            console.log("Error Registering:", err);
            // Send the error message to be displayed on the signup page
            res.render('signup', { errorMessage: err });
        });
});




router.post('/login', (req, res) => {
    helper.DoLogIn(req.body).then((response) => {
        if (response.status) {
            console.log("Logged in as", response.user.username); 
            req.session.loggedIn = true;
            req.session.user = response.user;
            req.session.mail = response.user.email;
            console.log(response.user.email);
            console.log(req.session.user.username);
            res.redirect('/');
        } else {
            // Send the error message back to the view
            console.log("Login failed");
            res.render('login', { errorMessage: "Incorrect email or password" });
        }   
    }).catch(err => {
        console.log("Error found", err);
        res.render('login', { errorMessage: "An error occurred during login" }); // Render the login page with an error message
    });
});



// Add an endpoint to handle the SOS request
router.post('/sos', async (req, res) => {
    const { message } = req.body;

    try {
        // Replace 'to' with the phone number you want to send to, and 'from' with your Twilio number
        const response = await twilioClient.messages.create({
            body: message || "SOS! I need help immediately!",
            from: '+18177686682', // Your Twilio number
            to: '+91 75609 89659' // The emergency contact's number
        });

        res.status(200).json({ success: true, message: 'SOS message sent successfully!' });
    } catch (error) {
        console.error('Error sending SOS message:', error);
        res.status(500).json({ success: false, message: 'Failed to send SOS message.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.loggedIn =false;
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error logging out. Please try again.");
        }
        // Redirecting to the login page or home page after logout
        res.redirect('/login');
    });
});

  

module.exports = router;