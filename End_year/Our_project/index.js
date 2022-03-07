// This is for parsing data in the body of post requests
const bodyParser = require("body-parser");
// This our express server library
const express = require("express");
// This our sessions library for the loggin in and out
const session = require("express-session");
// This the library for our database
const sqlite3 = require('sqlite3').verbose();

// Here we creating our server
const app = express();
const port = 8082;

//////////////////////// Database
// Here we referencing our databse
const db = new sqlite3.Database('./db/easy-catalogue.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the database.');
  });
// Here we make our database global so main.js can see it
global.db = db;
//////////////////////// Database

//////////////////////// API stuff
// This our function for the API requests to icecat
const api = require('./api/api')
// These are our database querying functions
const dbjs = require('./db/db')
// Below we just making them global
global.api = api;
global.dbjs = dbjs;
//////////////////////// API stuff

//////////////////////// Sessions
// Configure our sessions
const session_lifetime = 1000 * 60 * 60 // This is one hour session
// Here we making the session id global so main.js can see it
global.session_name = "session_id"
const session_secret = "ssh!quiet,it\'asecrete!" // this is a random string to sign the cookie
app.use(session({
  name: session_name,
  resave: false, // this we dont create a session each time there is a request if the session hasnt changed
  saveUninitialized: false, // this is not to save a session with no data
  secret: session_secret,
  cookie: {
    maxAge: session_lifetime, // this saying how long session is active
    sameSite: true, // this saying only one client can be accessing the session
    secure: false // this is true or false, false is fine when working on the production
  }
}))
//////////////////////// Sessions

//////////////////////// Body parser
app.use(bodyParser.urlencoded({
  extended:true
}))
//////////////////////// Body parser

//////////////////////// External resources
// Allows the html pages to load external files as css and js
app.use(express.static(__dirname + '/public'));
//////////////////////// External resources

//////////////////////// Server
app.listen(port, () => console.log(`Easy Catalogue is listening on port ${port}!`));
require("./routes/main")(app);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
//////////////////////// Server

// To run the server:
// 1) Start the server in the terminal - node index.js
// 2) Go to browser and enter the url 'localhost:port' where port will be the port number

// To run server with nodemon
// 1) Start the server in the terminal - npm run dev
// 2) Go to browser and enter the url 'localhost:port' where port will be the port number

// If port doesnt want to terminate: run 'kill $(lsof -t -i:8082)' for linux