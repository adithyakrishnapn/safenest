const express = require('express');
const router = express.Router();
const helper = require('../helpers/userhelper');



router.get('/',(req,res)=>{
    res.render('dashboard');
})

router.get("/community",(req,res)=>{
    res.render('communityForum');
})


router.post("/community", (req, res) => {
    console.log(req.body);
    // Extract text and image file from the request
    const details = {
      email: req.session.mail,
      title: req.body.Title,
      content: req.body.communityText, // Ensure 'communityText' matches the input name in your form
    };
  
    // Save the article details to the database
    helper.PostArticle(details)
      .then((id) => {
        console.log("Inserted Article ID:", id);
  
        // Check if an image file is included
        if (req.files && req.files.Image) {
          let image = req.files.Image;
  
          // Move the uploaded file to the desired directory
          image.mv(`./Public/Article-Images/${id}.jpg`, (err) => {
            if (!err) {
              console.log("Image successfully moved.");
            } else {
              console.log("Error moving image:", err);
            }
          });
        } else {
          console.log("No image found.");
        }
        
        res.redirect("/dashboard");
      })
      .catch((error) => {
        console.log("Error posting article:", error);
        res.status(500).send("Error posting article");
      });
});
  

router.get('/resources', async (req, res) => {
    try {
        let articles = await helper.FetchArticles();
        console.log(articles); // This will log all articles fetched from the database
        res.render('er', { articles });
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).send("Error fetching articles");
    }
});



module.exports = router;
