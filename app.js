require('dotenv').config();
const production = (process.env.PRODUCTION === 'true');
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
if (production) {
  mongoose.connect(process.env.PROD_DATABASE_URL);
} else {
  mongoose.connect(process.env.DEV_DATABASE_URL);
}
const cool = require('cool-ascii-faces');
const path = require('path');
const PORT = process.env.PORT || 8080;
const expressSanitizer = require("express-sanitizer");
const Campground = require("./models/campground.js");
const Comment = require("./models/comment.js");
// ROUTES 
const campgroundRoutes = require("./routes/campgrounds");
const indexRoutes = require("./routes/index");
const seedDB = require("./seeds.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require('express-session');
const setCookie = require('set-cookie-parser');
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user.js");
const flash = require("connect-flash");
// seedDB();
const multer = require('multer');
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
let imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
let upload = multer({
  storage: storage,
  fileFilter: imageFilter
})

const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(require('express-session')({
  secret: "137974a1206",
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
app.use("/campgrounds",campgroundRoutes);
app.use(indexRoutes);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
