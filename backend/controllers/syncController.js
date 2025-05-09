const { fetchCjOrders, fetchCjDisputes } = require("../services/cjService");
const {
  fetchShopifyOrders,
  fetchShopifyProducts,
} = require("../services/shopifyService");
const supabase = require("../api/supabaseClient");
const {
  determineRefundStatus,
  calculateOrderTotals,
  mapOrderItems,
  mapRefundItems,
  calculateRefundAmount,
  determineSources,
  deduplicateOrderItems,
} = require("../services/utils");

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
    const [shopifyOrders, cjOrders, disputes] = await Promise.all([
      fetchShopifyOrders(),
      fetchCjOrders(),
      fetchCjDisputes(),
    ]);

    if (!shopifyOrders.length || !cjOrders.length) {
      return res.status(500).json({ error: "Missing Shopify or CJ orders" });
    }

    const cjMap = new Map();
    cjOrders.forEach((cj) => {
      const orderNum = (cj.orderNum || "").replace(/^#/, "").trim();
      if (!orderNum) return;
      const product = parseFloat(cj.productAmount) || 0;
      const shipping = parseFloat(cj.postageAmount) || 0;
      const total = parseFloat(cj.orderAmount) || 0;
      const other = total - product - shipping;
      cjMap.set(orderNum, { product, shipping, other, total });
    });

    const disputesByOrder = new Map();
    disputes.forEach((dispute) => {
      const orderNum = dispute.orderNumber?.replace(/^#/, "").trim();
      if (!orderNum) return;
      if (!disputesByOrder.has(orderNum)) disputesByOrder.set(orderNum, []);
      disputesByOrder.get(orderNum).push(dispute);
    });

    const enrichedOrders = [];
    const orderItems = [];
    const refundRows = [];

    for (const order of shopifyOrders) {
      try {
        const orderNumber = order.name.replace(/^#/, "").trim();
        const cjOrder = cjMap.get(orderNumber);
        const country_code = order.shippingAddress?.countryCode || "—";
        const vatRate = VAT_RATES[country_code] || 0;

        const refunded = determineRefundStatus(order.refunds, order.totalPrice);
        const rawRevenue = parseFloat(order.totalPrice || 0);
        const refundAmount =
          refunded === "partial" ? calculateRefundAmount(order.refunds) : 0;
        const relevantDisputes = disputesByOrder.get(orderNumber) || [];
        const isUnfulfilled =
          !order.fulfillments || order.fulfillments.length === 0;

        const totals = calculateOrderTotals(
          rawRevenue,
          cjOrder,
          vatRate,
          refundAmount,
          isUnfulfilled,
          refunded,
          relevantDisputes
        );

        const { platform_source } = determineSources(order);

        const orderRow = {
          id: order.name,
          date: new Date(order.createdAt)
            .toISOString()
            .replace("T", " ")
            .substring(0, 19),
          country_code,
          refunded,
          platform_source,
          ...totals,
        };
        if (order.name === "#2154") {
          console.log("🧾 Full Shopify Order #2154:");
          console.dir(order, { depth: null });
        }
        enrichedOrders.push(orderRow);
        orderItems.push(...mapOrderItems(order));
        refundRows.push(...mapRefundItems(order));
      } catch (err) {
        console.error(`❌ Failed to process order ${order.name}:`, err.message);
      }
    }

    const { error } = await supabase.from("orders").upsert(enrichedOrders, {
      onConflict: "id",
      returning: "representation",
    });

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return res.status(500).json({ error });
    } else {
      console.log(`✅ Upserted ${enrichedOrders.length} orders`);
    }

    try {
      if (orderItems.length > 0) {
        const dedupedOrderItems = deduplicateOrderItems(orderItems);

        const { error } = await supabase
          .from("order_items")
          .upsert(dedupedOrderItems, {
            onConflict: "order_id,variant_id",
          });

        if (error)
          console.error("❌ Supabase upsert order_items failed:", error);
        else console.log(`✅ Upserted ${dedupedOrderItems.length} order items`);
      }

      if (refundRows.length > 0) {
        const { error } = await supabase
          .from("order_refund")
          .upsert(refundRows, {
            onConflict: ["refund_id", "variant_id"],
          });
        if (error)
          console.error("❌ Supabase upsert refundRows failed:", error);
        else console.log(`✅ Upserted ${refundRows.length} refund rows`);
      }
    } catch (err) {
      console.error("❌ Crash during item/refund upserts:", err);
    }

    res
      .status(200)
      .json({ message: "Sync complete", count: enrichedOrders.length });
  } catch (err) {
    console.error("❌ Sync error:", err.message);
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

    res.status(200).json({ message: "Sync complete", count: products.length });
  } catch (err) {
    res.status(500).json({ error: "Unexpected error" });
  }
};

module.exports = { syncOrders, syncProducts };
