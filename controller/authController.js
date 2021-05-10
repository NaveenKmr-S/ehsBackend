const userDb = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../helpers/mail");
require("dotenv").config();
const configs = require("../configs");
const client = require("twilio")(configs.accountSID, configs.authToken);
const crypto = require("crypto");

const saltRounds = 10;

exports.getUsers = (req, res, next) => {
  userDb
    .find(
      {},
      "_id firstname lastname emailid phonenumber address isAccountActive isActive"
    )
    .then((users) => {
      res.status(200).json({ message: "Successfully loaded!!!", users: users });
    })
    .catch((err) => {
      res.status(400).json({ error: `${err}` });
    });
};

exports.getUserById = (req, res, next) => {
  const authId = req.params.authId;

  try {
    userDb
      .findOne(
        { _id: authId },
        "_id firstname lastname emailid phonenumber address isAccountActive isActive"
      )
      .then((users) => {
        if (!users) res.status(404).json({ message: "user not found!!!" });
        res
          .status(200)
          .json({ message: "Successfully loaded!!!", users: users });
      })
      .catch((err) => {
        res.status(400).json({ error: `${err}` });
      });
  } catch (err) {
    res.status(400).json({ error: `${err}` });
  }
};

exports.checkIfUserExist = (req, res, next) => {
  const { emailid, phonenumber } = req.body;
  if (emailid) {
    userDb
      .findOne({ emailid })
      .then((userRes) => {
        if(userRes){ next();}
        else { res.json({ message: "User Not Found!!!" })}
      })
      .catch((err) => {
        res.json({ error: `${err}` });
      });
  } else if (phonenumber) {
    userDb
      .findOne({ phonenumber })
      .then((userRes) => {
        if(userRes){
           next();
        }else { 
          res.json({ message: "User Not Found!!!" })
        }
      })
      .catch((err) => {
        res.json({ error: `${err}` });
      });
  } else {
    console.log("No Details Provided");
  }
};

exports.checkAlreadyUserExist = (req, res, next) => {
  const { emailid, phonenumber } = req.body;
  if (emailid) {
    userDb
      .findOne({ emailid })
      .then((userRes) => {
        if (userRes) res.json({ message: "User Already Exists!!!" });
        else next();
      })
      .catch((err) => {
        res.json({ error: `${err}` });
      });
  } else if (phonenumber) {
    userDb
      .findOne({ phonenumber })
      .then((userRes) => {
        if (userRes) res.json({ message: "User Already Exists!!!" });
        else next();
      })
      .catch((err) => {
        res.json({ error: `${err}` });
      });
  } else {
    console.log("No Details Provided");
  }
};

exports.signup = async (req, res, next) => {
  const { emailid, phonenumber, password } = req.body;

  if (emailid) {
    let newUser =  new userDb(req.body);
    const token = await newUser.generateAuthToken();
    console.log("new usesr",newUser);
    res.cookie("jwt",token,{
      expires: new Date(Date.now()+ 1000000),
      httpOnly: true,
      //secure: true
    })
    newUser
      .save()
      .then((user) => {

        res.status(200).json({
          message: "Signup Successfull!!!"
        })
       /* console.log("user:::",user)


        let mailOptions = {
          from: "sqaud.hex@gmail.com",
          to: user.emailid,
          subject: "EHS prints",
          html: `<p>Your OTP is </p> <h3>${code}</h3>`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            res.json({
              message: "Please provide valid mail address",
              error: `${err}`,
            });
          } else {
            res.status(200).json({
              message: "Verification is sent!!",
              emailid: user.emailid,
              token: token,
            });
          }
        });*/
      })
      .catch((err) => {
        res.json({ error: `${err}` });
      });
    
  } else if(phonenumber) {
    let newUser = await new userDb(req.body);
    const token = await newUser.generateAuthToken();
    newUser
      .save()
      .then((user) => {
        res.status(200).json({
          message: "Signup Successfull!!!"
        })
        /*if (user.phonenumber) {
          client.verify
            .services(configs.serviceID)
            .verifications.create({
              to: `+91${user.phonenumber}`,
              channel: "sms",
            })
            .then((data) => {
              res.status(200).json({
                message: "Verification is sent!!",
                phonenumber: user.phonenumber,
                token: token,
              });
            });
        } else {
          res.status(400).send({
            message: "Wrong phone number :(",
            phonenumber: user.phonenumber,
          });
        }*/
      })
      .catch((err) => {
        res.json({ error: `${err}` });
      });
  } else {
    console.log("No Details Provided");
  }
};

