const { fetchCjOrders } = require("../services/cjService");
const {
  fetchShopifyOrders,
  fetchShopifyProducts,
} = require("../services/shopifyService");
const supabase = require("../api/supabaseClient");

const VAT_RATES = {
  BE: 0.21,
  DE: 0.19,
  FR: 0.2,
  NL: 0.21,
  IT: 0.22,
  ES: 0.21,
  AT: 0.2,
  PT: 0.23,
  IE: 0.23,
  FI: 0.24,
  SE: 0.25,
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

const syncOrders = async (req, res) => {
  console.log("⚡️ /sync-orders called");

  try {
    const shopifyOrders = await fetchShopifyOrders();
    const cjOrders = await fetchCjOrders();

    if (!cjOrders || !cjOrders.length) {
      console.error("❌ Missing or invalid CJ orders:", cjOrders);
      return res.status(500).json({ error: "Missing CJ orders" });
    }

    if (!shopifyOrders.length) {
      return res.status(500).json({ error: "Missing Shopify orders" });
    }
    if (!cjOrders.length) {
      return res.status(500).json({ error: "Missing Cj orders" });
    }

    const cjMap = new Map();

    for (const cj of cjOrders) {
      const orderNum = (cj.orderNum || "").replace(/^#/, "").trim();
      if (!orderNum) continue;

      const product = parseFloat(cj.productAmount) || 0;
      const shipping = parseFloat(cj.postageAmount) || 0;
      const total = parseFloat(cj.orderAmount) || 0;
      const other = total - product - shipping;

      cjMap.set(orderNum, {
        product,
        shipping,
        other,
        total,
      });
    }
    const enrichedOrders = [];
    const orderItems = [];

    for (const order of shopifyOrders) {
      try {
        const orderNumber = order.name.replace("#", "").trim();
        const cjOrder = cjMap.get(orderNumber);
        const date = new Date(order.createdAt)
          .toISOString()
          .replace("T", " ")
          .substring(0, 19);
        const country_code = order.shippingAddress?.countryCode || "—";
        const revenue = parseFloat(order.totalPrice || 0);
        const vat = revenue * (VAT_RATES[country_code] || 0);
        const product_cost = parseFloat(cjOrder?.product || 0);
        const shipping = parseFloat(cjOrder?.shipping || 0);
        const other = parseFloat(cjOrder?.other || 0);
        const payment = revenue * 0.03 || 0;
        const total_cost = (cjOrder?.total || 0) + payment + vat;
        const profit = revenue - total_cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        enrichedOrders.push({
          id: order.name,
          date,
          country_code,
          revenue,
          vat,
          product_cost,
          shipping,
          other,
          payment,
          total_cost,
          profit,
          margin,
        });
        for (const item of order.lineItems || []) {
          const price = parseFloat(item.discountedUnitPrice || "0");
          const quantity = item.quantity ?? 1;

          const productId = item.product?.id ?? "";
          const variantId = item.variant?.id ?? "";
          const productTitle = item.product?.title ?? "";
          const variantTitle = item.variant?.title ?? "";

          orderItems.push({
            order_id: order.name,
            product_id: productId,
            variant_id: variantId,
            product_name: productTitle,
            variant_title: variantTitle,
            quantity,
            price,
          });
        }
      } catch (err) {
        console.error(`❌ Failed to process order ${order.name}:`, err.message);
      }
    }
    console.log(`✅ Processed orders ${enrichedOrders.length}`);
    console.log("🔍 Total order items to insert:", orderItems.length);
    const { error } = await supabase
      .from("orders")
      .upsert(enrichedOrders, { onConflict: "id", returning: "minimal" });
    try {
      if (orderItems.length > 0) {
        const { error } = await supabase.from("order_items").insert(orderItems);
        if (error) {
          console.error("❌ Supabase insert failed:", error);
        } else {
          console.log(`✅ Inserted ${orderItems.length} order items`);
        }
      } else {
        console.log("⚠️ No order items found to insert.");
      }
    } catch (err) {
      console.error("❌ Crash inserting order_items:", err);
    }

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res
      .status(200)
      .json({ message: "Sync complete", count: enrichedOrders.length });
  } catch (err) {
    console.error("Sync error:", err.message);
    res.status(500).json({ error: "Failed to sync orders" });
  }
};

const syncProducts = async (req, res) => {
  try {
    const products = await fetchShopifyProducts();

    if (products.length === 0) {
      console.warn("⚠️ No products found to sync.");
      return res.status(200).json({ message: "No products found", count: 0 });
    }

    const { error } = await supabase
      .from("products")
      .upsert(products, { onConflict: "variant_id", returning: "minimal" });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res
      .status(200)
      .json({ message: "Sync complete", count: products.length });
  } catch (err) {
    return res.status(500).json({ error: "Unexpected error" });
  }
};

module.exports = { syncOrders, syncProducts };
