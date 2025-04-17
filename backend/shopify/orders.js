const express = require("express");
const router = express.Router();
const shopify = require("./shopify");

// Function to fetch all orders with pagination
const fetchOrders = async (cursor = null) => {
  const query = `
    query($cursor: String) {
      orders(first: 50, sortKey: CREATED_AT, reverse: true, after: $cursor) {
        edges {
          node {
            id
            name
            createdAt
            totalPrice
            shippingAddress {
              countryCode
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const variables = { cursor };

  try {
    console.log("Making request to Shopify API...");
    const response = await shopify.post("", { query, variables });

    console.log("Response data received from Shopify:", response.data);

    if (!response.data || !response.data.data.orders) {
      console.error("Invalid response structure:", response.data);
      throw new Error("Invalid response structure from Shopify API");
    }

    const orders = response.data.data.orders.edges;
    const pageInfo = response.data.data.orders.pageInfo;

    return { orders, pageInfo };
  } catch (error) {
    console.error("Error fetching orders from Shopify:", error.message);
    throw error;
  }
};

// Endpoint to get orders with pagination
router.get("/orders", async (req, res) => {
  try {
    let allOrders = [];
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
      console.log("Fetching next set of orders...");
      const { orders, pageInfo } = await fetchOrders(cursor);

      if (!orders || !orders.length) {
        console.error("No orders fetched or invalid data");
        return res
          .status(500)
          .json({ error: "No orders fetched or invalid data" });
      }

      console.log("Fetched", orders.length, "orders");
      allOrders = [...allOrders, ...orders];

      hasNextPage = pageInfo.hasNextPage;
      cursor = pageInfo.endCursor;
    }

    console.log("Total orders fetched:", allOrders.length);
    res.json(allOrders.map((edge) => edge.node)); // Return only the order nodes
  } catch (error) {
    console.error("Error in /orders route:", error.message);
    res.status(500).json({ error: "Failed to fetch Shopify orders" });
  }
});

module.exports = router;
