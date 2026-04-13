/**
 * emailSequenceService.js
 *
 * Handles three automated email sequences for Bitlance:
 *   • welcome      — triggered when a new user signs up (7 emails / 14 days)
 *   • nurture      — triggered when a new lead is added   (8 emails / 21 days)
 *   • reengagement — triggered when a user is inactive 30+ days (4 emails / 14 days)
 *
 * Each run (called by emailSequenceCron):
 *   1. Enrols new candidates who don't yet have a sequence entry
 *   2. Sends all due emails (next_send_at <= NOW())
 *   3. Advances step or marks sequence completed
 */

import { supabaseAdmin } from '../config/supabaseClient.js';
import { sendMailtrapEmail } from './mailtrapService.js';
import {
    WELCOME_EMAIL_TEMPLATES,
    WELCOME_DELAYS,
    NURTURE_EMAIL_TEMPLATES,
    NURTURE_DELAYS,
    REENGAGEMENT_EMAIL_TEMPLATES,
    REENGAGEMENT_DELAYS,
} from '../constants/emailTemplates.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString();
};

/** Insert a new sequence entry for an email/user, starting at step 0 (due now). */
const enrol = async (email, sequenceType, userId = null, metadata = {}) => {
    const { error } = await supabaseAdmin
        .from('email_sequences')
        .upsert({
            email,
            user_id: userId || null,
            sequence_type: sequenceType,
            current_step: 0,
            next_send_at: new Date().toISOString(),
            completed: false,
            unsubscribed: false,
            metadata,
        }, { onConflict: 'email,sequence_type', ignoreDuplicates: true });

    if (error) {
        console.error(`[EmailSeq] Enrol error (${sequenceType} / ${email}):`, error.message);
    }
};

/** Send one step of a sequence and advance (or complete) the record. */
const sendStep = async (record, templates, delays) => {
    const { id, email, current_step, metadata } = record;
    const step = templates[current_step];
    if (!step) return; // guard

    const name = metadata?.name || '';
    const subject = step.subject;
    const html = step.html(name);

    const result = await sendMailtrapEmail(email, subject, html);

    if (!result.success) {
        console.warn(`[EmailSeq] Failed to send step ${current_step} to ${email}:`, result.error);
        return;
    }

    const nextStep = current_step + 1;
    const isLast = nextStep >= templates.length;

    const { error } = await supabaseAdmin
        .from('email_sequences')
        .update({
            current_step: nextStep,
            next_send_at: isLast ? null : addDays(new Date(), delays[nextStep] - delays[current_step]),
            completed: isLast,
        })
        .eq('id', id);

    if (error) {
        console.error(`[EmailSeq] Advance error for ${email}:`, error.message);
    } else {
        console.log(`[EmailSeq] ✅ Sent step ${current_step} (${record.sequence_type}) → ${email}${isLast ? ' [COMPLETED]' : ''}`);
    }
};

// ─── 1. WELCOME — enrol new Supabase auth users ──────────────────────────────

export const runWelcomeSequence = async () => {
    // Find users signed up in the last 25 hours (cron runs hourly, 1h buffer)
    const cutoff = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();

    // Supabase admin.listUsers() paginates; fetch first 1000 (adjust if needed)
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (listError) {
        console.error('[EmailSeq] Welcome: failed to list users:', listError.message);
        return;
    }

    const newUsers = users.filter(u => u.created_at >= cutoff && u.email);

    for (const user of newUsers) {
        await enrol(user.email, 'welcome', user.id, { name: user.user_metadata?.full_name || user.email.split('@')[0] });
    }

    if (newUsers.length > 0) {
        console.log(`[EmailSeq] Welcome: enrolled ${newUsers.length} new user(s)`);
    }
};

// ─── 2. NURTURE — enrol new leads from the leads table ───────────────────────

export const runNurtureSequence = async () => {
    const cutoff = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();

    // Only enrol leads that have an email and were created recently
    const { data: leads, error } = await supabaseAdmin
        .from('leads')
        .select('id, name, email, created_at')
        .gte('created_at', cutoff)
        .not('email', 'is', null);

    if (error) {
        console.error('[EmailSeq] Nurture: query error:', error.message);
        return;
    }

    for (const lead of leads || []) {
        await enrol(lead.email, 'nurture', null, { name: lead.name || lead.email.split('@')[0], lead_id: lead.id });
    }

    if ((leads || []).length > 0) {
        console.log(`[EmailSeq] Nurture: enrolled ${leads.length} new lead(s)`);
    }
};

// ─── 3. RE-ENGAGEMENT — enrol users inactive for 30+ days ───────────────────

export const runReengagementSequence = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (listError) {
        console.error('[EmailSeq] Reengagement: failed to list users:', listError.message);
        return;
    }

    // Users whose last sign-in was 30+ days ago (and have ever logged in)
    const inactiveUsers = users.filter(u =>
        u.email &&
        u.last_sign_in_at &&
        u.last_sign_in_at < thirtyDaysAgo
    );

    for (const user of inactiveUsers) {
        await enrol(user.email, 'reengagement', user.id, {
            name: user.user_metadata?.full_name || user.email.split('@')[0],
        });
    }

    if (inactiveUsers.length > 0) {
        console.log(`[EmailSeq] Reengagement: enrolled ${inactiveUsers.length} inactive user(s)`);
    }
};

// ─── SEND DUE EMAILS (all sequence types) ────────────────────────────────────

const SEQUENCE_MAP = {
    welcome: { templates: WELCOME_EMAIL_TEMPLATES, delays: WELCOME_DELAYS },
    nurture: { templates: NURTURE_EMAIL_TEMPLATES, delays: NURTURE_DELAYS },
    reengagement: { templates: REENGAGEMENT_EMAIL_TEMPLATES, delays: REENGAGEMENT_DELAYS },
};

export const sendDueEmails = async () => {
    const { data: due, error } = await supabaseAdmin
        .from('email_sequences')
        .select('*')
        .lte('next_send_at', new Date().toISOString())
        .eq('completed', false)
        .eq('unsubscribed', false)
        .order('next_send_at', { ascending: true })
        .limit(200); // process up to 200 emails per run

    if (error) {
        console.error('[EmailSeq] sendDueEmails query error:', error.message);
        return;
    }

    if (!due || due.length === 0) {
        console.log('[EmailSeq] No due emails this run.');
        return;
    }

    console.log(`[EmailSeq] Processing ${due.length} due email(s)...`);

    for (const record of due) {
        const seq = SEQUENCE_MAP[record.sequence_type];
        if (!seq) continue;
        await sendStep(record, seq.templates, seq.delays);
        // Small delay to avoid OneSignal rate limits
        await new Promise(r => setTimeout(r, 300));
    }
};

// ─── UNSUBSCRIBE helper (called from an API route) ───────────────────────────

export const unsubscribeEmail = async (email) => {
    const { error } = await supabaseAdmin
        .from('email_sequences')
        .update({ unsubscribed: true, completed: true })
        .eq('email', email);

    if (error) {
        console.error('[EmailSeq] Unsubscribe error:', error.message);
        return false;
    }
    return true;
};
