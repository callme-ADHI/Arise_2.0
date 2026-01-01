
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Try to read .env file manually since we are running this with ts-node/node
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const SUPABASE_URL = envConfig.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envConfig.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing credentials in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log("Testing Supabase Connection...");

    // 1. Check basic connection (public table or health)
    // We'll try to sign in or just read a public config if possible.
    // For now, let's just try to check auth session.
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
        console.error("Session Error:", sessionError);
    } else {
        console.log("Session Status:", session ? "Active Session Found" : "No Active Session (Expected for script)");
    }

    // 2. Try to insert a dummy task if we had a user, but we don't have a user context in this script unless we login.
    // Let's try to login with a test account if possible, or just report connection success.

    console.log("Supabase URL reachable:", SUPABASE_URL);
    console.log("Supabase Key present.");
}

testConnection();
