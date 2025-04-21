const express = require("express");
const router = express.Router();
const { syncOrders } = require("../controllers/syncController");

router.get("/sync-orders", syncOrders);

module.exports = router;
