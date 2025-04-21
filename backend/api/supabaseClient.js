const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVIEC_ROL_KEY = process.env.SUPABASE_SERVIEC_ROL_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVIEC_ROL_KEY);

module.exports = supabase;
