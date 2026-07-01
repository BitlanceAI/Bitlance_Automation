import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const apiUrl = process.env.DOGRAH_API_URL;
    const apiKey = process.env.DOGRAH_API_KEY;
    const runId = '557571';
    const workflowId = 13606;

    const url = `${apiUrl}/api/v1/workflow/${workflowId}/runs/${runId}`;
    console.log('Fetching', url);
    const res = await axios.get(url, { headers: { 'X-API-Key': apiKey } });
    console.log('Keys:', Object.keys(res.data));
    console.log('events_timeline exists:', !!res.data.events_timeline);
    console.log('events_timeline length:', res.data.events_timeline?.length);
    console.log('events_timeline preview:', JSON.stringify(res.data.events_timeline?.slice(0, 2)));
}
run();
