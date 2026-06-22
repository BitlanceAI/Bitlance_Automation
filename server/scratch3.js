import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const selectFields = 'id, topic, seo_title, seo_description, image_url, featured_image, slug, category, tags, author_name, publish_date, created_at, estimated_read_time, word_count, optimization_mode';

  const [companyRes, clientRes] = await Promise.all([
      supabaseAdmin.from('company_articles').select(selectFields).eq('is_published', true),
      supabaseAdmin.from('articles').select(selectFields).eq('is_published', true)
  ]);
  console.log('companyRes error:', companyRes.error);
  console.log('companyRes count:', companyRes.data ? companyRes.data.length : 0);
  console.log('clientRes error:', clientRes.error);
  console.log('clientRes count:', clientRes.data ? clientRes.data.length : 0);
}
run();
