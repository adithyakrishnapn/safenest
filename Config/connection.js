const mongoose = require('mongoose');



const connect = ()=>{
    const url = 'mongodb://localhost:27017';
    const dbname = 'safeness';

    return mongoose.connect(url + '/' + dbname)
    .then(()=>{
        console.log("Connected to database");
    })
    .catch(err => {
        console.error('Failed to connect', err);
        throw err;
    });
};

module.exports.connect = connect;

module.exports.get = function () {
    return mongoose.connection;
};