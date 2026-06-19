/**
 * creditMonitorCron.js
 *
 * Runs every minute in the background:
 *   1. Scans user credits table
 *   2. Compares used credits vs total credits
 *   3. Triggers alert emails for 50%, 75%, 90%, and 100% credit thresholds
 *
 * Start it once at server startup via startCreditMonitorCron().
 */

import cron from 'node-cron';
import { checkCreditUsageAndNotify } from '../credits/creditMonitorService.js';

const runCreditUsageCheck = async () => {
    console.log(`\n💳 [CreditMonitorCron] Running credit usage check at ${new Date().toISOString()}`);
    try {
        await checkCreditUsageAndNotify();
    } catch (err) {
        console.error('[CreditMonitorCron] Error executing credit monitor task:', err.message);
    }
};

export const startCreditMonitorCron = () => {
    // Run every minute
    cron.schedule('* * * * *', runCreditUsageCheck, {
        timezone: 'Asia/Kolkata',
    });

    console.log('💳 [CreditMonitorCron] Scheduled — runs every minute (Asia/Kolkata)');

    // Run once on startup
    runCreditUsageCheck();
};
