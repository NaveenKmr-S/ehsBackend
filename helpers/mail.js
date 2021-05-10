const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'laurence95@ethereal.email',
      pass: 'vkEq1fGvGzWZYvhAEb'
  }
});

module.exports = transporter;



/*

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
      }*/