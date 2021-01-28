const userDb = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../helpers/mail");
require("dotenv").config();
const configs = require("../configs");
const client = require("twilio")(configs.accountSID, configs.authToken);

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
    let newUser = await new userDb({
      emailid,
      password,
    });
    var code = Math.floor(1000 + Math.random() * 9000);

    newUser
      .save()
      .then((user) => {
        const token = jwt.sign(
          {
            emailid: user.emailid,
            userid: user._id,
            code: code,
            phonenumber: 0,
          },
          "NaveenKumar",
          { expiresIn: 3000 }
        );

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
        });
      })
      .catch((err) => {
        res.json({ error: `${err}` });
      });
  } else if (phonenumber) {
    let newUser = await new userDb({
      phonenumber,
      password,
    });

    newUser
      .save()
      .then((user) => {
        const token = jwt.sign(
          { phonenumber: user.phonenumber, userid: user._id, emailid: 0 },
          "NaveenKumar",
          { expiresIn: 3000 }
        );

        if (user.phonenumber) {
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
        }
      })
      .catch((err) => {
        res.json({ error: `${err}` });
      });
  } else {
    console.log("No Details Provided");
  }
};

exports.activateAccount = (req, res, next) => {

  const { code ,token} = req.params;
  

  let deauthtoken;
  try {
    deauthtoken = jwt.verify(token, "NaveenKumar");
  } catch (err) {}

  if (!deauthtoken) {
    res.json({ message: "invalid token!!!" });
  }
  try {
    let emailid = deauthtoken.emailid;
    let phonenumber = deauthtoken.phonenumber;
    let userid = deauthtoken.userid;
    let code1 = deauthtoken.code;

    if (emailid != 0) {
      if (code1 == code) {
        userDb
          .findOne({ _id: userid })
          .then((users) => {
            if (!users) res.json({ message: "user not found!!!" });
            else {
              if (users.isAccountActive)
                res.json({ message: "User Already Activated!!!" });
              else {
                users.isAccountActive = true;
                users.save((err) => {
                  if (err) {
                    res.json({ error: `${err}` });
                  } else {
                    res.status(200).json({ message: "Account activated" });
                  }
                });
              }
            }
          })
          .catch((err) => {
            res.json({ error: `${err}` });
          });
      } else {
        res.json({ error: "Please Enter Valid OTP" });
      }
    } else if (phonenumber != 0) {
      if (phonenumber && code.length === 4) {
        client.verify
          .services(configs.serviceID)
          .verificationChecks.create({
            to: `+91${phonenumber}`,
            code: code,
          })
          .then((data) => {
            if (data.status === "approved") {
              userDb
                .findOne({ _id: userid })
                .then((users) => {
                  if (!users)
                    res.status(404).json({ message: "user not found!!!" });
                  else {
                    if (users.isAccountActive)
                      res
                        .status(404)
                        .json({ message: "User Already Activated!!!" });
                    else {
                      users.isAccountActive = true;
                      users.save((err) => {
                        if (err) {
                          res.status(400).json({ error: `${err}` });
                        } else {
                          res
                            .status(200)
                            .json({ message: "Account activated" });
                        }
                      });
                    }
                  }
                })
                .catch((err) => {
                  res.json({ error: `${err}` });
                });
            }
          });
      } else {
        res.status(400).send({
          message: "Wrong phone number or code :(",
          phonenumber: phonenumber,
        });
      }
    } else {
      console.log("No Details Provided");
    }
  } catch (e) {}
};

// exports.login = (req, res, next) => {
//   const { emailid, password } = req.body;
//   userDb
//     .findOne({ emailid: emailid, isActive: true })
//     .populate("cart.itemDetails", "_id name imgUrl originalPrice")
//     .then((userRes) => {
//       if (!userRes) {
//         res.json({ message: "user not found!!!" });
//       } else {
//         bcrypt.compare(password, userRes.password, (err, isSame) => {
//           if (!isSame) {
//             res.json({ message: "Password doesn't match!!!" });
//           } else {
//             const token = jwt.sign(
//               { emailid: userRes.emailid, userid: userRes._id },
//               `${process.env.SECRET}` || "NaveenKmrBala",
//               { expiresIn: 86400 }
//             );

//             res.status(200).json({
//               message: "Logged in successfully!!!",
//               token: token,
//               user: {
//                 userid: userRes.userid,
//                 firstname: userRes.firstname,
//                 lastname: userRes.lastname,
//                 emailid: userRes.emailid,
//                 cart: userRes.cart,
//                 phonenumber: userRes.phonenumber,
//                 address: userRes.address,
//                 orders: userRes.orders,
//               },
//             });
//           }
//         });
//       }
//     })
//     .catch((err) => {
//       res.status(400).json({ error: `${err}` });
//     });
// };

exports.login = (req, res, next) => {
  const { emailid, password, phonenumber } = req.body;


  if (emailid) {
    userDb
      .findOne({ emailid: emailid, isActive: true })
      .populate("cart.itemDetails", "_id name imgUrl originalPrice")
      .then((userRes) => {
        if (!userRes) {
          res.json({ message: "user not found!!!" });
        } else {
          if (!userRes.isAccountActive) {
            res.json({ message: "Account is not activated!!!" });
          } else {
            bcrypt.compare(password, userRes.password, (err, isSame) => {
              if (!isSame) {
                res.json({ message: "password doesn't match!!!" });
              } else {
                const token = jwt.sign(
                  { emailid: userRes.emailid, userid: userRes._id },
                  `${process.env.SECRET}` || "NaveenKmrBala",
                  { expiresIn: 86400 }
                );

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
      })
      .catch((err) => {
        res.status(400).json({ error: `${err}` });
      });
  }
  else if (phonenumber) {
    userDb
      .findOne({ phonenumber: phonenumber, isActive: true })
      .populate("cart.itemDetails", "_id name imgUrl originalPrice")
      .then((userRes) => {
        if (!userRes) {
          res.json({ message: "user not found!!!" });
        } else {
          if (!userRes.isAccountActive) {
            res.json({ message: "Account is not activated!!!" });
          } else {
            bcrypt.compare(password, userRes.password, (err, isSame) => {
              if (!isSame) {
                res.json({ message: "password doesn't match!!!" });
              } else {
                const token = jwt.sign(
                  { phonenumber: userRes.phonenumber, userid: userRes._id },
                  `${process.env.SECRET}` || "NaveenKmrBala",
                  { expiresIn: 86400 }
                );

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
      })
      .catch((err) => {
        res.status(400).json({ error: `${err}` });
      });
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
