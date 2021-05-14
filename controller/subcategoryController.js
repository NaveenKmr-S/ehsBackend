const subCategoryDb = require("../model/subCategoryModel");
const commonFunction = require("../common/common")
const mongoose = require("mongoose");

exports.getSubCategory = async(req, res, next) => {
    try {
        let payload = req.query
        let skip = parseInt(payload.skip) || 0;
        let limit = parseInt(payload.limit) || 30;

        let findCriteria = {
            isActive: 1
        }
        payload.categoryId ? findCriteria.categoryId = mongoose.Types.ObjectId(payload.categoryId) : ""
        let result = await subCategoryDb.find(findCriteria).skip(skip).limit(limit)
        return commonFunction.actionCompleteResponse(res, result)

    } catch (err) {
        return commonFunction.sendActionFailedResponse(res, null, err.message)
    }

};

exports.createSubCategory = async(req, res, next) => {
    try {
        let payload = req.body;
        let title = payload.title;
        let sub_cat_slug = commonFunction.autoCreateSlug(title);
        let imgUrl = payload.imgUrl
        let categoryId = payload.categoryId;
        let insertObj = {
            title,
            sub_cat_slug,
            imgUrl,
            categoryId,
            discountPercentage: payload.discountPercentage,

        }
        let findCriteria = {
            isActive: 1,
            sub_cat_slug,
        }
        let ifSubCatFound = await subCategoryDb.find(findCriteria)
        if (ifSubCatFound && Array.isArray(ifSubCatFound) && ifSubCatFound.length) {
            throw new Error("Sub Category already exists with this name")
        }
        let result = await new subCategoryDb(insertObj).save();
        return commonFunction.actionCompleteResponse(res, result)

    } catch (err) {
        return commonFunction.sendActionFailedResponse(res, null, err.message)

    }
};

exports.updateSubCategory = async(req, res, next) => {
    try {
        let payload = req.body;
        let sub_cat_obj_id = payload.sub_cat_obj_id;
        let updateObj = {};
        if (payload.title) {
            updateObj.title = payload.title;
            updateObj.sub_cat_slug = commonFunction.autoCreateSlug(updateObj.title);
            let findCriteria = {
                isActive: 1,
                sub_cat_slug: updateObj.sub_cat_slug,
            }
            let ifSubCatFound = await subCategoryDb.find(findCriteria)
            if (ifSubCatFound && Array.isArray(ifSubCatFound) && ifSubCatFound.length) {
                throw new Error("Sub Category already exists with this name , Cannot Update")
            }
        }
        payload.imgUrl ? updateObj.imgUrl = payload.imgUrl : ""
        payload.categoryId ? updateObj.categoryId = payload.categoryId : ""
        payload.isActive == 0 || updateObj.isActive ? updateObj.isActive = payload.isActive : ""
        payload.discountPercentage ? updateObj.discountPercentage = payload.discountPercentage : ""

        if (!sub_cat_obj_id) {
            throw new Error("Sub Cat obj not found")
        }
        let result = await subCategoryDb.findOneAndUpdate({ _id: sub_cat_obj_id }, updateObj, { new: true })
        return commonFunction.actionCompleteResponse(res, result)
    } catch (err) {
        return commonFunction.sendActionFailedResponse(res, null, err.message)
    }
};