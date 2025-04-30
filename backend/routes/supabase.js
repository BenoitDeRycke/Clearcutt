const express = require("express");
const router = express.Router();
const {
  getOrdersFromSupabase,
  getAllOrdersFromSupabase,
  getProductsFromSupabase,
} = require("../controllers/supabaseController");

router.get("/getorders", getOrdersFromSupabase);

router.get("/getallorders", getAllOrdersFromSupabase);

router.get("/getproducts", getProductsFromSupabase);

module.exports = router;
