const express = require("express");
const router = express.Router();

const middleware = require("../middleware");

const campgroundsController = require('../controllers/campgrounds');

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
});


// show all camprounds
router.get("/", campgroundsController.getCampgrounds);

  // post request to create new camground
  router.post("/", middleware.isLoggedIn, upload.single('image'), campgroundsController.postCampground);
  
  // show more info of campground
  router.get("/:id", campgroundsController.getCampground);

  // add new comment
  router.post("/:id/comments", middleware.isLoggedIn, campgroundsController.postComment);
  
  // edit comment
  router.post("/:id/comments/:commentid/edit", middleware.isLoggedIn, middleware.ownerCheckComment, campgroundsController.postEditComment);

  // delete comment
  router.get("/:id/comments/:commentid/delete", middleware.isLoggedIn, middleware.ownerCheckComment, campgroundsController.deleteComment);

  router.post("/:id/edit", middleware.isLoggedIn, middleware.ownerCheck,upload.single('image'), campgroundsController.postEditCampground);
  
  // delete campground
  router.post("/:id/delete", middleware.isLoggedIn, middleware.ownerCheck, campgroundsController.deleteCampground);
  
module.exports = router;
