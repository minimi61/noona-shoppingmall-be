const express = require("express");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const router = express.Router();

router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser);

module.exports = router;
