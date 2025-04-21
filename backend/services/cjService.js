const axios = require("axios");
const { getCJAccessToken } = require("../api/cj");

async function fetchCjOrders() {
  const token = await getCJAccessToken();

  if (!token) {
    console.error("❌ No CJ token received");
    return null;
  }

  let page = 1;
  const pageSize = 100;
  let allOrders = [];
  let hasMore = true;

  while (hasMore) {
    const url = `https://developers.cjdropshipping.com/api2.0/v1/shopping/order/list?pageNum=${page}&pageSize=${pageSize}`;
    const headers = { "CJ-Access-Token": token };

    try {
      const response = await axios.get(url, { headers });

      if (!response.data?.data?.list) {
        console.error("❌ Invalid response structure from CJ:", response.data);
        return null;
      }

      const orders = response.data.data.list;
      allOrders.push(...orders);

      hasMore = orders.length === pageSize;
      page++;
    } catch (err) {
      console.error("❌ Error fetching CJ orders:", err.message);
      return null;
    }
  }

  return allOrders;
}
module.exports = { fetchCjOrders };
