const shopify = require("../api/shopify");

const fetchOrders = async (cursor = null) => {
  const query = `
  query($cursor: String) {
    orders(first: 25, sortKey: CREATED_AT, reverse: true, after: $cursor) {
      edges {
        node {
          id
          name
          createdAt
          totalPrice
          fulfillments {
            id
          }
          shippingAddress {
            countryCode
          }
          lineItems(first: 50) {
  edges {
    node {
      id
      quantity
      discountedUnitPriceSet {
        shopMoney {
          amount
        }
      }
      discountAllocations {
        allocatedAmountSet {
          shopMoney {
            amount
          }
        }
      }
      product {
        id
        title
      }
      variant {
        id
        title
      }
    }
  }
}
          refunds {
            id
            transactions(first: 25) {
              edges {
                node {
                  amount
                }
              }
            }
            refundLineItems(first: 25) {
              edges {
                node {
                  quantity
                  lineItem {
                    variant {
                      id
                    }
                  }
                }
              }
            }
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

  // 🔍 Add this logging block
  if (response.data?.errors) {
    console.error("❌ Shopify GraphQL errors:", response.data.errors);
    throw new Error("Shopify GraphQL error");
  }

  const data = response.data?.data?.orders;
  if (!data) throw new Error("Invalid Shopify API response");

  const orders = data.edges.map((edge) => {
    const node = edge.node;
    const lineItems =
      node.lineItems?.edges.map((itemEdge) => itemEdge.node) || [];
    return {
      ...node,
      lineItems,
    };
  });
  const pageInfo = data.pageInfo;

  return { orders, pageInfo };
};

const fetchShopifyOrders = async () => {
  let allOrders = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const { orders, pageInfo } = await fetchOrders(cursor);
    allOrders = [...allOrders, ...orders];
    cursor = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;
  }
  return allOrders;
};

const fetchShopifyProducts = async () => {
  let Products = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const query = `
      query($cursor: String) {
        products(first: 100, after: $cursor) {
          edges {
            node {
              id
              title
              status
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    price
                  }
                }
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

    const data = response.data?.data?.products;
    if (!data) throw new Error("Invalid Shopify response");

    for (const productEdge of data.edges) {
      const product = productEdge.node;
      const variants = product.variants?.edges.map((v) => v.node) || [];

      for (const variant of variants) {
        Products.push({
          product_id: product.id,
          variant_id: variant.id,
          product_name: product.title,
          variant_title: variant.title,
          cost_price: parseFloat(variant.price),
          status: product.status,
        });
      }
    }

    cursor = data.pageInfo.endCursor;
    hasNextPage = data.pageInfo.hasNextPage;
  }

  return Products;
};

module.exports = { fetchOrders, fetchShopifyOrders, fetchShopifyProducts };
