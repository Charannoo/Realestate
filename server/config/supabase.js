const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/** Same priority as scripts/checkEnv.js — service role avoids RLS blocks for server-side inserts/upserts */
const supabaseUrl =
    (process.env.SUPABASE_URL && process.env.SUPABASE_URL.trim()) ||
    (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_URL.trim());
const supabaseKey =
    (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim()) ||
    (process.env.VITE_SUPABASE_PUBLISHABLE_KEY && process.env.VITE_SUPABASE_PUBLISHABLE_KEY.trim());

if (!supabaseUrl || !supabaseKey) {
    console.error(
        'Missing Supabase URL or key in .env — set SUPABASE_URL or VITE_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY'
    );
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
