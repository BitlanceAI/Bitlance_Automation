import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('company_articles').select('*').limit(1);
  console.log('Error:', error);
  console.log('Keys:', data && data[0] ? Object.keys(data[0]) : 'no data');
}
run();
