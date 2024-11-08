const express = require('express');
const router = express.Router();
const helper = require('../helpers/userhelper');


router.get('/',(req,res)=>{
    res.render('index');
})


router.post('/', (req, res) => {
    console.log(req.body);
    helper.DoSignup(req.body)
        .then((response) => {
            console.log("Registered as", req.body.username);
            req.session.loggedIn = true;
            req.session.user = response.user;
            req.session.mail = response.user.email; // Assuming response.user.mail contains the user's email
            console.log(response.user.email);
            res.redirect('/dashboard');
        })
        .catch((err) => {
            console.log("Error Registering:", err);
            // Send the error message to be displayed on the signup page
            res.render('index', { errorMessage: err });
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
            res.redirect('/dashboard');
        } else {
            // Send the error message back to the view
            console.log("Login failed");
            res.render('index', { errorMessage: "Incorrect email or password" });
        }   
    }).catch(err => {
        console.log("Error found", err);
        res.render('index', { errorMessage: "An error occurred during login" }); // Render the login page with an error message
    });
});

  

module.exports = router;