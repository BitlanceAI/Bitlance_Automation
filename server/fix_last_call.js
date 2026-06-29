import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.log('Fixing last call recording URL...');
    const { data: calls, error: fetchErr } = await supabase
        .from('sales_calls')
        .select('id, recording_url')
        .order('started_at', { ascending: false })
        .limit(1);

    if (fetchErr || !calls.length) {
        console.error('Error fetching latest call:', fetchErr);
        return;
    }

    const lastCall = calls[0];
    if (lastCall.recording_url && !lastCall.recording_url.startsWith('http')) {
        const fullUrl = `https://api.dograh.com/${lastCall.recording_url}`;
        console.log(`Updating call ${lastCall.id} recording_url to ${fullUrl}`);
        const { error: updateErr } = await supabase
            .from('sales_calls')
            .update({ recording_url: fullUrl })
            .eq('id', lastCall.id);

        if (updateErr) {
            console.error('Error updating call:', updateErr);
        } else {
            console.log('Successfully updated latest call!');
        }
    } else {
        console.log('Latest call already has an absolute URL or no recording.');
    }
    process.exit(0);
}
main();
