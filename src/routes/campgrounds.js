const express = require("express");
const router = express.Router();

const middleware = require("../middleware");
const campgroundsController = require('../controllers/campgrounds');
const upload = require('../middleware/upload');
const resize = require('../middleware/resize');

// get camprounds
router.get("/", campgroundsController.getCampgrounds);

// get campground
router.get("/:id", campgroundsController.getCampground);

// post request to create new camground
router.post("/", middleware.isLoggedIn, upload, resize.resizeImages, campgroundsController.postCampground);

// edit campground
router.post("/:id/edit", middleware.isLoggedIn, middleware.ownerCheck, upload, resize.resizeImages, campgroundsController.postEditCampground);

// delete campground
router.post("/:id/delete", middleware.isLoggedIn, middleware.ownerCheck, campgroundsController.deleteCampground);

// add new comment
router.post("/:id/comments", middleware.isLoggedIn, campgroundsController.postComment);

// edit comment
router.post("/:id/comments/:commentid/edit", middleware.isLoggedIn, middleware.ownerCheckComment, campgroundsController.postEditComment);

// delete comment
router.get("/:id/comments/:commentid/delete", middleware.isLoggedIn, middleware.ownerCheckComment, campgroundsController.deleteComment);
  
module.exports = router;
