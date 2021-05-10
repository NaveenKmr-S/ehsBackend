const ordersDb = require("../model/ordersModel");
const transporter = require("../helpers/mail");

exports.getOrders = (req, res, next) => {
  ordersDb
    .find({ isActive: true })
    .populate("userId", "emailid")
    .populate("material", "title imgUrl")
    .populate("dimension", "title imgUrl")
    .populate("itemDetails", "_id name imgUrl originalPrice creator")
    .then((orders) => {
      res
        .status(200)
        .json({ message: "Orders fetched successfully!!!", orders: orders });
    })
    .catch((err) => {
      res.status(400).json({ error: `${err}` });
    });
};

exports.getOrdersById = (req, res, next) => {
  let email = req.body.emailid;
  let phonenumber = req.body;
  if (email) {
    ordersDb
      .find({ isActive: true })
      .populate("userId", "emailid phonenumber")
      .populate("material", "title imgUrl")
      .populate("dimension", "title imgUrl")
      .populate("itemDetails", "_id name imgUrl originalPrice creator")
      .then((orders) => {
        if (!orders) res.status(404).json({ message: "no Orders Yet!!!" });
        else {
          try {
            let orders2 = orders.filter((v) => {
              console.log(email);
              console.log(v);
              return v.emailid.toLowerCase() == email.toLowerCase();
            });
            res.status(200).json({
              message: "Orders fetched successfully!!!",
              orders: orders2,
            });
          } catch (e) {}
        }
      })
      .catch((err) => {
        res.status(400).json({ error: `${err}` });
      });
  }
  else if (phonenumber) {
    ordersDb
      .find({ isActive: true })
      .populate("userId", "emailid phonenumber")
      .populate("material", "title imgUrl")
      .populate("dimension", "title imgUrl")
      .populate("itemDetails", "_id name imgUrl originalPrice creator")
      .then((orders) => {
        if (!orders) res.status(404).json({ message: "no Orders Yet!!!" });
        else {
          try {
            let orders2 = orders.filter((v) => {
              return v.phonenumber == phonenumber;
            });
            res.status(200).json({
              message: "Orders fetched successfully!!!",
              orders: orders2,
            });
          } catch (e) {}
        }
      })
      .catch((err) => {
        res.status(400).json({ error: `${err}` });
      });
  }
  else {
    console.log("Error");
  }
};

exports.createOrders = async (req, res, next) => {
  const {
    userId,
    emailid,
    phonenumber,
    itemDetails,
    total,
    paymentId,
    orderId,
    address,
    status,
  } = req.body;

  let newOrder = await new ordersDb({
    userId,
    emailid,
    phonenumber,
    itemDetails,
    total,
    paymentId,
    orderId,
    address,
    status,
  });

  newOrder.save().then((order) => {
    if (order) {
      console.log(order);
      let mailOptions = {
        from: "sqaud.hex@gmail.com",
        to: "naveen29121999@gmail.com",
        // to: "sales@ehsprints.com",
        subject: "Order Placed",
        html: `<div><p>Order Placed By: ${order.emailid
         // order?.emailid || order?.phonenumber
        } on ${order.created_at}</p><br/><p>Order id: ${
          order.orderId
        }</p><br/><p>Payment id: ${order.paymentId}</p><br/><p>Address: ${
          order.address
        }</p></div>`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          res.json({
            message: "Please provide valid mail address",
            error: `${err}`,
          });
        } else {
          console.log("Email sent!!!");
          res.status(200).json({
            message: "mail sent",
          });
        }
      });

      res.status(200).json({
        message: "Order placed Successfully",
        order: order,
      });
    } else {
      res.status(400).json({ error: `${err}` });
    }
  });
};

exports.updateOrders = async (req, res, next) => {
  const { orderId, status } = req.body;

  try {
    let result = await ordersDb.updateOne({ _id: orderId }, { status }).exec();
    res.status(200).json({ status_Updated: status });
  } catch (err) {
    res.status(400).json({ error: `${err}` });
  }
};

exports.deleteOrders = async (req, res, next) => {
  let { orderId } = req.body;

  try {
    let result = await ordersDb
      .updateOne({ _id: orderId }, { isActive: false })
      .exec();
    res.json({ cancelled: true, message: "order Cancelled Successfully :(" });
  } catch (err) {
    res.status(400).json({ error: `${err}` });
  }
};
