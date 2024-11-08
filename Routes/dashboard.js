const express = require('express');
const router = express.Router();
const helper = require('../helpers/userhelper');



router.get("/help",(req,res)=>{
  res.render('help');
})
router.get("/about",(req,res)=>{
  res.render('aboutus');
})

router.get("/community",async(req,res)=>{
  try {
    let articles = await helper.FetchArticles();
    console.log(articles); // This will log all articles fetched from the database
    res.render('community-forum', { articles });
} catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).send("Error fetching articles");
}
})

router.get("/communityPost",(req,res)=>{
  res.render('community');
})

router.get("/contact",(req,res)=>{
  res.render('contact');
})


router.post("/community", (req, res) => {
    console.log(req.body);
    // Extract text and image file from the request
    const details = {
      username: req.session.user.username,
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
        
        res.redirect("/");
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

router.get('/view:id',async(req,res)=>{
  try{
    let id =req.params.id;
    let view = await helper.FetchArticlesById(id);
    console.log(view);
    res.render('view',{view});
  } catch(err){
    console.log(err)
  }
})



module.exports = router;
