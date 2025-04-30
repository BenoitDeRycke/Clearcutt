const supabase = require("../api/supabaseClient");

const getOrdersFromSupabase = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ orders: data, total: count });
  } catch (err) {
    console.error("❌ Controller crash:", err);
    res.status(500).json({ error: err.message });
  }
};

const getAllOrdersFromSupabase = async (req, res) => {
  try {
    const { start, end } = req.query;

    let query = supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false });

    if (start && end) {
      query = query.gte("date", start).lte("date", end);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ orders: data });
  } catch (err) {
    console.error("❌ Controller crash:", err);
    res.status(500).json({ error: err.message });
  }
};

const getProductsFromSupabase = async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("❌ Failed to fetch products:", error.message);
      return res.status(500).json({ error: "Failed to fetch products" });
    }

    return res.status(200).json({ products: data });
  } catch (err) {
    console.error("❌ Unexpected error fetching products:", err.message);
    return res.status(500).json({ error: "Unexpected server error" });
  }
};

module.exports = {
  getOrdersFromSupabase,
  getAllOrdersFromSupabase,
  getProductsFromSupabase,
};
