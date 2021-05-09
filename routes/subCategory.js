const express = require('express');
const subCategoryControl = require('../controller/subcategoryController');
const storageUrl = require("../helpers/storageImg");
const verifyJwt = require("../middleware/jwt");

const router = express.Router();

router.get('/getSubCategory',  subCategoryControl.getSubCategory);

router.post('/createSubCategory',storageUrl.single("imgUrl"), subCategoryControl.createSubCategory);

router.post('/updateSubCategory',storageUrl.single("imgUrl"), subCategoryControl.updateSubCategory);

router.post('/deleteSubCategory', subCategoryControl.deleteSubCategory);

module.exports = router;