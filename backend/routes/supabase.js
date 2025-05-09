const express = require("express");
const router = express.Router();
const {
  getOrdersFromSupabase,
  getAllOrdersFromSupabase,
  getProductsFromSupabase,
  getProductMetricsFromSupabase,
} = require("../controllers/supabaseController");

router.get("/getorders", getOrdersFromSupabase);

router.get("/getallorders", getAllOrdersFromSupabase);

router.get("/getproducts", getProductsFromSupabase);

router.get("/getproductmetrics", getProductMetricsFromSupabase);

module.exports = router;
