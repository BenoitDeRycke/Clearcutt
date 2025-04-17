// shopify.js
const axios = require("axios");

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const shopify = axios.create({
  baseURL: `https://${SHOPIFY_STORE}/admin/api/2023-10/graphql.json`, // Ensure this is correct
  headers: {
    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
});

module.exports = shopify;
