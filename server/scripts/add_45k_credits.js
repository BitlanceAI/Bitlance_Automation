import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const run = async () => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*');
        if (error) {
            console.log("Failed to fetch from 'users' table, maybe it doesn't exist or isn't accessible:", error.message);
        } else {
            console.log("Users:", users);
        }
        
        const { data: userCredits, error: ucError } = await supabase
            .from('user_credits')
            .select('*');
            
        console.log("User Credits:", userCredits);
    } catch (e) {
        console.error(e);
    }
};
run();
