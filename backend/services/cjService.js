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

async function fetchCjDisputes() {
  const token = await getCJAccessToken();

  if (!token) {
    console.error("❌ No CJ token received");
    throw new Error("CJ token missing");
  }

  let page = 1;
  const pageSize = 100;
  let allDisputes = [];
  let hasMore = true;

  const now = new Date();
  const startTime = "2000-01-01 00:00:00";
  const endTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  while (hasMore) {
    try {
      const res = await axios.get(
        "https://developers.cjdropshipping.com/api2.0/v1/disputes/getDisputeList",
        {
          headers: {
            "CJ-Access-Token": token,
          },
          params: {
            pageNum: page,
            pageSize,
            startTime,
            endTime,
            disputeType: "",
          },
        }
      );

      const list = res.data?.data?.list;

      if (!res.data?.result || !Array.isArray(list)) {
        console.error(
          "❌ Invalid dispute response from CJ:",
          JSON.stringify(res.data, null, 2)
        );
        throw new Error("Invalid CJ dispute response structure");
      }

      allDisputes.push(...list);

      hasMore = list.length === pageSize;
      page++;
    } catch (err) {
      console.error("❌ Error fetching CJ disputes:", err.message);
      throw err;
    }
  }
  return allDisputes;
}

module.exports = { fetchCjOrders, fetchCjDisputes };
