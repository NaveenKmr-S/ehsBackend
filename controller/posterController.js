const posterDb = require("../model/posterModel");
const subCategoryDb = require("../model/subCategoryModel");
const categoryDb = require("../model/categoryModel");
const base64_encode = require("../helpers/base64");
const fs = require("fs");
const commonFunction = require("../common/common")
const mongoose = require("mongoose");


exports.createPoster = async(req, res, next) => {
    try {
        let payload = req.body;
        let insertObj = {
            name: payload.name,
            category: payload.category,
            subCategory: payload.subCategory,
            language: payload.language,
            creator: payload.creator,
            imgUrl: payload.imgUrl,
            description: payload.description,
            discountPercentage: payload.discountPercentage,
            stocks: payload.stocks,
            materialDimension: payload.materialDimension,
            tags: payload.tags,
            link: payload.link,
            sku: payload.sku,
            weight: payload.weight,
            additionalDetails: payload.additionalDetails,
            bestSeller: payload.bestSeller,
            originalPrice: payload.originalPrice

        };
        if (!insertObj.name) {
            throw new Error("Give a proper poster name");
        }
        insertObj.slug = commonFunction.autoCreateSlug(insertObj.name)
        let posterAldreadyFound = await posterDb.find({ slug: insertObj.slug, isActive: 1 }).limit(1).exec()
        if (posterAldreadyFound && Array.isArray(posterAldreadyFound) && posterAldreadyFound.length) {
            throw new Error("Poster name already exists")
        }

        let result = await new posterDb(insertObj).save();
        commonFunction.actionCompleteResponse(res, result)

    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)

    }
};

exports.getPosterById = async(req, res, next) => {
    try {
        let payload = req.query;
        let findCriteria = {
            isActive: 1
        }
        payload.slug ? findCriteria.slug = payload.slug : ""
        payload.poster_obj_id ? findCriteria._id = mongoose.Types.ObjectId(payload.poster_obj_id) : ""
        console.log(findCriteria)
        let posterResult = await posterDb.find(findCriteria)
        let result = await posterDb.find(findCriteria)
            .populate("category")
            .populate("subCategory")
            .populate("materialDimension")
        if (!(result && Array.isArray(result) && result.length)) {
            throw new Error("Poster Not Found with the given Data")
        }
        let parsedPoster = JSON.parse(JSON.stringify(posterResult))
        let category = parsedPoster[0].category

        let findRealtedPosters = {
            isActive: 1,
            category: {
                $in: category
            }
        }
        let relatedProd = await posterDb.find(findRealtedPosters).limit(10).exec()
        let bestSellerFindCriteria = {
            isActive: 1,
            bestSeller: 1
        }
        let bestSellarposter = await posterDb.find(bestSellerFindCriteria).limit(10).exec()
        let responsetoSend = {
            posterDetails: result,
            realtedPosters: relatedProd,
            youMayAlsoLike: bestSellarposter
        }

        commonFunction.actionCompleteResponse(res, responsetoSend)

    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)
    }
};

exports.getPosterBySubCategory = async(req, res, next) => {
    try {
        let payload = req.query
        let findCriteria = {
            isActive: 1
        }
        let skip = payload.skip || 0
        let limit = payload.limit || 20
        payload.category_slug ? findCriteria.cat_slug = payload.category_slug : ""
        payload.cat_obj_id ? findCriteria._id = mongoose.Types.ObjectId(payload.cat_obj_id) : ""
        payload.subcategorySlug ? findCriteria.sub_cat_slug = payload.subCategorySlug : ""
        payload.sub_cat_obj_id ? findCriteria._id = mongoose.Types.ObjectId(payload.sub_cat_obj_id) : ""
        if (findCriteria.cat_slug || findCriteria._id) {
            let catResult = await categoryDb.find(findCriteria).limit(1).exec()
            if (!(catResult && Array.isArray(catResult) && catResult.length)) {
                throw new Error("Category Not Found")
            }
            let posterFindCriteria = {
                isActive: 1,
                category: {
                    $in: catResult[0]._id
                }
            }
            let postersExists = await posterDb.find(posterFindCriteria).skip(skip).limit(limit)
            return commonFunction.actionCompleteResponse(res, postersExists)

        } else if (findCriteria._id || findCriteria.sub_cat_slug) {
            let subcatResult = await subCategoryDb.find(findCriteria).limit(1).exec()
            if (!(subcatResult && Array.isArray(subcatResult) && subcatResult.length)) {
                throw new Error("sub Category Not Found")
            }
            let posterFindCriteria = {
                isActive: 1,
                subCategory: {
                    $in: subcatResult[0]._id
                }
            }
            let postersExists = await posterDb.find(posterFindCriteria).skip(skip).limit(limit)
            return commonFunction.actionCompleteResponse(res, postersExists)

        } else {
            throw new Error("Not Data Available, Enter Proper Data")
        }
    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)

    }
};

