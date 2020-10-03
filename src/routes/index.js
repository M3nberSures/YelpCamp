const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");

// index page
router.get("/", (req, res) => {
    res.render("landing");
});
  
// register routes
router.post("/register", (req, res) => {
let p1 = req.body.password;
let p2 = req.body.password2;
if ( p1 !== p2) {
  req.flash("errorregister", "Password does not match");
  return res.redirect("back");
};
let newUser = new User({username: req.body.username, email: req.body.email});
User.register(newUser, req.body.password, function(err, user){
  if (err){
    req.flash("errorregister", err.message);
    return res.redirect("back");
  };
  passport.authenticate("local")(req, res, function(){
    req.flash("success", "Welcome to YelpCamp, " + user.username + " !");
    res.redirect("back");
  });
});
});
  

 router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (typeof req.body.remember != "undefined" && req.body.remember === true) {
      };
      if (err) { 
        return next(err); }
      if (!user) { 
        req.flash("errorlogin", "Wrong username or password!");
        return res.status(200).redirect('back'); } // error=login
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        req.flash("success", "Welcome back, " + user.username + " !");
        return res.status(200).redirect('back');
      });
    })(req, res, next);
  });
  
  router.get("/logout", (req,res)=>{
    req.logout();
    req.flash("success", "Successfully Deconnected!");
    res.redirect("back");
  });

  // profils routes
  router.get("/profils/:id", function(req, res){
    User.findById(req.params.id, function (err, u){
      res.render("profil", { doctitle: "profile", u:u});
    });
  });

  module.exports = router;
