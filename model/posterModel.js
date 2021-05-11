const mongoose = require("mongoose");
const commonFunction = require("../common/common")

const schema = mongoose.Schema;

const posterModel = new schema({
    name: {
        type: String,
    },
    slug: { type: String },
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
    }],
    subCategory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "subcategory",
    }],
    language: {
        type: Number,
        default: commonFunction.languagesPoster.ENGLISH
    },
    creator: {
        type: String,
    },
    imgUrl: [{
        type: String,
    }],
    description: {
        type: String,
    },
    discountPercentage: {
        type: String,
    },
    stocks: {
        type: Number,
    },
    rating: {
        type: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
            rating: {
                type: String,
            },
        }, ],
        default: [],
    },
    bought: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
            },
            feedback: {
                type: String,
            },
        }, ],
        default: [],
    },
    materialDimension: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "MaterialDimension",
        }],
    },
    tags: [{
        type: String,
    }],
    link: {
        type: String,
    },
    sku: {
        type: String,
    },
    weight: {
        type: String,
    },
    additionalDetails: {
        type: String,
    },
    bestSeller: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Number,
        default: 1,
    },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

module.exports = mongoose.model("PosterModel", posterModel);