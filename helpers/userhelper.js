const { response } = require('express');
const db = require('../Config/connection');
const bcrypt = require('bcrypt');
const { ObjectId } = require("mongodb");


module.exports = {
  DoSignup: (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if the email already exists in the database
            let existingUser = await db
                .get()
                .collection('users')
                .findOne({ email: data.email });

            if (existingUser) {
                // If email exists, reject the promise with a specific error message
                return reject("Email already exists");
            }

            // If email doesn't exist, proceed with the registration
            data.password = await bcrypt.hash(data.password, 10);
            const result = await db.get().collection('users').insertOne(data);

            console.log("Registered successfully");

            // Return the new user's data to resolve the promise
            resolve({ user: data, insertedId: result.insertedId });
        } catch (err) {
            console.log("Error registering user:", err);
            reject("Error registering user");
        }
    });
  },

    DoLogIn: (userData) => {
        return new Promise(async (resolve, reject) => {
          let response = {};
          let user = await db
            .get()
            .collection("users")
            .findOne({ mail: userData.mail });
      
          console.log("User found:", user);  // Log the user data retrieved
      
          if (user) {
            bcrypt.compare(userData.password, user.password).then((status) => {
              console.log("Password match status:", status);  // Log the comparison result
              if (status) {
                response.user = user;
                response.status = true;
                console.log("Login success");
                resolve(response);
              } else {
                console.log("Login failed due to incorrect password");
                resolve({ status: false });
              }
            }).catch(err => {
              console.log("Error in password comparison:", err);
              reject(err);  // Reject if any error in comparing passwords
            });
          } else {
            console.log("User not found");
            resolve({ status: false });
          }
        });
      },

      PostArticle: (data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('articles').insertOne(data).then((response)=>{
                const insertedId = new ObjectId(response.insertedId);
                console.log(insertedId);
                resolve(insertedId);
            })
        })
        .catch((error)=>{
            console.error("Error inserting data");
            reject(error);
        })
      },

      FetchArticles: () => {
        return new Promise(async (resolve, reject) => {
          let product = await db
            .get()
            .collection('articles')
            .find()
            .toArray()
            .then((response) => {
              resolve(response);
            })
            .catch((err) => {
              reject(err);
            });
        });
      },

      FetchArticlesById : (id) =>{
        return new Promise((resolve,reject)=>{

          objectId = new ObjectId(id);

          db.get().collection('articles').findOne({_id : objectId}).then((response)=>{
            resolve(response);
          })
        }).catch(err=>{
          console.error(err);
          reject(err);
        })
      }
      
      
}