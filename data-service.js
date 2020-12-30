const data_service_auth = require('./data-service-authenticate.js');

const Sequelize = require("sequelize");
const { resolve } = require('path');
const { rejects } = require('assert');
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

const User = sequelize.define('users', {
    userID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: true
    }
});

var All_PG_Users = new Array;

sequelize.authenticate()
    .then(() => console.log("connection PG success"))
    .catch((e) => {
        console.log("connection failed.");
        console.log(e);
    });

getAllUsers = function() {
    return new Promise((resolve, reject) => {
        User.findAll()
        .then((allPG_Users)=> {
            resolve(allPG_Users);
        })
        .catch(() => reject('no result returned!'));
    })
};
module.exports.Populate_Server_Users = function() 
{
    return new Promise((resolve, reject) => {
        data_service_auth.User_Query_Return('array')
        .then((allUsers) => {
            console.log('allUsers: ' + allUsers);
            getAllUsers()
            .then((all_PG_Users) => {
                console.log('not yet');
                console.log("all_pg: " + all_PG_Users);
                All_PG_Users = all_PG_Users.slice(); 
                
            })
            .catch((error) => console.log(error));

            let differentUsers = [];
            allUsers.forEach(Mongo_User => {
                if(All_PG_Users.indexOf(Mongo_User.userID) < 0)
                    differentUsers.push(Mongo_User.userID);
                });
            console.log('DU: ' + differentUsers);
            resolve();
        })
        .catch(() => reject('PSU, Failed PGSQL'));
    }); 
}