exports.getOtp = (req,res,next) => {
    const {emailid, phonenumber} = req.body;
    console.log(req.body);
  if(emailid){
    var otp = Math.floor(100000 + Math.random() * 900000);
    const ttl      = 5 * 60 * 1000;
    const expires  = Date.now() + ttl; 
    const data     = `${emailid}.${otp}.${expires}`; 
    const hash     = crypto.createHmac("sha256",process.env.SECRET).update(data).digest("hex"); 
    const fullHash = `${hash}.${expires}`; 

    let mailOptions = {
      from: "laurence95@ethereal.email",
      to: emailid,
      subject: "EHS prints",
      html: `<p>Your OTP is </p> <h3>${otp}</h3>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        res.json({
          message: "Please provide valid mail address",
          error: `${err}`,
        });
      } else {
        res.status(200).json({
          message: "Verification is sent!!",
          emailid: emailid,
          hashcode: fullHash
        });
      }
    });
  }else if(phonenumber){
    client.verify
    .services(configs.serviceID)
    .verifications.create({
      to: `+91${phonenumber}`,
      channel: "sms",
    })
    .then((data) => {
      res.status(200).json({
        message: "Verification is sent!!",
        phonenumber: phonenumber,
      });
    });
  }else{
    console.log("No details provided!!")
  }
};

exports.activateAccount = (req, res, next) => {

  const {emailid,phonenumber, otp ,hash} = req.body;
    //console.log(req.body)
    if (emailid) {
      let [hashValue,expires] = hash.split(".");
      let now = Date.now();
      if(now>parseInt(expires)) return false;
      let data  = `${emailid}.${otp}.${expires}`;
      const newCalculatedHash = crypto.createHmac("sha256",process.env.SECRET).update(data).digest("hex");
      if(newCalculatedHash === hashValue){
        res.status(200).send({
          message: "OTP verified!!!"
        })
      } else{
        res.status(400).send({
          message: "Invalid OTP"
        })
      }
    } else if (phonenumber != 0) {
      if (phonenumber && otp.length === 6 ) {
        //console.log(phonenumber,otp)
        client.verify
          .services(configs.serviceID)
          .verificationChecks.create({
            to: `+91${phonenumber}`,
            code: otp,
          })
          .then((data) => {
            if (data.status === "approved") {
              res.status(200).send({
                message: "OTP verified!!!"
              })
          }}).catch(err=> {
            res.status(400).send({
              message: "Invalid OTP"
            })
          })
      } else {
        res.status(400).send({
          message: "Wrong phone number or otp :(",
          phonenumber: phonenumber,
        });
      }
    } else {
      console.log("No Details Provided");
    }
  };

exports.login = async (req, res, next) => {
  const { emailid, password, phonenumber } = req.body;
  if (emailid) {
   let userRes = await userDb
      .findOne({ emailid: emailid, isActive: true })
      .populate("cart.itemDetails", "_id name imgUrl originalPrice");
        if (!userRes) {
          res.json({ message: "Please enter valid credentials" });
        } else {
          const token  = jwt.sign({_id:userRes._id},process.env.SECRET, {expiresIn : 3600000});
          userRes.tokens = userRes.tokens.concat({token});
          await userDb.updateOne({emailid},{tokens: userRes.tokens});
          if (!userRes.isAccountActive) {
            res.json({ message: "Account is not activated!!!" });
          } else {
           
            bcrypt.compare(password, userRes.password, (err, isSame) => {
              if (!isSame) {
                res.json({ message: "Please enter valid credentials" });
              } else {
               
                res.cookie("jwt",token,{
                  expires: new Date(Date.now()+ 1000000),
                  //httpOnly: true,
                  //secure: true
                });
                
                res.status(200).json({
                  message: "Logged in successfully!!!",
                  token: token,
                  user: {
                    _id: userRes._id,
                    userid: userRes.userid,
                    name: userRes.name,
                    emailid: userRes.emailid,
                    cart: userRes.cart,
                    phonenumber: userRes.phonenumber,
                    address: userRes.address,
                    orders: userRes.orders,
                    isAdmin: userRes.isAdmin,
                  },
                });
              }
            });
          }
        }
  }
  else if (phonenumber) {
   let userRes = await userDb
      .findOne({ phonenumber: phonenumber, isActive: true }).populate("cart.itemDetails", "_id name imgUrl originalPrice");
        if (!userRes) {
          res.json({ message: "user not found!!!" });
        } else {
          const token  = jwt.sign({_id:userRes._id},process.env.SECRET, {expiresIn : 3600000});
          userRes.tokens = userRes.tokens.concat({token});
          await userDb.updateOne({phonenumber},{tokens: userRes.tokens});
          if (!userRes.isAccountActive) {
            res.json({ message: "Account is not activated!!!" });
          } else {
            bcrypt.compare(password, userRes.password, (err, isSame) => {
              if (!isSame) {
                res.json({ message: "password doesn't match!!!" });
              } else {
                res.cookie("jwt",token,{
                  expires: new Date(Date.now()+ 1000000),
                  //httpOnly: true,
                  //secure: true
                });
                res.status(200).json({
                  message: "Logged in successfully!!!",
                  token: token,
                  user: {
                    _id: userRes._id,
                    userid: userRes.userid,
                    firstname: userRes.firstname,
                    lastname: userRes.lastname,
                    emailid: userRes.emailid,
                    cart: userRes.cart,
                    phonenumber: userRes.phonenumber,
                    address: userRes.address,
                    orders: userRes.orders,
                    isAdmin: userRes.isAdmin,
                  },
                });
              }
            });
          }
        }
  }
  else {
    console.log("No Details Provided");
  }
  
};

exports.getUpdateUserDetails = (req, res, next) => {
  req.updateObj = {};

  const payload = req.body;
  const { emailid } = req.body;

  payload.firstname ? (req.updateObj.firstname = payload.firstname) : null;
  payload.lastname ? (req.updateObj.lastname = payload.lastname) : null;
  payload.phonenumber
    ? (req.updateObj.phonenumber = payload.phonenumber)
    : null;
  payload.address ? (req.updateObj.address = payload.address) : null;
  payload.isAccountActive
    ? (req.updateObj.isAccountActive = payload.isAccountActive)
    : null;
  payload.cart ? (req.updateObj.cart = payload.cart) : null;
  payload.wishList ? (req.updateObj.wishList = payload.wishList) : null;

  if (payload.oldpassword) {
    userDb
      .findOne({ emailid })
      .then((userRes) => {
        if (!userRes) {
          res.status(400).json({ message: "user not found" });
        } else {
          bcrypt.compare(
            payload.oldpassword,
            userRes.password,
            (err, isSame) => {
              if (!isSame) {
                res.status(400).json({ message: "password not match" });
              } else {
                bcrypt.hash(payload.password, saltRounds, (err, hash) => {
                  req.updateObj.password = hash;
                  next();
                });
              }
            }
          );
        }
      })
      .catch((err) => {
        res.status(400).json({ error: `${err}` });
      });
  } else {
    next();
  }
};

exports.updateUserDetails = async (req, res, next) => {
  const { emailid, phonenumber, address } = req.body;
  
  if (emailid) {
    try {
      let result = await userDb
        .updateOne({ emailid: emailid }, { address: address })
        .exec();
      res.status(200).json({ updated: true });
    } catch (err) {
      res.status(400).json({ updated: false, error: `${err}` });
    }
  } else if (phonenumber) {
    try {
      let result = await userDb
        .updateOne({ phonenumber: phonenumber }, { address: address })
        .exec();
      res.status(200).json({ updated: true });
    } catch (err) {
      res.status(400).json({ updated: false, error: `${err}` });
    }
  } else {
    console.log("No Details Provided");
  }
  
};

exports.resetPassword = async (req, res, next) => {
  var {emailid,phonenumber,password} = req.body;
  //console.log(req.body)
  if(emailid){
    const user = await userDb.findOne({emailid})
    if(!user){
      res.json({message: "You have not registered yet!!!"});
    }else{
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          console.log("Error hashing password for user",emailid);
        } else {
          console.log(user.password);
          userDb.updateOne({emailid},{password: hash}).exec();
          res.status(200).json({message: "Password Changed Successfully!!!"});
        }
      });
    }
  }else if(phonenumber){
    const user =await userDb.findOne({phonenumber})
    if(!user){
      res.json({message: "You have not registered yet!!!"});
    }else{
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          console.log("Error hashing password for user",phonenumber);
        } else {
          console.log(user.password);
          console.log(password)
          console.log(hash);
          userDb.updateOne({phonenumber},{password: hash}).exec();
          res.status(200).json({message: "Password Changed Successfully!!!"});
        }
      });
      
       
  }
}else {
  console.log("No Details Provided");
}
}
