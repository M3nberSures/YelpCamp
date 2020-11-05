require('dotenv').config();
const express = require("express");
const app = express();
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const path = require('path');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const flash = require("connect-flash");
const moment = require('moment');
// seedDB();
const port = process.env.PORT || 8080;
const production = (process.env.PRODUCTION === 'true');

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  family: 4
};

if (production) {
  mongoose.connect(process.env.PROD_DATABASE_URL, options);
  app.use(morgan('short'));
} else {
  mongoose.connect(process.env.DEV_DATABASE_URL, options);
  app.use(morgan('dev'));
}

mongoose.connection.on('connected', function () {
  if (production) {
    console.log('Mongoose connection open to ' + process.env.PROD_DATABASE_URL);
  } else {
    console.log('Mongoose connection open to ' + process.env.DEV_DATABASE_URL);
  }
});

mongoose.connection.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose connection disconnected');
});

process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose connection disconnected through app termination');
    process.exit(0);
  });
});

const corsOptions = {
  origin: 'https://yelpcamp.mathieulussier.ca/',
  optionsSuccessStatus: 200
};

app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        "default-src": ["'self'"],
        "base-uri": ["'self'"],
        "font-src": ["'self'", "https: data:"],
        "frame-ancestors": ["'self'"],
        "img-src": ["'self'", "res.cloudinary.com", "data:"],
        "object-src": ["'none'"],
        "script-src": ["'self'", "'unsafe-inline'", "kit.fontawesome.com"],
        "script-src-attr": ["'none'"],
        "style-src": ["'self'", "https: 'unsafe-inline'"],
        "connect-src": ["'self'", "ka-f.fontawesome.com"]
      },
    })
);
app.use(
    helmet.referrerPolicy({
      policy: ["origin", "unsafe-url"],
    })
);
if (production) {
  app.use(cors(corsOptions));
} else {
  app.use(cors());
}
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(require('express-session')({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
  res.locals.user = req.user;
  res.locals.urlvar = req.query;
  res.locals.notlogin = req.flash("notlogin");
  res.locals.errorlogin = req.flash("errorlogin");
  res.locals.errorregister = req.flash("errorregister");
  res.locals.errorpasswordchange = req.flash("errorpasswordchange");
  res.locals.errorcampground = req.flash("errorcampground");
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use( function (req, res, next) {
  if ( req.method == 'POST' && req.url == '/login' ) {
    if ( req.body.remember ) {
      req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
    } else {
      req.session.cookie.expires = false;
    }
  }
  next();
});

app.use(require("./routes"));
app.use("/campgrounds", require("./routes/campgrounds"));

app.all("*", function(req, res) {
  return res.status(404).render("error", {
    doctitle: 'error',
    message: 'Error 404 ! Cannot found the ressources you are looking for !'
  });
});

app.use((err, req, res) => {
  if(err.name === "UnauthorizedError"){
    return res.status(401).json({
      status: 401,
      message: err.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on ${port}`);
});

