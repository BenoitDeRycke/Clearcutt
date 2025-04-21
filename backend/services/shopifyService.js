const shopify = require("../api/shopify");

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

  const response = await shopify.post("", { query, variables });

  const data = response.data?.data?.orders;
  if (!data) throw new Error("Invalid Shopify API response");

  const orders = data.edges.map((edge) => edge.node);
  const pageInfo = data.pageInfo;

  return { orders, pageInfo };
};

const fetchShopifyOrders = async () => {
  let allOrders = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    console.log("📦 Fetching next set of orders...");
    const { orders, pageInfo } = await fetchOrders(cursor);
    allOrders = [...allOrders, ...orders];
    cursor = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;
  }

  console.log(`✅ Fetched total ${allOrders.length} orders`);
  return allOrders;
};

module.exports = { fetchOrders, fetchShopifyOrders };
