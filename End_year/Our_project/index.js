const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 8082;
const db = new sqlite3.Database('./db/easy-catalogue.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the database.');
  });
global.db = db;

app.listen(port, () => console.log(`Easy Catalogue is listening on port ${port}!`));

require("./routes/main")(app);

app.set("views", __dirname + "/views");

app.set("view engine", "ejs");

app.engine("html", require("ejs").renderFile);

// To run the server:
// 1) Start the server in the terminal - node index.js
// 2) Go to browser and enter the url 'localhost:port' where port will be the port number