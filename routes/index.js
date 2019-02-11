const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("../models/user.js"); 
const mongoose = require("mongoose");
const session = require('express-session');
const setCookie = require('set-cookie-parser');
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
      return res.redirect("/campgrounds");
    };
    let newUser = new User({username: req.body.username, email: req.body.email});
    User.register(newUser, req.body.password, function(err, user){
      if (err){
        req.flash("errorregister", err.message);
        return res.redirect("/campgrounds");
      };
      passport.authenticate("local")(req, res, function(){
        req.flash("success", "Successfully registered," + user.username + "!");
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
        return res.redirect('back'); } // error=login
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        req.flash("success", "Welcome back," + user.username + "!");
        return res.redirect('back');
      });
    })(req, res, next);
  });

  // login routes
  // router.post("/login", passport.authenticate("local", {
  //   successRedirect: "/campgrounds",
  //   failureRedirect: "/campgrounds?error=login"
  // }), function(req,res){
    
  // });
  
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
  
  router.get("*", (req, res) => {
    res.render("error", {
      doctitle: "error"
    });
  });
  

  module.exports = router;