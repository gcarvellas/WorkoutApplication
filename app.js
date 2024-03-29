const express = require('express');
const app = express();
const session = require('express-session');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const static = express.static(__dirname + '/public');
const helpers = require('./config/handlebars-helpers');

var hbs = exphbs.create({});

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine('handlebars', exphbs.engine({
    "defaultLayout": 'navbar',
    helpers: helpers
}));
app.set('view engine', 'handlebars');

app.use(session({
    name: "AuthCookie",
    secret: 'Cookie for Workout Application',
    resave: false,
    saveUninitialized: true
}))

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
  });
