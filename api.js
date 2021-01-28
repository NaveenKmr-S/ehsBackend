require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const poster = require("./routes/poster");
const material = require("./routes/material");
const category = require("./routes/category");
const subCategory = require("./routes/subCategory");
const auth = require("./routes/auth");
const orders = require("./routes/orders");
const cors = require("cors");
const helmet = require("helmet");
const shortid = require("shortid");
const Razorpay = require("razorpay");

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use(cors());
app.use(helmet());

const razorpay = new Razorpay({
  key_id: "rzp_test_FvIgaLsvcCd3vG",
  key_secret: "90FggbRBO4DxerTJnvxqEhI4",
});

app.post("/verification", (req, res) => {
  // do a validation
  const secret = "NaveenKmr";

  console.log(req.body);

  const crypto = require("crypto");

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  // console.log(digest, req.headers["x-razorpay-signature"]);

  if (digest === req.headers["x-razorpay-signature"]) {
    // process it

    console.log("request is legit");
    console.log(req.body);
    // require("fs").writeFileSync(
    //   "payment1.json",
    //   JSON.stringify(req.body, null, 4)
    // );
  } else {
    // pass it
    req.json({ status: "failed", message: req.body });
  }
  res.json({ status: "ok" });
});

app.post("/razorpay", async (req, res) => {
  const payment_capture = 1;
  const amount = req.body.amount;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount / 100,
    });
  } catch (error) {
    console.log(error);
  }
});

app.use("/assets/uploads", express.static(__dirname + "/assets/uploads"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "x-www-form-urlencoded, Origin, X-Requested-With, Content-Type, Accept, Authorization, *"
  );
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "GET, PUT, POST, PATCH, DELETE, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    return res.status(200).json({});
  }
  next();
});

app.use("/posters", poster);
app.use("/material", material);
app.use("/category", category);
app.use("/subCategory", subCategory);
app.use("/auth", auth);
app.use("/orders", orders);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "hellooo!!!",
    url: `${req.protocol}://${req.get("host")}`,
  });
});

mongoose
  .connect(
    "mongodb+srv://Naveen:ehs@cluster0.6g1vh.mongodb.net/ehsdb?retryWrites=true&w=majority",
    //     "mongodb+srv://balu:mongopassword@cluster0.6ujrr.mongodb.net/example?retryWrites=true&w=majority"
    // ,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(process.env.PORT || 8080, () =>
      console.log("Server started!!!")
    );
  })
  .catch((err) => {
    console.log(err);
  });
