const express = require("express");
const router = express.Router();

const middleware = require("../middleware");

const upload = require('../middleware/upload');
const resize = require('../middleware/resize');

const indexController = require('../controllers/index');

// index page
router.get("/", indexController.getIndex);
  
// register routes
router.post("/register", indexController.postRegister);


 router.post('/login', indexController.postLogin);
  
  router.get("/logout", indexController.getLogout);

  router.post("/changepassword", middleware.isLoggedIn, indexController.changePassword);

  router.post("/updateprofileimage", middleware.isLoggedIn, upload.single('profileimg'), resize.resizeImages, indexController.updateProfileImage);
  router.post("/editprofile", middleware.isLoggedIn, indexController.editProfile);


  // profils routes
  router.get("/profils/:id", indexController.getProfileById);

  // verify user registration token
  router.get('/verify/:token', indexController.getVerifyToken);

  module.exports = router;
