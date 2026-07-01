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
    console.log('logs exists:', !!res.data.logs);
    console.log('logs is array:', Array.isArray(res.data.logs));
    console.log('logs length:', res.data.logs?.length);
    console.log('logs sample:', JSON.stringify(res.data.logs?.slice(0, 5), null, 2));
}
run();
