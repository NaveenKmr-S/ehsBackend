const { json } = require("body-parser");
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const ordersModel = new schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    emailid: {
      type: String,
    },
    phonenumber: {
      type: String,
    },
    itemDetails: {
      type: [
        {
          imgUrl: {
            type: String,
          },
          name: {
            type: String,
          },
          originalPrice: {
            type: String,
          },
          link: {
            type: String,
          },
          quantity: {
            type: Number,
          },
          Material: {
            one: {
              type: Boolean,
            },
            two: {
              type: Boolean,
            },
            three: {
              type: Boolean,
            },
          },
          Dimension: {
            one: {
              type: Boolean,
            },
            two: {
              type: Boolean,
            },
            three: {
              type: Boolean,
            },
          },
        },
      ],
    },
    total: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("Orders", ordersModel);