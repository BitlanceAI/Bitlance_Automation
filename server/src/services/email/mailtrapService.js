/**
 * mailtrapService.js
 *
 * Sends transactional emails via Mailtrap SMTP using nodemailer.
 *
 * Required env vars:
 *   MAILTRAP_SMTP_USER  — Mailtrap SMTP username (from Mailtrap → SMTP Settings)
 *   MAILTRAP_SMTP_PASS  — Mailtrap SMTP password
 *   MAILTRAP_FROM_EMAIL — sender address (must be verified in Mailtrap)
 *   MAILTRAP_FROM_NAME  — sender display name (default: "Bitlance")
 *
 * Mailtrap SMTP Settings:
 *   Host:  live.smtp.mailtrap.io
 *   Port:  587 (TLS / STARTTLS)
 */

import nodemailer from 'nodemailer';

const createTransport = () =>
    nodemailer.createTransport({
        host: 'live.smtp.mailtrap.io',
        port: 587,
        secure: false, // TLS via STARTTLS
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

/**
 * Send a single HTML email via Mailtrap.
 *
 * @param {string}   to       — recipient email
 * @param {string}   subject  — email subject line
 * @param {string}   html     — HTML email body
 * @param {string}  [text]    — optional plain-text fallback
 * @returns {{ success: boolean, messageId?: string, error?: string }}
 */
export const sendMailtrapEmail = async (to, subject, html, text = '') => {
    try {
        if (!process.env.MAILTRAP_SMTP_USER || !process.env.MAILTRAP_SMTP_PASS) {
            throw new Error('Mailtrap SMTP credentials missing (MAILTRAP_SMTP_USER / MAILTRAP_SMTP_PASS)');
        }

        const transporter = createTransport();

        const info = await transporter.sendMail({
            from: `"${process.env.MAILTRAP_FROM_NAME || 'Bitlance'}" <${process.env.MAILTRAP_FROM_EMAIL}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
        });

        console.log(`[Mailtrap] ✅ Sent to ${to} | messageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[Mailtrap] ❌ Failed to send to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send the same email to multiple recipients (one-by-one to avoid spam flags).
 *
 * @param {string[]} recipients — array of email addresses
 * @param {string}   subject
 * @param {string}   html
 * @returns {{ sent: number, failed: number }}
 */
export const sendMailtrapEmailBulk = async (recipients, subject, html) => {
    let sent = 0;
    let failed = 0;

    for (const email of recipients) {
        const result = await sendMailtrapEmail(email, subject, html);
        if (result.success) sent++;
        else failed++;
        // Small delay to stay within rate limits
        await new Promise(r => setTimeout(r, 200));
    }

    return { sent, failed };
};
