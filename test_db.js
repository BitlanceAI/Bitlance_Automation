import { supabaseAdmin } from './server/src/config/supabaseClient.js';
async function test() {
  const { data, error, count } = await supabaseAdmin.from('sales_calls').select('*', { count: 'exact', head: true });
  console.log("Count:", count, "Error:", error);
}
test();
