const express = require("express");
const router = express.Router();
const { syncOrders, syncProducts } = require("../controllers/syncController");

router.get("/sync-orders", syncOrders);

router.get("/sync-products", syncProducts);

module.exports = router;
