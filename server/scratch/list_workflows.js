import { newSupabaseAdmin } from '../src/config/supabaseClient.js';
async function run() {
    const { data, error } = await newSupabaseAdmin.from('user_workflows').select('*');
    if (error) console.error(error);
    else console.log(data);
}
run();
