const express = require("express");
const fetch = require("node-fetch");
const ordersRouter = require("../shopify/orders");
const { getCOGS } = require("../cj/cogs");

const router = express.Router();

router.use("/api/shopify", ordersRouter); // Correct route for Shopify orders

// Sync orders from the '/api/shopify/orders' endpoint
router.get("/sync-orders", async (req, res) => {
  try {
    console.log("Fetching orders from /api/shopify/orders...");

    // Fetch orders from the /shopify/orders endpoint
    const response = await fetch("http://localhost:3001/api/shopify/orders");

    if (!response.ok) {
      console.log(
        "Failed response from /api/shopify/orders:",
        response.statusText
      );
      throw new Error("Failed to fetch orders from Shopify");
    }

    const allOrders = await response.json();
    console.log("Fetched orders from /api/shopify/orders:", allOrders);

    if (!allOrders || allOrders.length === 0) {
      return res
        .status(500)
        .json({ error: "No orders fetched or invalid data" });
    }

    const enrichedOrders = [];
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

    // Process the fetched orders
    for (const order of allOrders) {
      try {
        const orderNumber = order.name.replace("#", "").trim();
        const cogs = await getCOGS(orderNumber);
        const revenue = parseFloat(order.totalPrice || "0");
        const countryCode = order.shippingAddress?.countryCode || "—";
        const vatRate = VAT_RATES[countryCode] || 0;
        const vat = revenue * vatRate;
        const payment = revenue * 0.03 || 0;
        const totalCost = (cogs?.CJtotal || 0) + payment;

        enrichedOrders.push({
          id: order.name,
          date: new Date(order.createdAt).toISOString().split("T")[0],
          country: countryCode,
          revenue,
          vat,
          productCost: cogs?.product || 0,
          shipping: cogs?.shipping || 0,
          other: cogs?.other || 0,
          payment,
          totalCost: totalCost,
          profit: revenue - totalCost,
          margin:
            revenue > 0
              ? `${(((revenue - (cogs?.CJtotal || 0)) / revenue) * 100).toFixed(
                  2
                )}%`
              : "0%",
        });
      } catch (err) {
        console.log(`❌ Failed to process order ${order.name}:`, err.message);
        console.error(err);
      }
    }

    res.json(enrichedOrders);
  } catch (error) {
    console.error("Sync error:", error.message);
    res.status(500).json({ error: "Failed to sync orders" });
  }
});

module.exports = router;
