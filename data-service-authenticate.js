const mongoose = require("mongoose"); //require middleware mongoose 

const bcrypt = require("bcryptjs"); //require bcryptjs to encrypt password
const { resolve } = require("path");
const { rejects } = require("assert");
const e = require("express");

var Schema = mongoose.Schema; //setting Schema; 
mongoose.set('useCreateIndex', true);
var userSchema = new Schema({ //declaring User Schema
    'userID': {
        type: Number,
        unique: true
    },
    'userName': {
        type: String,
        unique: true
    },
    'password': String,
    'email': String,
    'loginHistory': [{
        'date-n-time': Date,
        'userAgent': String //User-Agent request header is a characteristic string that identify the application, OS of the requesting user agent(a person)
    }]
});

let User; //register the User model using userSchema schema, define globally
let db; //to later make reference to the database middleware
var document_num = new Number; //to assign userID 
var uri = 'mongodb+srv://Tue:tuechinhlatue1@seor.lbc4a.mongodb.net/SEOR?retryWrites=true&w=majority';

//todo: return 0 if User is empty, userID of the last user, query can be 'array' => return an array of user, 'userID' => return last user's ID
//! this User_Query_Return can't be used locally because it is exported 
module.exports.User_Query_Return = function(query) { //!'array' 'userID'
    return new Promise((resolve, reject) => {
        User.find()
        .exec()
        .then((allUser) => {
            if(allUser.length > 0 && query == 'userID')
                resolve(allUser[allUser.length - 1].userID);
            else if(query == 'userID')
                resolve(allUser.length);
            else if(query == 'array')
                resolve(allUser);
            else 
                reject("No query was given!");
        });
    });
};

//!this function can be used locally within this module
User_Query_Return = function(query) { //!'array' 'userID'
    return new Promise((resolve, reject) => {
        User.find()
        .exec()
        .then((allUser) => {
            console.log("allUser func: " + allUser.length);
            if(allUser.length > 0 && query == 'userID')
                resolve(allUser[allUser.length - 1].userID);
            else if(query == 'userID')
                resolve(allUser.length);
            else if(query == 'array')
                resolve(allUser);
            else 
                reject("No query was given!");
        });
    });
};

 //todo:connect, success => create tables
module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        db = mongoose.createConnection(uri, {useNewUrlParser: true, useUnifiedTopology: true}, function(error) {
            if(error)   
                reject(error);
            else {
                console.log("Connect to mongoDB succeeds");
                User = db.model("users", userSchema); //register User model using userSchema, use users collection to store

                User_Query_Return('userID')
                .then((count) => { //assign resolve data to global var document_num
                    document_num = count; 
                }).catch((error) => console.log(error));

                resolve();
            }     
        });
    });
};

//todo:register user
module.exports.registerUser = function(form_UserData) {
    return new Promise((resolve, reject) => {
        userName_temp = form_UserData.userName;
        password_temp = form_UserData.password;
        password2_temp = form_UserData.password2;
        if(!userName_temp || !password_temp || !password2_temp)
            reject("Error: username or password can't be empty");
        else if(password_temp != password2_temp)
            reject("Passwords do not match!");
        else 
        {
            bcrypt.genSalt(10, (error, salt) => {
                if(error)
                    console.log(error);
                else {
                    bcrypt.hash(password_temp, salt, (error, hashValue) => {
                        if(error)
                            reject("There was an error hashing the password: " + error);
                        else {
                            form_UserData.password = hashValue;
                            form_UserData.userID = (document_num + 1); //increment userID 
                            let newUser = new User(form_UserData);
                            newUser.save((error) => {
                                if(error && error.code == 11000)
                                    reject("User Name is already taken");
                                else if(error) {
                                    console.log(error);
                                    reject("There was an error creating new user: " + error);
                                }
                                else 
                                    resolve();
                            });
                        }
                    });
                }
            });
        }
    });
};

//todo: check if User exists and resolve the User found
module.exports.checkUser = function(userData) {
    return new Promise ((resolve, reject) => {
        User.findOne({'userName': userData.userName}).exec()
        .then((theUser) => {
            bcrypt.compare(userData.password, theUser.password) //use compare() to compare password to hashed password => return a promise
            .then((result) => { //return the password, no catch
                if(result) {
                    theUser.loginHistory.push({
                        'date-n-time': (new Date()).toString(),
                        'userAgent': userData.userAgent
                    });
                    User.updateOne(
                        {'userName': theUser.userName},
                        {$set: {'loginHistory': theUser.loginHistory}}
                    ).exec()
                    .then(() => resolve(theUser))
                    .catch((error) => reject('There was an error updating/verifying this user: ' + error));
                }
                else 
                    reject('Unable to find user password: ' + userData.userName);
            })
        }).catch(() => reject('Unable to find user: ' + userData.userName));
    });
}

