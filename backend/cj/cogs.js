const axios = require("axios");

const CJ_EMAIL = process.env.CJ_EMAIL;
const CJ_API_KEY = process.env.CJ_API_KEY;

// In-memory token cache
let tokenCache = {
  token: null,
  expiresAt: 0,
};

let tokenPromise = null;

function getMidnightTimestamp() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

async function getCJAccessToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  if (tokenPromise) return tokenPromise;

  console.log("🔐 Fetching new CJ token...");

  tokenPromise = axios
    .post(
      "https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken",
      { email: CJ_EMAIL, password: CJ_API_KEY },
      { headers: { "Content-Type": "application/json" } }
    )
    .then((res) => {
      const token = res.data?.data?.accessToken;
      if (!token) throw new Error("❌ Failed to get CJ token");

      tokenCache.token = token;
      tokenCache.expiresAt = getMidnightTimestamp();
      console.log("✅ CJ token cached until midnight");
      return token;
    })
    .catch((err) => {
      console.error("❌ CJ token fetch error:", err.message);
      throw err;
    })
    .finally(() => {
      tokenPromise = null;
    });

  return tokenPromise;
}

async function findCJOrder(orderNumber) {
  const token = await getCJAccessToken();

  const response = await axios.get(
    "https://developers.cjdropshipping.com/api2.0/v1/shopping/order/list?pageNum=1&pageSize=100",
    {
      headers: {
        "CJ-Access-Token": token,
      },
    }
  );

  const orders = response.data?.data?.list || [];
  return (
    orders.find(
      (order) => (order.orderNum || "").replace(/^#/, "").trim() === orderNumber
    ) || null
  );
}

async function getCOGS(orderNumber) {
  const cjOrder = await findCJOrder(orderNumber);
  if (!cjOrder) {
    console.log("⚠️ No CJ order found for:", orderNumber);
    return null;
  }

  const product = parseFloat(cjOrder.productAmount) || 0;
  const shipping = parseFloat(cjOrder.postageAmount) || 0;
  const orderTotal =
    parseFloat(
      cjOrder.orderAmount || cjOrder.payAmount || cjOrder.otherAmount
    ) || 0;

  const fees = +(orderTotal - product - shipping).toFixed(2);

  return {
    product,
    shipping,
    fees,
    CJtotal: +(product + shipping + fees).toFixed(2),
  };
}

module.exports = { getCOGS };
