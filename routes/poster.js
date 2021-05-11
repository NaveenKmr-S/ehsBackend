const express = require('express');
const posterControl = require('../controller/posterController');
const storageUrl = require("../helpers/storageImg");
const router = express.Router();

const verifyJwt = require("../middleware/jwt");

router.get('/getPoster', posterControl.getPoster);

router.get('/getPosterById', posterControl.getPosterById);

router.get("/getPosterByCatSubCat", posterControl.getPosterBySubCategory);

router.post('/createPoster', posterControl.createPoster);

router.post('/updatePoster', posterControl.updatePoster);

router.post('/uploadFile', storageUrl.single("imgUrl"), posterControl.uploadFile);

module.exports = router;