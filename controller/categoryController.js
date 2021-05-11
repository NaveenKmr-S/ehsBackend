const categoryDb = require("../model/categoryModel");
const commonFunction = require("../common/common")


exports.getCategory = async(req, res, next) => {
    try {
        let payload = req.query
        let skip = parseInt(payload.skip) || 0;
        let limit = parseInt(payload.limit) || 30;

        let findCriteria = {
            isActive: 1
        }
        payload.cat_slug ? findCriteria.cat_slug = payload.cat_slug : ""

        let result = await categoryDb.find(findCriteria).skip(skip).limit(limit)
        commonFunction.actionCompleteResponse(res, result)

    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)
    }
};

exports.getCategoryById = async(req, res, next) => {
    try {
        let payload = req.query
        let criteria = { isActive: 1 }
        payload.cat_obj_id ? criteria.cat_obj_id = payload.cat_obj_id : ""
        payload.cat_slug ? criteria.cat_slug = payload.cat_slug : ""
        let agg = [{
                '$match': criteria
            },
            {
                $lookup: {
                    from: "subcategories",
                    let: { workflowId: "$_id", isActiveCheck: 1 },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$categoryId", "$$workflowId"] },
                                    { $eq: ["$isActive", "$$isActiveCheck"] }
                                ]
                            }
                        }
                    }, ],
                    as: "sub_category"
                }
            }
        ]
        let result = await categoryDb.aggregate(agg)

        commonFunction.actionCompleteResponse(res, result)

    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)

    }

};

exports.createCategory = async(req, res, next) => {
    try {
        let payload = req.body;
        let title = payload.title;
        let cat_slug = commonFunction.autoCreateSlug(title);
        let imgUrl = payload.imgUrl

        let insertObj = {
            title,
            cat_slug,
            imgUrl,
            discountPercentage: payload.discountPercentage,
        }
        let findCriteria = {
            isActive: 1,
            cat_slug
        }
        let ifCatFound = await categoryDb.find(findCriteria).skip(skip).limit(limit)
        if (ifcatFound && Array.isArray(ifCatFound) && ifCatFound.length) {
            throw new Error("Category already exists with this name")
        }

        let result = await new categoryDb(insertObj).save();
        commonFunction.actionCompleteResponse(res, result)

    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)

    }
};

exports.updateCategory = async(req, res, next) => {
    try {
        let payload = req.body;
        let cat_obj_id = payload.cat_obj_id;
        let updateObj = {};
        if (payload.title) {
            updateObj.title = payload.title;
            updateObj.cat_slug = commonFunction.autoCreateSlug(updateObj.title);
            let findCriteria = {
                isActive: 1,
                cat_slug: updateObj.cat_slug
            }
            let ifCatFound = await categoryDb.find(findCriteria).skip(skip).limit(limit)
            if (ifcatFound && Array.isArray(ifCatFound) && ifCatFound.length) {
                throw new Error("Category already exists with this name , Update Failed")
            }

        }
        payload.imgUrl ? updateObj.imgUrl = payload.imgUrl : ""
        payload.isActive == 0 || updateObj.isActive ? updateObj.isActive = payload.isActive : ""
        payload.discountPercentage ? updateObj.discountPercentage = payload.discountPercentage : ""
        if (!cat_obj_id) {
            throw new Error("Sub Cat obj not found")
        }
        let result = await categoryDb.findOneAndUpdate({ _id: cat_obj_id }, updateObj, { new: true })
        commonFunction.actionCompleteResponse(res, result)
    } catch (err) {
        commonFunction.sendActionFailedResponse(res, null, err.message)
    }
};