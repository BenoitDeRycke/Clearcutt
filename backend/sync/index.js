const shopify = require("../shopify/shopify");
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getCOGS } = require("../cj/cogs");

router.get("/sync-orders", async (req, res) => {
  try {
    const shopifyRes = await shopify.get("orders.json?status=any&limit=10");
    const shopifyOrders = shopifyRes.data.orders;

    const enrichedOrders = [];

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const order of shopifyOrders) {
      try {
        const orderNumber = order.name.replace("#", "").trim();
        const cogs = await getCOGS(orderNumber);
        const revenue = parseFloat(order.total_price || "0");

        const VAT_RATES = {
          BE: 0.21,
          DE: 0.19,
          FR: 0.2,
          NL: 0.21,
          IT: 0.22,
          ES: 0.21,
          IE: 0.23,
          FI: 0.24,
          SE: 0.25,
          AT: 0.2,
          PT: 0.23,
          GR: 0.24,
          PL: 0.23,
          CZ: 0.21,
          SK: 0.2,
          HU: 0.27,
          RO: 0.19,
          BG: 0.2,
          HR: 0.25,
          SI: 0.22,
          LT: 0.21,
          LV: 0.21,
          EE: 0.2,
          LU: 0.17,
          CY: 0.19,
          MT: 0.18,
        };

        const countryCode = order.shipping_address?.country_code || "—";
        const vatRate = VAT_RATES[countryCode] || 0;
        const vat = (revenue * vatRate).toFixed(2);

        enrichedOrders.push({
          id: order.name,
          date: new Date(order.created_at).toISOString().split("T")[0],
          country: countryCode,
          revenue,
          vat,
          productCost: cogs?.product || 0,
          shipping: cogs?.shipping || 0,
          fees: cogs?.fees || 0,
          totalCost: cogs?.CJtotal || 0,
          profit: +(revenue - (cogs?.CJtotal || 0)).toFixed(2),
          margin:
            revenue > 0
              ? `${(((revenue - cogs?.CJtotal) / revenue) * 100).toFixed(1)}%`
              : "0%",
        });

        console.log(`⏳ Waiting 1s before next order...`);
        await sleep(1000);
      } catch (err) {
        console.log(`❌ Failed to sync order ${order.name}:`, err.message);
        console.error(err);
      }
    }
    console.log(`✅ Waiting 1s before next order...`);
    res.json(enrichedOrders); // ✅ Only send response once
  } catch (error) {
    console.error("❌ Sync error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to sync orders" });
    }
  }
});

module.exports = router;
