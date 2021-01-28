const express = require("express");
const orders = require("../controller/ordersController");
const router = express.Router();
const verifyJwt = require("../middleware/jwt");

router.get("/getOrders", orders.getOrders);

router.get("/getOrdersById", orders.getOrdersById);

router.post("/createOrder", orders.createOrders);

router.post("/updateOrder", orders.updateOrders);

router.post("/deleteOrder", orders.deleteOrders);

module.exports = router;
