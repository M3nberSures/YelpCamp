const express = require("express");
const router = express.Router();

const indexController = require('../controllers/index');

// index page
router.get("/", indexController.getIndex);
  
// register routes
router.post("/register", indexController.postRegister);
  

 router.post('/login', indexController.postLogin);
  
  router.get("/logout", indexController.getLogout);

  // profils routes
  router.get("/profils/:id", indexController.getProfileById);

  // verify user registration token
  router.get('/verify/:token', indexController.getVerifyToken);

  module.exports = router;
