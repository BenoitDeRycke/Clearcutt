// backend/cj/cj.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CJ_EMAIL = process.env.CJ_EMAIL;
const CJ_API_KEY = process.env.CJ_API_KEY;
const TOKEN_PATH = path.join(__dirname, "token.json");

const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

function isTokenValid(tokenObj) {
  if (!tokenObj?.token || !tokenObj?.createdAt) return false;

  const age = Date.now() - tokenObj.createdAt;
  return age < ONE_DAY;
}

async function getCJAccessToken() {
  let tokenData;
  try {
    const raw = fs.readFileSync(TOKEN_PATH, "utf-8");
    tokenData = JSON.parse(raw);
  } catch (err) {
    tokenData = null;
  }

  if (isTokenValid(tokenData)) {
    return tokenData.token;
  }

  const age = tokenData?.createdAt
    ? Date.now() - tokenData.createdAt
    : Infinity;
  if (age < FIVE_MINUTES) {
    throw new Error("Token requested too recently. Wait a few minutes.");
  }

  console.log("🔐 Fetching new CJ token...");

  const res = await axios.post(
    "https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken",
    { email: CJ_EMAIL, password: CJ_API_KEY },
    { headers: { "Content-Type": "application/json" } }
  );

  const token = res.data?.data?.accessToken;
  if (!token) throw new Error("❌ Failed to get CJ token");

  const tokenToSave = {
    token,
    createdAt: Date.now(),
  };

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenToSave, null, 2));
  console.log("✅ CJ token saved to file");

  return token;
}

module.exports = { getCJAccessToken };
