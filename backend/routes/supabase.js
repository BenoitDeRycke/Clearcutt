const express = require("express");
const router = express.Router();
const { getOrdersFromSupabase } = require("../controllers/supabaseController");

router.get("/getorders", getOrdersFromSupabase);

module.exports = router;
