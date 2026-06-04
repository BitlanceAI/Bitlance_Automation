import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://paskzwoegduhzehkxoyu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhc2t6d29lZ2R1aHplaGt4b3l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MDQ4OSwiZXhwIjoyMDc3MTM2NDg5fQ.r8X-0gnfI7zseMzo4yENBqL1ezbBUcnBdPn20UB6wI8');

async function run() {
    const { data: articles } = await supabase.from('articles').select('id, seo_title, optimization_mode, content');
    const { data: companyArticles } = await supabase.from('company_articles').select('id, seo_title, optimization_mode, content');
    console.log('ARTICLES:', articles?.map(a => ({title: a.seo_title, mode: a.optimization_mode, hasFaq: a.content?.toLowerCase().includes('faq')})));
    console.log('COMPANY ARTICLES:', companyArticles?.map(a => ({title: a.seo_title, mode: a.optimization_mode, hasFaq: a.content?.toLowerCase().includes('faq')})));
}
run();
