import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const apiUrl = process.env.DOGRAH_API_URL;
    const apiKey = process.env.DOGRAH_API_KEY;
    const runId = '557571';
    const workflowId = 13606;

    const url = `${apiUrl}/api/v1/workflow/${workflowId}/runs/${runId}`;
    const res = await axios.get(url, { headers: { 'X-API-Key': apiKey } });
    console.log('logs type:', typeof res.data.logs);
    console.log('logs keys/properties:', Object.keys(res.data.logs || {}));
    if (res.data.logs && typeof res.data.logs === 'object') {
        const firstKey = Object.keys(res.data.logs)[0];
        console.log(`First key "${firstKey}" type:`, typeof res.data.logs[firstKey]);
        console.log(`First key content:`, JSON.stringify(res.data.logs[firstKey]).substring(0, 500));
    }
}
run();
