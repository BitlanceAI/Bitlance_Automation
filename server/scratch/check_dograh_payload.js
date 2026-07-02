import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testDograh() {
    const apiUrl = process.env.DOGRAH_API_URL;
    const apiKey = process.env.DOGRAH_API_KEY;
    const workflowId = '13606';
    const runId = '557571'; // Replace with an actual call_id if you know one. We can find one in the DB!

    console.log('Fetching', `${apiUrl}/api/v1/workflow/${workflowId}/runs/${runId}`);
    try {
        const res = await axios.get(`${apiUrl}/api/v1/workflow/${workflowId}/runs/${runId}`, {
            headers: { 'X-API-Key': apiKey }
        });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error(err.response?.data || err.message);
    }
}
testDograh();
