const Campground = require("../models/campground");
const Comment = require("../models/comment");
let middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()){
        return next();
    } else {
      req.flash("notlogin", "Please Login First!");
      res.redirect("/campgrounds");
    }
};

middlewareObj.ownerCheck = function (req, res, next) {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, x){ 
          if (err) throw err;
          if (x.author.id.equals(req.user._id)){
            return next();
          } else {
            req.flash("error", "You are not owner of this campground!");
            res.redirect("back");
          };
        });
      } else {
        req.flash("notlogin", "Please Login First!");
        res.redirect("back");
      }
};

middlewareObj.ownerCheckComment = function (req, res, next) {
    if(req.isAuthenticated()){
        Comment.findById(req.params.commentid, function(err, y){ 
          if (err) throw err;
          if (y.author.id.equals(req.user._id)){
            return next();
          } else {
            req.flash("error", "You are not owner of this comment!");
            res.redirect("back");
          };
        });
      } else {
        req.flash("notlogin", "Please Login First!");
        res.redirect("back");
      }
};

module.exports = middlewareObj;
