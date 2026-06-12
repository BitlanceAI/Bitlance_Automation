import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('company_articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);
    
  if (error) console.error(error);
  else {
    fs.writeFileSync('latest_blog.json', JSON.stringify(data, null, 2));
    console.log('Done');
  }
}
run();
