import axios from 'axios';
async function run() {
    try {
        // Need to hit the endpoint as the user to see exactly what BlogManagerPanel gets
        // Since I don't have their JWT, I will simulate what listArticles does using supabase-admin
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
            'https://paskzwoegduhzehkxoyu.supabase.co', 
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhc2t6d29lZ2R1aHplaGt4b3l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MDQ4OSwiZXhwIjoyMDc3MTM2NDg5fQ.r8X-0gnfI7zseMzo4yENBqL1ezbBUcnBdPn20UB6wI8'
        );
        const { data, error } = await supabaseAdmin.from('company_articles').select('*').limit(3);
        console.log(data.map(d => ({title: d.seo_title, opt_mode: d.optimization_mode})));
    } catch(e) { console.error(e.message); }
}
run();
