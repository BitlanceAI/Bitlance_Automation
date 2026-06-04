import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testStorage() {
    try {
        const { data, error } = await sb.storage.from('blog-images').list();
        if (error) {
            console.error("Storage Error:", error);
        } else {
            console.log("Storage Success, files count:", data ? data.length : 0);
        }
    } catch (e) {
        console.error("Storage Catch:", e.message);
    }
}
testStorage();
