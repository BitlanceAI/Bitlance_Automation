import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
sb.from('articles').select('id').limit(1).then(res => {
    console.log("Supabase connection test:", res.error ? res.error : "SUCCESS");
}).catch(err => {
    console.error("Supabase connect error:", err);
});
