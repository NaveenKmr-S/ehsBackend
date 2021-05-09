const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userschema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    emailid: {
      type: String,
    },
    password: {
      type: String,
    },
    phonenumber: {
      type: String,
    },
    address: {
      type: String,
    },
    isAccountActive: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    orders: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Orders",
        },
      ],
    },
    wishList: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PosterModel",
        },
      ],
    },
    cart: {
      type: [
        {
          itemDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PosterModel",
          },
          material: {
            type: String,
          },
          dimension: {
            type: String,
          },
          quantity: {
            type: Number,
          },
          total: {
            type: String,
          },
        },
      ],
    },
    tokens: [{
      token: {
        type: String,
        required: true
      }
    }]
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

userschema.methods.generateAuthToken = async function(){
  try{
    const token  = jwt.sign({_id:this._id.toString()},process.env.SECRET, {expiresIn : 3600000});
    this.tokens = this.tokens.concat({token});
    await this.save();
    return token;
  }catch(err){
    res.send(err);
  }
};

userschema.pre("save", function (next) {
  const user = this;
  if (!user.isModified ) {
    // don't rehash if it's an old user
    next();
  } else {
    if(user.password.isModified){
      console.log("user ,pre saving " + user.emailid, user.phonenumber, user.password);
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
      if (err) {
        console.log("Error hashing password for user", user.emailid);
        next(err);
      } else {
        user.password = hash;
        next();
      }
    });
    }
  }
});

module.exports = mongoose.model("User", userschema);
