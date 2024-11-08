const { response } = require('express');
const db = require('../Config/connection');
const bcrypt = require('bcrypt');
const { ObjectId } = require("mongodb");


module.exports = {
    DoSignup: (data) => {
        return new Promise(async (resolve, reject) => {
            // Check if email already exists in the database
            let existingUser = await db
                .get()
                .collection('users')
                .findOne({ email: data.email });
    
            if (existingUser) {
                // If email exists, reject the promise with a specific error message
                reject("Email already exists");
                return;
            }
    
            // If email doesn't exist, proceed with the registration
            data.password = await bcrypt.hash(data.password, 10);
            db.get()
                .collection('users')
                .insertOne(data)
                .then((response) => {
                    console.log("Registered successfully");
                    resolve(response);
                })
                .catch((err) => {
                    console.log("Error registering user");
                    reject(err);
                });
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
      
      
}