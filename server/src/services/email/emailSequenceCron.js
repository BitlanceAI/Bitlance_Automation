/**
 * emailSequenceCron.js
 *
 * Runs every 30 minutes:
 *   1. Enrols new candidates into each sequence type
 *   2. Sends all emails that are due right now
 *
 * Start it once at server startup via startEmailSequenceCron().
 */

import cron from 'node-cron';
import {
    runWelcomeSequence,
    runNurtureSequence,
    runReengagementSequence,
    sendDueEmails,
} from './emailSequenceService.js';

const runAllSequences = async () => {
    console.log(`\n📧 [EmailSequenceCron] Running at ${new Date().toISOString()}`);

    try {
        // 1. Enrol new candidates for each sequence type
        await runWelcomeSequence();
        await runNurtureSequence();
        await runReengagementSequence();

        // 2. Send all emails that are now due
        await sendDueEmails();

        console.log(`📧 [EmailSequenceCron] Done.\n`);
    } catch (err) {
        console.error('[EmailSequenceCron] Unexpected error:', err.message);
    }
};

export const startEmailSequenceCron = () => {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', runAllSequences, {
        timezone: 'Asia/Kolkata',
    });

    console.log('📧 [EmailSequenceCron] Scheduled — runs every 30 minutes (Asia/Kolkata)');

    // Run once on startup to catch anything missed (e.g. server restart)
    runAllSequences();
};
