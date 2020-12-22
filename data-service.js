const data_service_auth = require('./data-service-authenticate.js');

const Sequelize = require("sequelize");
var sequelize = new Sequelize()

module.exports.Populate_Server_Users = function() 
{
    data_service_auth.User_Query_Return('array')
    .then((allUsers) => {

    })
}