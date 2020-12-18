var HTTP_PORT = process.env.PORT || 8080;   
function onHTTPStart() { 
    console.log("Express http server listening on " + HTTP_PORT);
}

const express = require("express"); //require and use express()
const app = express();

const bodyParser = require("body-parser"); //require bodyParser to parese request.body 

const path = require("path");

const exphbs = require("express-handlebars");   //require express-handlebars
app.engine('.hbs', exphbs({ //create handlebar engine to handle HTML files 
    extname: '.hbs',
    defaultLayout: 'main',
    runtimeOptions: {   //to fix not property of bug
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
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

//todo: server routes 

app.get('/', (req,res) => {
    res.render('home');
})





//let app listens to requests
app.listen(HTTP_PORT, onHTTPStart);
