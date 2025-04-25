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

module.exports = { getOrdersFromSupabase };
