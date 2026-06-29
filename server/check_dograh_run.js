import 'dotenv/config';
import axios from 'axios';
import { fetchDograhRun } from './src/controllers/billing/dograhController.js';

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const runId = '555235';
    try {
        const runData = await fetchDograhRun(runId);
        const transcriptUrl = runData.transcript_public_url || runData.transcript_url;
        console.log('Downloading transcript from:', transcriptUrl);
        const res = await axios.get(transcriptUrl);
        console.log('Transcript content:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}
main();
