require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const syncRoutes = require("./routes/sync");
const supabaseRoutes = require("./routes/supabase");

app.use("/api/sync", syncRoutes);
app.use("/api/supabase", supabaseRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
