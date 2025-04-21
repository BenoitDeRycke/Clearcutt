const supabase = require("../api/supabaseClient");

const getOrdersFromSupabase = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch orders from Supabase" });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Unexpected Supabase error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { getOrdersFromSupabase };
