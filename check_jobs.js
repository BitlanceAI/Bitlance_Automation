const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('design_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
    
    if (error) console.error("Error:", error);
    else console.log(JSON.stringify(data, null, 2));
}
check();
