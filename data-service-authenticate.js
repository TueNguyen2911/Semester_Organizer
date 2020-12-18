const mongoose = require("mongoose"); //require middleware mongoose 

const bcrypt = require("bcryptjs"); //require bcryptjs to encrypt password

var Schema = mongoose.Schema; //setting Schema; 
var userSchema = new Schema({ //declaring User Schema
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
y
let User; //register the User model using userSchema schema, define globall
let db; //to later reference the middleware
var uri = 'mongodb+srv://Tue:tuechinhlatue1@seor.lbc4a.mongodb.net/SEOR?retryWrites=true&w=majority';

module.exports.initialize = function() { //connect, success => create tables
    return new Promise()
}