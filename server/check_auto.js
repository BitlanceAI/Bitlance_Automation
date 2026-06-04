import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://paskzwoegduhzehkxoyu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhc2t6d29lZ2R1aHplaGt4b3l1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MDQ4OSwiZXhwIjoyMDc3MTM2NDg5fQ.r8X-0gnfI7zseMzo4yENBqL1ezbBUcnBdPn20UB6wI8');
async function run() {
    const { data } = await supabase.from('auto_blogs').select('*').limit(1);
    console.log(data?.[0] ? Object.keys(data[0]) : 'empty');
}
run();
