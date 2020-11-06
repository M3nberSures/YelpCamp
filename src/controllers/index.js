const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

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
      if (typeof req.body.remember != "undefined" && req.body.remember === true) {};
      if (err) {
        req.flash("error", err.message);
        return res.redirect('back');
      }
      if (!user) { 
        req.flash("errorlogin", "Wrong username or password!");
        return res.status(200).redirect('back'); } // error=login
      req.logIn(user, function(err) {
        if (err) {
          req.flash("error", err.message);
          return res.redirect('back');
        }
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
      if (err) {
        req.flash("error", err.message);
        return res.redirect('back');
      }
      if (!u) {
        req.flash("error", "Cannot find the user profile your are looking for !");
        return res.redirect('back');
      }
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
      await findUser.save();
      req.flash("success", "Successfully change your password!");
      return res.status(200).redirect('back');
    } catch (e) {
      req.flash("errorpasswordchange", e.message);
      return res.status(404).redirect('back');
    }
  }

  module.exports.updateProfileImage = async function(req, res) {
    if (typeof req.file === 'undefined') {
      console.log(req.file);
      req.flash("error", "Please upload an image for your profile!");
      return res.status(404).redirect('back');
    }

    const userId = req.user._id;
    const url = req.protocol + '://' + req.get('host');
    const imagePath = url + '/uploads/images/' + req.file.filename;
    let filepath;
    
    try {
      const findUser = await User.findById(userId);
      if (!findUser) {
        throw 'Cannot find your profile!';
      }
      const filename = findUser.image.replace(/^.*[\\\/]/, '');
      filepath = path.join(__dirname, '/../public/uploads/images/', filename);
      findUser.image = imagePath;
      await findUser.save();
      req.flash("success", "Successfully change your profile image!");
      return res.status(200).redirect('back');
    } catch (e) {
      req.flash("error", e.message);
      return res.status(500).redirect('back');
    } finally {
      try {
        fs.unlinkSync(filepath);
      } catch (e) {
        
      }
    }
  }

  module.exports.editProfile = async function(req, res) {
    let bError = false;
    let sErrorMsg = '';
    const id = req.user._id;
    const email = req.body.profileEmail;
    const phone = req.body.profilePhone;
    const country = req.body.profileCountry;
    const description = req.body.profileDescription;

    const newData = { email, phone, country, description };

    for (let prop in newData) {
      if (newData.hasOwnProperty(prop)) {
        console.log(prop);
        const value = newData[prop];
        if (value == null || value === '' || value.length <= 0) {
          bError = true;
          sErrorMsg = `The field ${prop} is empty or missing!`;
          break;
        }
      }
    }

    if (bError) {
      req.flash("error", sErrorMsg);
      return res.redirect('back');
    }

    try {
      const findUser = await User.findById(id);
      if (!findUser) {
        throw 'Cannot find your profile!';
      }
      findUser.email = newData.email;
      findUser.phone = newData.phone;
      findUser.country = newData.country;
      findUser.description = newData.description;
      await findUser.save();
      req.flash("success", "Successfully updated your profile!");
      return res.status(200).redirect('back');
    } catch (e) {
      req.flash("error", e.message);
      return res.status(500).redirect('back');
    }
  }


  module.exports.sendNewEmail = async function(req, res) {
    const id = req.user._id;
    try {
      const findUser = await User.findById(id);
      if (!findUser) {
        throw 'Cannot find your profile!';
      }
      const token = await jwt.sign({ _id: findUser._id, username: findUser.username, email: findUser.email }, process.env.JSON_WEB_TOKEN_SECRET, { expiresIn: '1h' });
      await email.sendRegisterEmail(findUser._id, findUser.username, findUser.email, req.protocol + '://' + req.get('host'), token);
      req.flash("success", "Successfully sended new confirmation email!");
      return res.status(200).redirect('back');
    } catch (e) {
      req.flash("error", e.message);
      return res.status(500).redirect('back');
    }
  }
