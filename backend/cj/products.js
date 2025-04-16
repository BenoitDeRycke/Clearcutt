const axios = require("axios");

const CJ_API_KEY = process.env.CJ_API_KEY;

async function getCJProductCost(sku) {
  try {
    const response = await axios.get(
      `https://developers.cjdropshipping.com/api2.0/product/list`, // or specific product endpoint if you have it
      {
        headers: {
          CJAccessToken: CJ_API_KEY,
        },
        params: {
          keyword: sku,
        },
      }
    );

    const product = response.data.data.list?.[0];
    if (!product) return null;

    return {
      sku: product.sku,
      cost: product.sellPrice,
      shipping: product.freightFee || 0,
    };
  } catch (error) {
    console.error("CJ API error:", error.message);
    return null;
  }
}

module.exports = { getCJProductCost };
