// This is for parsing data in the body of post requests
const bodyParser = require("body-parser");
// This our express server library
const express = require("express");
// This our sessions library for the loggin in and out
const session = require("express-session");
const { path } = require("express/lib/application");
// This the library for our database
const sqlite3 = require('sqlite3').verbose();
// This the librarys for getting user logos
const pathMod = require('path');
const multer = require('multer');
// This our library for API request to IceCat
const api = require('./api/api')
// This our library for database querying
const dbjs = require('./db/db')

// Here we creating our server
const app = express();
const port = 8082;

//////////////////////// File uploading
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/user_logos');
  },
  filename: (req, file, callback) => {
    callback(null, req.session.userId + pathMod.extname(file.originalname));
  }
});

const upload = multer({
  storage: fileStorageEngine,
  fileFilter: function(req,file,callback){
    checkFileType(file,callback);
  }
});

function checkFileType(file,callback){
  // extensions allowed
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(pathMod.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype)

  if(mimetype && extname) return callback(null,true);
  else callback("Error: only jpeg or png images");
}
//////////////////////// File uploading

//////////////////////// Database
// Here we referencing our databse
const db = new sqlite3.Database('./db/easy-catalogue.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the database.');
  });
//////////////////////// Database

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

//////////////////////// Making methods global
global.db = db;
global.api = api;
global.dbjs = dbjs;
global.upload = upload;
global.pathMod = pathMod;
//////////////////////// Making methods global

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