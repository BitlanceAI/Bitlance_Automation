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
    const events = res.data.logs?.realtime_feedback_events;
    console.log('realtime_feedback_events exists:', !!events);
    console.log('realtime_feedback_events length:', events?.length);
    console.log('realtime_feedback_events preview:', JSON.stringify(events?.slice(0, 3), null, 2));
}
run();
