require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const syncRoutes = require("./routes/sync");
const supabaseRoutes = require("./routes/supabase");

app.use("/api/sync", syncRoutes); // /api/sync-orders
app.use("/api/supabase", supabaseRoutes); // /api/supabase/getorders

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
