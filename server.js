var HTTP_PORT = process.env.PORT || 8080;   
function onHTTPStart() { 
    console.log("Express http server listening on " + HTTP_PORT);
}

const express = require("express"); //require and use express()
const app = express();

const bodyParser = require("body-parser"); //require bodyParser to parese request.body 
app.use(bodyParser.urlencoded({extended:true}));

const path = require("path");

const exphbs = require("express-handlebars");   //require express-handlebars
app.engine('.hbs', exphbs({ //create handlebar engine to handle HTML files 
    extname: '.hbs',
    defaultLayout: 'main',
    runtimeOptions: {   //to fix not property of bug
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }, //helper functions 
    helpers: {
        navLink: function(url, options){     
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
            '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>'; },

        equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
         return options.inverse(this);
        } else {
        return options.fn(this);
        }
    }
}   
}));
app.set("view engine", ".hbs"); //tell app to handle files with '.hbs' extension will use 'engine'

app.use(function(req,res,next){ //to recognize 404
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });

app.use(express.static(path.join(__dirname, 'views'))); //make /views static to use hbs 
app.use(express.static(path.join(__dirname, 'public'))); //make /views static to use hbs 

const data_service_auth = require('./data-service-authenticate.js');
const data_service = require('./data-service.js');

const clientSessions = require("client-sessions");
app.use(clientSessions({
    cookieName:"userSession", // this is the object name that will be added to "req"
    secret: "SEORsecretisconfidential", //this should be a long-unguessable string.
    duration: 2 * 60 * 10000, //duration of the session in milliseconds (2 mins)
    activeDuration: 10000 * 60 //the session will be extended by this many milliseconds each request (10 min)
}));
app.use(function(req, res, next) {
    res.locals.userSession = req.userSession;
    next();
});
//todo: ensure user has logged in
function ensureLogin(req, res, next)
{
    if (!req.userSession.user) {
        res.redirect("/login");
    } else { next();}
}
//todo: server routes 
//home route
app.get('/', (req,res) => {
    res.render('home');
})

//register routes
app.get('/register', (req, res) => {
    res.render('register');
});
app.post("/register", (req,res) => {
    console.log(req.body);
    data_service_auth.registerUser(req.body)
    .then(() => res.render("register", {successMessage: "User created!"}))
    .catch((error) => res.render('register', {errorMessage: error}));
});

//login routes
app.get('/login', (req,res) => {
    res.render('login');
});
app.post('/login', (req,res) => {
    req.body.userAgent = req.get('User-Agent'); //save userAgent 
    data_service_auth.checkUser(req.body)
    .then((user) => {
        req.userSession.user = {  // Add the user on the session and redirect
            userName: user.userName,
            userID: user.userID,
        }
        console.log('nice');
        res.redirect('/semesters');
    })
    .catch((err) => {
        res.render("login", {errorMessage: err, userName: req.body.userName})
    });
});
//logout route
app.get("/logout", (req,res) => {
    req.userSession.reset();
    res.redirect("/");
});
//semester routes
app.get('/semesters', ensureLogin, (req,res) => {
    data_service.getCurrentUserID(req.userSession.user.userID);
    data_service.getAllSemesters()
    .then((allSems) => {
        //console.log('\n\n\n\n' + allSems.length + '\n\n\n\n');
        if(allSems.length > 0) 
        {
            allSems.forEach(aSem => {
                aSem["Start"] = aSem["Start"].toDateString(); //formatting for displaying 
                aSem["Finish"] = aSem["Finish"].toDateString();
            });
            res.render('semesters', {semester_data: allSems, layout: 'main'});
        }
        else 
            res.render('semesters');
    })
    
})
app.post('/semesters/add', (req,res) => {
    data_service.getCurrentUserID(req.userSession.user.userID);
    data_service.addSemester(req.body)
    .then(() => res.redirect('/semesters'))
    .catch((msg) => { 
        console.log(msg);
        res.redirect('/semesters') 
    });
})

//let app listens to requests
data_service_auth.initialize()
.then(() => {
    data_service.initialize()
    .then(() => app.listen(HTTP_PORT, onHTTPStart))
    .catch((error) => console.log(error));
})
.catch((error) => {
    console.log(error);
});
