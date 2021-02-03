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
var Semester = sequelize.define('semesters', {
    SemID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: true
    },
    Name: Sequelize.STRING,
    Start: Sequelize.DATEONLY,
    Finish: Sequelize.DATEONLY,
    userID: Sequelize.INTEGER
});

sequelize.authenticate() //connect to PostGre
    .then(() => console.log("connection PG success"))
    .catch((e) => {
        console.log("connection failed.");
    });

//todo: all global variables in this module
var current_userID;


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
        }).catch((error) => {
            reject("\n" + error);
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
            //console.log('\n diffUser: ' + differentUsers.length);

            //create rows using differenUsers array
            differentUsers.forEach(diff_userID => {
                //console.log(diff_userID);
                User.create({userID: diff_userID})
                .then(() => console.log('create diff user!'))
                .catch(() => reject('unable to create user!'));
            });
            resolve();
        })
        .catch(() => reject('PSU, Failed PGSQL'));
    }); 
}

//todo: get current userID from cookies
module.exports.getCurrentUserID = function(cookies_user_id) {
    console.log(cookies_user_id);
    current_userID = cookies_user_id; //assign global variable current_userID to userID saved by cookies
}


//todo: add a Semester
module.exports.addSemester = function(semesterData) {
    return new Promise((resolve, reject) => {
        let lastSemID = 0;
    
        Semester.findAll()
        .then((allSemester) => {
            if(allSemester.length == 0)
                console.log('\nSemester is empty\n');
            else 
                lastSemID = allSemester[allSemester.length - 1].SemID; //assign semID
            
            semesterData.SemID = (lastSemID + 1); //assign semID
            console.log('current: ' + current_userID);
            semesterData.userID = current_userID;
            Semester.create(semesterData) 
            .then(() => {
                console.log('\n new sem created \n');
                resolve(); 
            })
            .catch((err) => {
                console.log('\n can\'t create new sem');
                reject(err); 
            });
        })
        .catch((error) => {
            console.log(error);
        }) 
    });
}
//todo: resolve an array of all Semester records 
module.exports.getAllSemesters = function() {
    return new Promise((resolve, reject) => {
        console.log(current_userID);
        Semester.findAll(
            {where: {userID: current_userID}}
        )
        .then((allSemester) => {
            resolve(allSemester);
        })
    })
}
//todo: Define a 'Course' model
var Course = sequelize.define('courses', {
    CourseID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        unique: true
    }, //calculate
    CourseName: Sequelize.STRING,
    CourseCode: Sequelize.STRING, 
    Desc: Sequelize.STRING,
    Prof: Sequelize.STRING,
    SemID: Sequelize.INTEGER //calculate
});
//todo: 
module.exports.getCoursesBySemID = function(SemID_para) {
    return new Promise((resolve, reject) => {
        Course.findAll({where: {SemID: SemID_para}})
        .then((Courses) => {
            resolve(Courses);
        })
        .catch((error) => {
            reject(error)
        })
    });
}
getAllCourses = function() {
    return new Promise((resolve, reject) => {
        Course.findAll()
        .then((allCourses) => {
            console.log("\nCourses length: " + allCourses.length);
            resolve(allCourses);
        })
        .catch((error) => {
            reject(error);
        })
    })
}
module.exports.addCourse = function(CourseData, SemID_para) {
    return new Promise((resolve,reject) => {
        let lastCourseID = 0;
        getAllCourses()
        .then((allCourses) => {
            if(allCourses.length > 0)
                lastCourseID = allCourses[allCourses.length - 1]["CourseID"];
            CourseData["CourseID"] = lastCourseID + 1;
            CourseData["SemID"] = SemID_para;
            Course.create(CourseData)
            .then(() => {
                console.log("\nA new Course is created!\n");
                resolve();
            }).catch(() => {
                console.log("\n can't create new course\n");
                reject();
            })
        })
        .catch((error) => {
            console.log("\nError from getAllCourses: " + error);
        });
    })
}

//todo: define Assignment 
var Assignment = sequelize.define('assignments', {
    AssignmentID: {
        primaryKey: true,
        type: Sequelize.INTEGER, 
        unique: true
    },
    AssignmentName: Sequelize.STRING,
    DueDate: Sequelize.DATEONLY,
    DueTime: Sequelize.TIME,
    CourseID: Sequelize.INTEGER
});

getAllAssignments = function() {
    return new Promise((resolve, reject) => {
        Assignment.findAll()
        .then((allAssignments) => {
            console.log("\nCourses length: " + allAssignments.length);
            resolve(allAssignments);
        })
        .catch((error) => {
            reject(error);
        })
    })
}

module.exports.getAssignmentByCourseID = function(CourseID_param) {
    return new Promise((resolve, reject) => {
        Assignment.findAll({where: {CourseID: CourseID_param}})
        .then((Assignments) => {
            console.log(Assignments);
            resolve(Assignments);
        })
        .catch((error) => {
            reject(error)
        })
    });
}

module.exports.addAssignment = function(AssignmentData, CourseID_param) {
    return new Promise((resolve,reject) => {

        getAllAssignments()
        .then((allAssignments) => {
            if(allAssignments.length > 0)
                AssignmentData["AssignmentID"] = allAssignments[allAssignments.length - 1]["AssignmentID"] + 1;
            else 
                AssignmentData["AssignmentID"] = 1;
            AssignmentData["CourseID"] = CourseID_param;
            Assignment.create(AssignmentData)
            .then(() => {
                console.log("\nA new Assignment is created!\n");
                resolve();
            }).catch((error) => {
                console.log("\n can't create new Ass\n");
                console.log(error);
                reject();
            })
        })
        .catch((error) => {
            console.log("\nError from getAllAssignments: " + error);
        });
    })
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }