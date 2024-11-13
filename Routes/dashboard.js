const express = require('express');
const router = express.Router();
const helper = require('../helpers/userhelper');
const axios = require('axios');
const youtubeApiKey = 'AIzaSyBgc4MjhcdoMuHyBJjagdfGKf-DL9TLUBY'; // Replace with your YouTube API key


const loggedin = (req,res,next)=>{
  if(req.session.loggedIn){
      next()
  } else {
      res.redirect('/login')
  }
}


router.get("/help", (req,res)=>{
  res.render('help');
})
router.get("/about", (req,res)=>{
  res.render('aboutus');
})

router.get("/community", loggedin, async(req,res)=>{
  try {
    let user = req.session.loggedIn;
    let articles = await helper.FetchArticles();
    console.log(articles); // This will log all articles fetched from the database
    res.render('community-forum', { articles, user});
} catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).send("Error fetching articles");
}
})

router.get("/communityPost", loggedin, (req,res)=>{
  let user = req.session.loggedIn;
  res.render('community',{user});
})

router.get("/contact",(req,res)=>{
  let user = req.session.loggedIn;
  res.render('contact',{user});
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
        // Fetch articles from the database
        let articles = await helper.FetchArticles();
        console.log(articles); // Log fetched articles

        // Define a search query for YouTube videos related to women’s empowerment, self-defense, etc.
        const searchQuery = "self-defense for women";
        
        // Fetch YouTube videos related to the search query
        const youtubeResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                q: searchQuery,
                type: 'video',
                key: youtubeApiKey,
                maxResults: 3
            }
        });

        // Format the YouTube video data for easier use in the template
        const videoResults = youtubeResponse.data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        // Render the `er` page with both articles and YouTube video recommendations
        res.render('er', { articles, videoResults });
    } catch (err) {
        console.error("Error fetching articles or YouTube videos:", err.response ? err.response.data : err.message);
        res.status(500).send("Error fetching resources.");
    }
});

module.exports = router;


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
