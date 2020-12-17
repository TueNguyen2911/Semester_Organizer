var HTTP_PORT = process.env.PORT || 8080;   
function onHTTPStart() { 
    console.log("Express http server listening on " + HTTP_PORT);
}

const express = require("express"); //require and use express()
const app = express();

const bodyParser = require("body-parser"); //require bodyParser to parese request.body 

const path = require("path");

const exphbs = require("express-handlebars")

app.use(express.static(path.join(__dirname, 'views'))); //make /views static to use hbs 



//let app listens to requests
app.listen(HTTP_PORT, onHTTPStart);
