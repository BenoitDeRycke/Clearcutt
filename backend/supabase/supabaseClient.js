// backend/supabase/supabaseClient.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL; // Make sure to add this in your .env file
const supabaseKey = process.env.SUPABASE_KEY; // Add this too in .env file

// Create a Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase; // Export the supabase instance
