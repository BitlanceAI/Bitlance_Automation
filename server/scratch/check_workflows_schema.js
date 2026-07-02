import { newSupabaseAdmin } from '../src/config/supabaseClient.js';
async function run() {
    const { data, error } = await newSupabaseAdmin.from('workflows').select('*').limit(1);
    if (error) console.error(error);
    else console.log(data);
}
run();
