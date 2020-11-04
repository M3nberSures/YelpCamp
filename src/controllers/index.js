const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require('jsonwebtoken');

const User = require("../models/user");
const UsedToken = require("../models/usedToken");

const email = require('../utils/email');
const usersUtil = require('../utils/users');

module.exports.getIndex = (req, res) => {
    res.render("landing");
}

module.exports.postRegister = (req, res) => {
    let p1 = req.body.password;
    let p2 = req.body.password2;
    if ( p1 !== p2) {
      req.flash("errorregister", "Password does not match");
      return res.redirect("back");
    };
    let newUser = new User({ username: req.body.username, email: req.body.email });
  
    User.register(newUser, req.body.password, async function(err, user) {
      if (err){
        req.flash("errorregister", err.message);
        return res.redirect("back");
      };
  
      const token = await jwt.sign({ _id: user._id, username: user.username, email: user.email }, process.env.JSON_WEB_TOKEN_SECRET, { expiresIn: '1h' });
      await email.sendRegisterEmail(user._id, user.username, user.email, req.protocol + '://' + req.get('host'), token);
  
      passport.authenticate("local")(req, res, async function() {
        req.flash("success", "Welcome to YelpCamp, " + user.username + " !");
        res.redirect("back");
      });
    });
  }

  module.exports.postLogin = (req, res, next) => {
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
  }

  module.exports.getLogout = (req,res)=>{
    req.logout();
    req.flash("success", "Successfully Deconnected!");
    res.redirect("back");
  };

  module.exports.getProfileById = function(req, res){
    User.findById(req.params.id, function (err, u){
      res.render("profil", { doctitle: "profile", u:u});
    });
  }

  module.exports.getVerifyToken = async function(req, res) {
    const token = req.params.token;

    const isExist = (await UsedToken.find({token: token})).length > 0;

    if (isExist) {
      req.flash("error", "The verify token as been already verified !");
      return res.redirect("/campgrounds");
    }

    let decoded;
    let user;
    try {
      decoded = await jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET);
      user = await User.findById(decoded._id);
    } catch (err) {
      return res.render('error', {
        doctitle: 'error',
        message: err.message
      });
    } finally {
      const blacklistToken = new UsedToken({token: token, expirationDate: decoded.expiredAt});

      await blacklistToken.save();

      user.active = true;

      user.save().then(() => {
        req.flash("success", "Successfully verified your account!");
        res.redirect("/campgrounds");
      });
    }
  }

  module.exports.changePassword = async function(req, res) {
    const userId = req.user._id;
    const currentPassword = req.body.currentPassword;
    const changePassword = req.body.changePassword;
    const confirmPassword = req.body.confirmPassword;

    if (!currentPassword || !changePassword || !confirmPassword) {
      req.flash("errorpasswordchange", "Some data is missing!");
      return res.status(400).redirect('back');
    }

    try {
      const findUser = await User.findById(userId);
      if (!usersUtil.comparePassword(changePassword, confirmPassword)) {
        req.flash("errorpasswordchange", "Password dont match!");
        return res.status(400).redirect('back');
      }
      await findUser.changePassword(currentPassword, changePassword);
      findUser.save();
      req.flash("success", "Successfully change your password!");
      return res.status(200).redirect('back');
    } catch (e) {
      req.flash("errorpasswordchange", e.message);
      return res.status(404).redirect('back');
    }
  }