exports.getPoster = async(req, res, next) => {

    try {
        let payload = req.query
        let findCriteria = {
            isActive: 1
        }
        let skip = payload.skip || 0
        let limit = payload.limit || 20
        let result = await posterDb.find(findCriteria)
            .populate("category")
            .populate("subCategory")
            .populate("materialDimension").skip(skip).limit(limit)
        commonFunction.actionCompleteResponse(res, result)

    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)

    }
};

exports.updatePoster = async(req, res, next) => {
    try {
        let payload = req.body;
        let poster_obj_id = payload.poster_obj_id;

        let updateObj = {};
        if (payload.name) {
            updateObj.name = payload.name;
            updateObj.slug = commonFunction.autoCreateSlug(payload.name)
            let posterAldreadyFound = await posterDb.find({ slug: updateObj.slug, isActive: 1 }).limit(1).exec()
            if (posterAldreadyFound && Array.isArray(posterAldreadyFound) && posterAldreadyFound.length) {
                throw new Error("Poster name already exists")
            }
        }
        payload.language ? updateObj.language = payload.language : ""
        payload.creator ? updateObj.creator = payload.creator : ""
        payload.imgUrl ? updateObj.imgUrl = payload.imgUrl : ""
        payload.description ? updateObj.description = payload.description : ""
        payload.discountPercentage ? updateObj.discountPercentage = payload.discountPercentage : ""
        payload.stocks ? updateObj.stocks = payload.stocks : ""
        payload.link ? updateObj.link = payload.link : ""
        payload.sku ? updateObj.sku = payload.sku : ""
        payload.weight ? updateObj.weight = payload.weight : ""
        payload.additionalDetails ? updateObj.additionalDetails = payload.additionalDetails : ""
        payload.originalPrice ? updateObj.originalPrice = payload.originalPrice : ""
        payload.bestSeller == 0 || payload.bestSeller ? updateObj.bestSeller = payload.bestSeller : ""
        payload.isActive == 0 || payload.isActive ? updateObj.isActive = payload.isActive : ""
        if (payload.operationType) {
            switch (payload.operationType) {
                case commonFunction.operationType.PUSH:
                    {
                        payload.category ? updateObj.$addToSet = {...updateObj.$addToSet, category: payload.category } : ""
                        payload.subCategory ? updateObj.$addToSet = {...updateObj.$addToSet, subCategory: payload.subCategory } : ""
                        payload.tags ? updateObj.$addToSet = {...updateObj.$addToSet, tags: payload.tags } : ""
                        payload.materialDimension ? updateObj.$addToSet = {...updateObj.$addToSet, materialDimension: payload.materialDimension } : ""
                        payload.imgUrl ? updateObj.$addToSet = {...updateObj.$addToSet, imgUrl: payload.imgUrl } : ""
                    }
                    break;
                case commonFunction.operationType.PULL:
                    {
                        payload.category ? updateObj.$pull = {...updateObj.$pull, category: payload.category } : ""
                        payload.subCategory ? updateObj.$pull = {...updateObj.$pull, subCategory: payload.subCategory } : ""
                        payload.tags ? updateObj.$pull = {...updateObj.$pull, tags: payload.tags } : ""
                        payload.materialDimension ? updateObj.$pull = {...updateObj.$pull, materialDimension: payload.materialDimension } : ""
                        payload.imgUrl ? updateObj.$pull = {...updateObj.$pull, imgUrl: payload.imgUrl } : ""
                    }
                    break;
                case commonFunction.operationType.REPLACE:
                    {
                        payload.category ? updateObj.category = payload.category : ""
                        payload.subCategory ? updateObj.subCategory = payload.subCategory : ""
                        payload.tags ? updateObj.tags = payload.tags : ""
                        payload.materialDimension ? updateObj.materialDimension = payload.materialDimension : ""
                        payload.imgUrl ? updateObj.imgUrl = payload.imgUrl : ""
                    }
                    break;
                default:
                    break;

            }
        }
        let result = await posterDb.findOneAndUpdate({ _id: poster_obj_id }, updateObj, { new: true })
        commonFunction.actionCompleteResponse(res, result)

    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)

    }
};

exports.uploadFile = async(req, res, next) => {
    try {
        let imgUrl = `${req.protocol}://${req.get("host")}/${req.file.destination + req.file.filename}`;

        let responseObj = {
            fileSavedUrl: imgUrl,
            destination: req.file.destination,
            fileName: req.file.filename
        }
        commonFunction.actionCompleteResponse(res, responseObj)

    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)

    }
}