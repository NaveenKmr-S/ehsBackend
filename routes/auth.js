const express = require("express");
const auth = require("../controller/authController");
const verifyJwt = require("../middleware/jwt");
const router = express.Router();

router.get("/getUsers", verifyJwt, auth.getUsers);

router.get("/getUserById/:authId", verifyJwt, auth.getUserById);

router.post("/signup", auth.checkAlreadyUserExist, auth.signup);

router.post("/getOtp",auth.checkAlreadyUserExist, auth.getOtp);

router.post("/verifyOtp", auth.activateAccount);

router.post("/resetPassOtp", auth.checkIfUserExist , auth.getOtp);

router.post("/login", auth.login);

router.post("/updateUser", auth.updateUserDetails);

router.post("/resetPassword", auth.resetPassword);

module.exports = router;
