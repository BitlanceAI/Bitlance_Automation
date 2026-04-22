/**
 * reminderCron.js
 * Runs every hour. Finds leads who downloaded the guide 24+ hours ago
 * but have NOT booked a demo, and sends them a reminder email via OneSignal.
 */

import cron from 'node-cron';
import { supabaseAdmin } from '../../config/supabaseClient.js';
import { sendRemarketingEmail } from '../push/onesignalService.js';
import { REMINDER_EMAIL_TEMPLATE } from '../../constants/emailTemplates.js';

const REMINDER_SUBJECT = "You're one step away from automating your business 🚀";

const sendReminders = async () => {
    try {
        const now = new Date();
        const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

        console.log(`\n⏰ [ReminderCron] Running at ${now.toISOString()}`);
        console.log(`   Looking for leads created between ${cutoff48h} and ${cutoff24h}`);

        // Find leads who downloaded but haven't booked or been reminded yet
        const { data: leads, error } = await supabaseAdmin
            .from('leads')
            .select('id, name, email, phone, tag, reminder_sent, created_at')
            .eq('tag', 'Downloaded Guide')
            .eq('booked', false)
            .or('reminder_sent.is.null,reminder_sent.eq.false')
            .gte('created_at', cutoff48h)   // not older than 48h (to avoid re-sending)
            .lte('created_at', cutoff24h);   // at least 24h old

        if (error) {
            console.error('[ReminderCron] Supabase query error:', error);
            return;
        }

        if (!leads || leads.length === 0) {
            console.log('[ReminderCron] No eligible leads found. Skipping.');
            return;
        }

        console.log(`[ReminderCron] Found ${leads.length} lead(s) to remind.`);

        let sent = 0;
        let failed = 0;

        for (const lead of leads) {
            try {
                const html = REMINDER_EMAIL_TEMPLATE(lead);
                const result = await sendRemarketingEmail([lead.email], REMINDER_SUBJECT, html);

                if (result.success) {
                    // Mark reminder as sent so we never double-send
                    const { error: updateError } = await supabaseAdmin
                        .from('leads')
                        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
                        .eq('id', lead.id);

                    if (updateError) {
                        console.error(`[ReminderCron] Could not mark lead ${lead.id} as reminded:`, updateError);
                    } else {
                        console.log(`✅ [ReminderCron] Reminder sent → ${lead.email} (id: ${lead.id})`);
                        sent++;
                    }
                } else {
                    console.warn(`⚠️ [ReminderCron] OneSignal failed for ${lead.email}:`, result.error);
                    failed++;
                }
            } catch (err) {
                console.error(`[ReminderCron] Error processing lead ${lead.id}:`, err.message);
                failed++;
            }

            // Small delay between sends to avoid OneSignal rate limiting
            await new Promise(r => setTimeout(r, 300));
        }

        console.log(`[ReminderCron] Done. Sent: ${sent}, Failed: ${failed}`);

    } catch (err) {
        console.error('[ReminderCron] Unexpected error:', err);
    }
};

export const startReminderCron = () => {
    // Run every hour at minute 0  →  cron syntax: '0 * * * *'
    cron.schedule('0 * * * *', sendReminders, {
        timezone: 'Asia/Kolkata',
    });

    console.log('⏰ [ReminderCron] Scheduled — runs every hour (Asia/Kolkata)');

    // Optionally run once at startup to catch any missed sends (e.g. server restart)
    // sendReminders();
};
