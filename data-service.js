const data_service_auth = require('./data-service-authenticate.js'); 

const Sequelize = require("sequelize"); //middleware sequelize
const { resolve } = require('path');
const { rejects } = require('assert');
const { type } = require('os');

//todo: set up sequelize to point to SEOR PostGres database
var sequelize = new Sequelize("d6ourhnklg14k2", "thiybbuhjtndkl", "bd308a362baa1061d3d213ab0ba4c50b654ea24515a84827058457f7357e5a87",
    {
        host: "ec2-52-22-216-69.compute-1.amazonaws.com",
        dialect: "postgres",
        port: 5432,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
    }
);
//todo: Define a 'User' model 
var User = sequelize.define('users', {
    userID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: true
    }
});
//todo: Define a 'Semester' model
// var Semester = sequelize.define('semesters', {
//     SemID: {
//         type: Sequelize.INTEGER,
//         primaryKey: true,
//         unique: true
//     },
//     Name: Sequelize.STRING,
//     Start: Sequelize.DATE,
//     Finish: Sequelize.DATE,
//     userID: Sequelize.INTEGER
// });

sequelize.authenticate() //connect to PostGre
    .then(() => console.log("connection PG success"))
    .catch((e) => {
        console.log("connection failed.");
        console.log(e);
    });





//todo: getAllUsers() return an array of all users (contains userID only) in SEOR PostGre
getAllUsers = function() {
    return new Promise((resolve, reject) => {
        User.findAll()
        .then((all_PG_Users)=> {
            resolve(all_PG_Users);
        })
        .catch(() => reject('no result returned!'));
    })
};
//todo:synchronize the Database with our models and automatically add the table if it does not exist
module.exports.initialize = function () 
{
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(() => {
            Populate_Server_Users();
            resolve(console.log("sync success"));
        }).catch(() => {
            reject("unable to sync the database");
        })
    });
}

//todo: Populate_Server_Users() determine the difference between Mongo User and PostGre User and then populate PostGre User table according to Mongo User
Populate_Server_Users = function() 
{
    return new Promise((resolve, reject) => {
        data_service_auth.User_Query_Return('array')
        .then((allMongoUsers) => {
            let differentUsers = [];
            
            getAllUsers()
            .then((all_PG_Users) => {
                allMongoUsers.forEach(Mongo_User => {
                    let flag = false;
                    all_PG_Users.forEach(PG_User => {
                        if(Mongo_User.userID != PG_User.userID)
                            flag = false;
                        else 
                            flag = true;
                    });
                    if(!flag)
                        differentUsers.push(Mongo_User.userID);
                });
            });
            console.log('\n diffUser: ' + differentUsers.length);

            //create rows using differenUsers array
            differentUsers.forEach(diff_userID => {
                console.log(diff_userID);
                User.create({userID: diff_userID})
                .then(() => console.log('create diff user!'))
                .catch(() => reject('unable to create user!'));
            });
            resolve();
        })
        .catch(() => reject('PSU, Failed PGSQL'));
    }); 
}

// //todo: 
// module.exports.addSemester = function() {

// }