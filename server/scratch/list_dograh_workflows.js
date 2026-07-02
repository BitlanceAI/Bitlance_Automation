import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const apiUrl = process.env.DOGRAH_API_URL;
    const apiKey = process.env.DOGRAH_API_KEY;

    const endpoints = [
        '/api/v1/workflows',
        '/api/v1/public/workflows',
        '/api/v1/agents',
        '/api/v1/public/agents'
    ];

    for (const ep of endpoints) {
        try {
            console.log(`Trying ${ep}...`);
            const res = await axios.get(`${apiUrl}${ep}`, {
                headers: { 'X-API-Key': apiKey }
            });
            console.log(`✅ Success for ${ep}!`);
            console.log(JSON.stringify(res.data, null, 2).substring(0, 1000));
        } catch (err) {
            console.log(`❌ Failed for ${ep}:`, err.response?.status || err.message);
        }
    }
}
run();
