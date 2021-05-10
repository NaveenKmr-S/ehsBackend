const mongoose = require("mongoose");

const schema = mongoose.Schema;

const categoryModel = new schema({
    title: {
        type: String
    },
    cat_slug: {
        type: String,
    },
    imgUrl: {
        type: String,
    },
    isActive: {
        type: Number,
        default: 1,
    },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })

module.exports = mongoose.model("category", categoryModel);