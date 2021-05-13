const express = require("express");
const auth = require("../controller/authController");
const verifyJwt = require("../middleware/jwt");
const router = express.Router();

router.post("/signup", auth.signUpNew);

router.post("/getOtp", auth.requestOtpNew);

router.post("/verifyOtp", auth.verifyOTPNew);

router.post("/login", auth.LoginNew);

// router.post("/resetPassOtp", auth.checkIfUserExist, auth.getOtp);

router.get("/getUsers", verifyJwt, auth.getUsers);

router.get("/getUserById/:authId", verifyJwt, auth.getUserById);

router.post("/updateUser", auth.updateUserDetails);

router.post("/resetPassword", auth.resetPassword);

module.exports = router;