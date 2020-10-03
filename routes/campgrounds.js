const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const multer = require('multer');
const mongoose = require("mongoose");
const middleware = require("../middleware");
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
  cloud_name: 'dbmathieu',
  api_key: "369353311121155",
  api_secret: "6X7mC9mtjdE4jdx8a6pTA1xWxTQ"
});

// show all camprounds
router.get("/", (req, res) => {
    // get all campgrounds from db
    Campground.find({}, (err, campgrounds) => {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds", {
          campgrounds: campgrounds,
          doctitle: "Camgrounds Page",
         
        });
      }
    });
  });
  function Camground(name, image, description, price, username, iduser) {
    this.name = name;
    this.image = image;
    this.description = description;
    this.price = price;
    this.author = {
      username: username,
      id: iduser
    };
  }
  // post request to create new camground
  router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) => {
    cloudinary.uploader.upload(req.file.path, function (result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.image = result.secure_url;
      let newCampground = new Camground (req.body.name, req.body.image, req.body.description, req.body.price, req.user.username, req.user._id);
      Campground.create(newCampground, function (err, newlyCreated) {
        if (err) throw err;
        req.flash("success", "Successfully created new campground " + newlyCreated.name +"!");
        res.redirect("/campgrounds");
      });
    });
  });
  
  // display form for new campground
  router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("new.ejs", {
      doctitle: "Add New",
    });
  });
  
  // show more info of campground
  router.get("/:id", function (req, res) {
    let id = req.params.id;
    Campground.findById(id).populate("comments").exec(function (err, foundCampground) {
      if (err) {
        console.log(err);
      } else  {
        // console.log(foundCampground);
        res.render("show", {
          doctitle: "Show",
          campground: foundCampground
        });
      }
    });
  
  });
  // add new comment
  router.post("/:id/comments", middleware.isLoggedIn,function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
      if (err) throw err;
      Comment.create({
        text: req.body.comment,
        author: {
          id: req.user._id,
          username: req.user.username,
        }
      }, function (err, comment) {
        if (err) throw err;
        campground.comments.push(comment);
        campground.save();
      });
    });
    res.redirect("/campgrounds/" + req.params.id);
  });
  
  // edit comment
  router.post("/:id/comments/:commentid/edit", middleware.isLoggedIn, middleware.ownerCheckComment,function (req, res) {
    let newdata = {
      text: req.body.comment
    };
    Comment.findByIdAndUpdate(req.params.commentid, newdata ,function(err, comment){
      res.redirect("/campgrounds/" + req.params.id);
    });
  });

  // delete comment
  router.get("/:id/comments/:commentid/delete", middleware.isLoggedIn, middleware.ownerCheckComment,function (req, res) {
    Comment.findByIdAndRemove(req.params.commentid, function(err, comment){
      if (err) throw err;
      res.redirect("/campgrounds/" + req.params.id);
    });
  });


  router.post("/:id/edit", middleware.isLoggedIn, middleware.ownerCheck,upload.single('image'), function(req, res){
    if (typeof req.file == 'undefined') {
      Campground.findById(req.params.id, function(err, foundcampground){
        if (err) throw err;
        let newData = {
          name: req.body.name,
          image: foundcampground.image,
          description: req.body.description,
          price: req.body.price
        };
        Campground.findByIdAndUpdate(req.params.id, newData, function(err, campground) {
          if (err) throw err;
          req.flash("success", "Successfully updated " + campground.name + " campground!");
          res.redirect("/campgrounds/" + req.params.id);
      });
      });
     } else {
      cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.image = result.secure_url;
        Campground.findByIdAndUpdate(req.params.id, req.body, function(err, campground) {
            if (err) throw err;
            req.flash("success", "Successfully updated " + campground.name + " campground!");
            res.redirect("/campgrounds/" + req.params.id);
        });
      });
     };
  });
  
  // delete campground
  router.post("/:id/delete", middleware.isLoggedIn, middleware.ownerCheck, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err, deletedCampground){
      if (err) throw err;
      req.flash("success", "Successfully deleted " + deletedCampground.name + " campground!");
      res.redirect("/campgrounds");
    });
  });
  
module.exports = router;
