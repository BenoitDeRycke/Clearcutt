// backend/shopify/orders.js
const express = require("express");
const router = express.Router();
const shopify = require("./shopify");

router.get("/orders", async (req, res) => {
  try {
    const response = await shopify.get("orders.json?status=any&limit=10");
    res.json(response.data.orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: "Failed to fetch Shopify orders" });
  }
});

module.exports = router;
