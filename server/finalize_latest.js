import 'dotenv/config';
import { finalizeActiveCall, fetchDograhRun } from './src/controllers/billing/dograhController.js';

async function main() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const runId = '555235';
    console.log(`Refinalizing call ${runId} to fetch transcript and recording...`);
    try {
        const runData = await fetchDograhRun(runId);
        const result = await finalizeActiveCall({
            sessionKey: runId,
            session: null,
            callId: runId,
            runData,
            phoneNumber: '+918318768905',
            agentId: '7ef7deb5-7e2d-4616-8ea5-93914314bccf',
            agentName: 'Dograh Voice Agent',
            orgId: '3c4bfc01-b09b-4d76-b931-0f0e90fbcc2f',
            adminId: '9b7f5250-93bf-4d8e-be89-325f187a2a09' // We can omit or get admin_id
        });
        console.log('Result:', result);
    } catch (err) {
        console.error('Error:', err.stack || err.message);
    }
    process.exit(0);
}
main();
