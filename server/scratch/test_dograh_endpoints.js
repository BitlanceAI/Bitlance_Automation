import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const apiUrl = process.env.DOGRAH_API_URL;
    const apiKey = process.env.DOGRAH_API_KEY;
    const runId = '557571';

    const paths = [
        `/api/v1/runs/${runId}`,
        `/api/v1/workflow/runs/${runId}`,
        `/api/v1/workflow/run/${runId}`,
        `/api/v1/calls/${runId}`,
        `/api/v1/call/${runId}`
    ];

    for (const path of paths) {
        try {
            console.log(`Trying ${path}...`);
            const res = await axios.get(`${apiUrl}${path}`, {
                headers: { 'X-API-Key': apiKey }
            });
            console.log(`✅ Success for ${path}! Keys:`, Object.keys(res.data));
            return;
        } catch (err) {
            console.log(`❌ Failed for ${path}:`, err.response?.status || err.message);
        }
    }
}
test();
