const mongoose = require("mongoose");

const schema = mongoose.Schema;

const subcategoryModel = new schema({
    title: {
        type: String
    },
    sub_cat_slug: {
        type: String,
    },
    imgUrl: {
        type: String,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    },
    discountPercentage: {
        type: String,
    },
    isActive: {
        type: Number,
        default: 1,
    },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })

module.exports = mongoose.model("subcategory", subcategoryModel);