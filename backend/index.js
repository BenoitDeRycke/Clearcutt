require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const shopifyRoutes = require("./shopify/orders");
app.use("/api/shopify", shopifyRoutes);

const syncRoutes = require("./sync/index");
app.use("/api", syncRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
