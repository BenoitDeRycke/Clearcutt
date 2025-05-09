const crypto = require("crypto");

function determineRefundStatus(refunds = [], orderTotal = 0) {
  if (!Array.isArray(refunds) || refunds.length === 0) return "none";

  let totalRefunded = 0;
  refunds.forEach((refund) => {
    (refund.transactions?.edges || []).forEach((edge) => {
      const amount = parseFloat(edge.node.amount || "0");
      if (!isNaN(amount)) totalRefunded += amount;
    });
  });

  const totalPrice = parseFloat(orderTotal || "0");
  if (totalRefunded === 0) return "none";
  if (totalRefunded >= totalPrice * 0.99) return "full";
  return "partial";
}

function calculateRefundAmount(refunds = []) {
  let total = 0;
  refunds.forEach((refund) => {
    (refund.transactions?.edges || []).forEach((edge) => {
      const amount = parseFloat(edge.node.amount || "0");
      if (!isNaN(amount)) total += amount;
    });
  });
  return total;
}

function getDisputeAdjustment(disputes = []) {
  let totalRefund = 0;
  let totalProductCost = 0;

  disputes.forEach((dispute) => {
    if (dispute.finallyDeal !== 1) return;
    totalRefund += parseFloat(dispute.refundMoney || 0);

    (dispute.productInfoList || []).forEach((product) => {
      const unit = parseFloat(product.price || 0);
      const qty = parseInt(product.quantity || 1);
      totalProductCost += unit * qty;
    });
  });

  const shippingRefund = Math.max(0, totalRefund - totalProductCost);
  return { productRefund: totalProductCost, shippingRefund };
}

function calculateOrderTotals(
  revenue,
  cjOrder,
  vatRate,
  refundAmount = 0,
  isUnfulfilled = false,
  refunded = "none",
  disputes = []
) {
  const cjProduct = parseFloat(cjOrder?.product || 0);
  const cjShipping = parseFloat(cjOrder?.shipping || 0);
  const other = parseFloat(cjOrder?.other || 0);

  let product_cost = cjProduct;
  let shipping = cjShipping;
  let adjustedRevenue = Math.max(0, revenue - refundAmount);

  if (isUnfulfilled && refunded === "full") {
    adjustedRevenue = 0;
    product_cost = 0;
    shipping = 0;
  }

  if (refunded === "full" && disputes.length > 0) {
    const { productRefund, shippingRefund } = getDisputeAdjustment(disputes);
    product_cost = Math.max(0, cjProduct - productRefund);
    shipping = Math.max(0, cjShipping - shippingRefund);
  }

  const vat = adjustedRevenue * vatRate;
  const payment = adjustedRevenue * 0.03;
  const total_cost = product_cost + shipping + other + payment + vat;
  const profit = adjustedRevenue - total_cost;
  const margin = adjustedRevenue > 0 ? (profit / adjustedRevenue) * 100 : 0;

  return {
    revenue: adjustedRevenue,
    vat,
    product_cost,
    shipping,
    other,
    payment,
    total_cost,
    profit,
    margin,
  };
}

function mapOrderItems(order) {
  const items = [];

  (order.lineItems || []).forEach((item) => {
    const productTitle = item.product?.title || "";
    const variantTitle = item.variant?.title || "";
    const quantity = item.quantity ?? 0;

    const unitPrice = parseFloat(
      item.discountedUnitPriceSet?.shopMoney?.amount || "0"
    );

    const totalDiscount = (item.discountAllocations || []).reduce(
      (sum, alloc) => {
        return (
          sum + parseFloat(alloc.allocatedAmountSet?.shopMoney?.amount || "0")
        );
      },
      0
    );

    const discountPerUnit = quantity > 0 ? totalDiscount / quantity : 0;
    const finalUnitPrice = unitPrice - discountPerUnit;

    if (item.variant?.id && quantity > 0) {
      items.push({
        order_id: order.name,
        product_id: item.product?.id ?? "",
        variant_id: item.variant?.id ?? "",
        product_name: productTitle,
        variant_title: variantTitle,
        quantity,
        price: parseFloat(finalUnitPrice.toFixed(2)),
        logistics_source: "cj",
      });
    }
  });

  return items;
}

function mapRefundItems(order) {
  const refunds = [];

  (order.refunds || []).forEach((refund) => {
    const refundId = refund.id;

    (refund.refundLineItems?.edges || []).forEach((rEdge) => {
      const rItem = rEdge.node;
      const quantity = rItem.quantity;
      const variantId = rItem.lineItem?.variant?.id;
      const unitPrice = parseFloat(rItem.lineItem?.discountedUnitPrice || "0");
      const refundedAmount = unitPrice * quantity;

      if (variantId && quantity) {
        refunds.push({
          order_id: order.name,
          variant_id: variantId,
          quantity,
          refunded_amount: refundedAmount,
          refund_id: refundId,
        });
      }
    });
  });

  return refunds;
}

function determineSources(order, knownSources = {}) {
  const orderNumber = order.name.replace(/^#/, "").trim();
  const isShopify = true;

  return {
    platform_source: isShopify ? "shopify" : "unknown",
  };
}

function deduplicateOrderItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.order_id}-${item.variant_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = {
  determineRefundStatus,
  calculateRefundAmount,
  getDisputeAdjustment,
  calculateOrderTotals,
  mapOrderItems,
  mapRefundItems,
  determineSources,
  deduplicateOrderItems,
};
