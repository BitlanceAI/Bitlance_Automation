import { supabaseAdmin } from '../../config/supabaseClient.js';
import { sendMailtrapEmail } from '../email/mailtrapService.js';

/**
 * Reusable HTML template wrapper for Bitlance system/billing notifications
 */
const getSystemEmailTemplate = (subjectTitle, contentHtml) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subjectTitle}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; -webkit-font-smoothing: antialiased; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f9fafb; padding-bottom: 40px; padding-top: 40px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; }
            .header { background-color: #0f172a; padding: 30px; text-align: center; }
            .logo-text { font-size: 24px; font-weight: 800; color: #0d9488; letter-spacing: 0.05em; text-transform: uppercase; margin: 0; }
            .content { padding: 40px 30px; line-height: 1.6; color: #374151; }
            .title { font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 20px; }
            .code-box { background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 14px; color: #1f2937; word-break: break-all; margin: 24px 0; }
            .stats-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            .stats-table td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 15px; }
            .stats-table td.label { font-weight: 600; color: #4b5563; }
            .stats-table td.val { text-align: right; color: #111827; font-weight: bold; }
            .btn { display: inline-block; background-color: #0d9488; color: #ffffff !important; font-weight: 700; font-size: 15px; text-decoration: none; padding: 12px 28px; border-radius: 6px; margin: 20px 0; text-align: center; }
            .footer { background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            .footer a { color: #0d9488; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <p class="logo-text">Bitlance AI</p>
                </div>
                <div class="content">
                    ${contentHtml}
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Bitlance Tech Hub. All rights reserved.</p>
                    <p>
                        <a href="https://app.bitlancetechhub.com/dashboard">Dashboard</a> &bull; 
                        <a href="https://app.bitlancetechhub.com/docs">Documentation</a> &bull; 
                        <a href="mailto:support@bitlancetechhub.com">Support</a>
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Sends welcome email to a new client when API Key is generated
 */
export const sendWelcomeEmail = async (email, plan, apiKey, clientName = '') => {
    const greeting = clientName ? `Hello ${clientName}` : 'Hello';
    const planFormatted = plan.charAt(0).toUpperCase() + plan.slice(1);
    
    const content = `
        <h2 class="title">Your Bitlance AI API Key is Ready!</h2>
        <p>${greeting},</p>
        <p>Thank you for choosing Bitlance AI. Your <strong>${planFormatted} Plan</strong> has been activated successfully and is ready to use.</p>
        
        <p>Below is your production API Key. Please store it securely, as it cannot be shown again for security reasons:</p>
        
        <div class="code-box">
            ${apiKey}
        </div>
        
        <p>Ensure that all of your API requests include this key in the Authorization header as a Bearer token:</p>
        <div class="code-box" style="padding: 10px; font-size: 13px;">
            Authorization: Bearer ${apiKey}
        </div>

        <div style="text-align: center;">
            <a href="https://app.bitlancetechhub.com/docs" class="btn">View API Documentation</a>
        </div>
        
        <p>If you have any questions or require enterprise assistance, please reply directly to this email or reach out to our team at support@bitlancetechhub.com.</p>
        
        <p>Happy Building!<br><strong>Team Bitlance</strong></p>
    `;

    const html = getSystemEmailTemplate('Welcome to Bitlance AI – Your API Key is Ready', content);
    return sendMailtrapEmail(email, 'Welcome to Bitlance AI – Your API Key is Ready', html);
};

/**
 * Core monitor logic that checks all user credit balances periodically
 * and triggers relevant transactional usage warning/exhaustion emails.
 */
export const checkCreditUsageAndNotify = async () => {
    try {
        console.log('[CreditMonitor] Starting credit usage monitoring scan...');
        
        // 1. Fetch user credit rows. Fetch rows that have active balance > 0 or used_credits > 0
        const { data: creditRecords, error: fetchError } = await supabaseAdmin
            .from('user_credits')
            .select('user_id, balance, used_credits, email_50_sent, email_75_sent, email_90_sent, email_100_sent')
            .or('balance.gt.0,used_credits.gt.0');
            
        if (fetchError) {
            throw fetchError;
        }
        
        if (!creditRecords || creditRecords.length === 0) {
            console.log('[CreditMonitor] No active credit records found to check.');
            return;
        }

        console.log(`[CreditMonitor] Processing ${creditRecords.length} user credit records...`);

        for (const record of creditRecords) {
            const { 
                user_id, 
                balance, 
                used_credits, 
                email_50_sent, 
                email_75_sent, 
                email_90_sent, 
                email_100_sent 
            } = record;

            // Fetch user's email via Auth Admin API
            const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
            if (userError || !userData?.user?.email) {
                console.error(`[CreditMonitor] Failed to resolve email for user_id ${user_id}:`, userError?.message);
                continue;
            }
            
            const email = userData.user.email;
            
            // Calculate total_credits dynamically in real-time as balance + used_credits
            const total_credits = (balance || 0) + (used_credits || 0);
            if (total_credits <= 0) continue;

            const percentage = (used_credits / total_credits) * 100;
            const remaining = Math.max(0, total_credits - used_credits);

            // Determine if updates are needed
            const updates = {};
            let emailSent = false;
            let subject = '';
            let contentHtml = '';

            // 1. 100% Credits Exhausted
            if (percentage >= 100 && !email_100_sent) {
                subject = 'Your Bitlance Credits Have Been Exhausted';
                contentHtml = `
                    <h2 class="title" style="color: #dc2626;">Your Bitlance Credits Have Been Exhausted</h2>
                    <p>Hello,</p>
                    <p>Your current plan credits have been fully consumed.</p>
                    
                    <table class="stats-table">
                        <tr>
                            <td class="label">Total Credits:</td>
                            <td class="val">${total_credits.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Credits Used:</td>
                            <td class="val" style="color: #dc2626;">${used_credits.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Remaining Credits:</td>
                            <td class="val" style="font-weight: bold; color: #dc2626;">0</td>
                        </tr>
                    </table>

                    <p>To continue using Bitlance AI APIs without service interruption, please purchase additional credits or upgrade your plan.</p>
                    
                    <div style="text-align: center;">
                        <a href="https://app.bitlancetechhub.com/login?redirectTo=/dashboard/api-keys" class="btn" style="background-color: #dc2626;">Purchase Credits</a>
                    </div>
                    
                    <p>Best regards,<br><strong>Team Bitlance</strong></p>
                `;
                updates.email_100_sent = true;
                emailSent = true;
            } 
            // 2. 90% Credits Used
            else if (percentage >= 90 && !email_90_sent) {
                subject = 'Warning: Only 10% Credits Remaining';
                contentHtml = `
                    <h2 class="title" style="color: #d97706;">Warning: Only 10% Credits Remaining</h2>
                    <p>Hello,</p>
                    <p>You have consumed 90% of your credit quota. To ensure your applications continue working smoothly, consider upgrading soon.</p>
                    
                    <table class="stats-table">
                        <tr>
                            <td class="label">Total Credits:</td>
                            <td class="val">${total_credits.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Credits Used:</td>
                            <td class="val">${used_credits.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Remaining Credits:</td>
                            <td class="val" style="color: #d97706; font-weight: bold;">${remaining.toLocaleString()}</td>
                        </tr>
                    </table>

                    <div style="text-align: center;">
                        <a href="https://app.bitlancetechhub.com/login?redirectTo=/dashboard/api-keys" class="btn" style="background-color: #d97706;">Upgrade Plan</a>
                    </div>
                    
                    <p>Best regards,<br><strong>Team Bitlance</strong></p>
                `;
                updates.email_90_sent = true;
                emailSent = true;
            }
            // 3. 75% Credits Used
            else if (percentage >= 75 && !email_75_sent) {
                subject = '75% of Your Bitlance Credits Have Been Consumed';
                contentHtml = `
                    <h2 class="title" style="color: #d97706;">75% of Your Bitlance Credits Have Been Consumed</h2>
                    <p>Hello,</p>
                    <p>Your credit usage is approaching your plan limit. You have consumed 75% of your available credits.</p>
                    
                    <table class="stats-table">
                        <tr>
                            <td class="label">Total Credits:</td>
                            <td class="val">${total_credits.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Credits Used:</td>
                            <td class="val">${used_credits.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Remaining Credits:</td>
                            <td class="val" style="font-weight: bold;">${remaining.toLocaleString()}</td>
                        </tr>
                    </table>

                    <div style="text-align: center;">
                        <a href="https://app.bitlancetechhub.com/login?redirectTo=/dashboard/api-keys" class="btn">Manage Credits</a>
                    </div>
                    
                    <p>Best regards,<br><strong>Team Bitlance</strong></p>
                `;
                updates.email_75_sent = true;
                emailSent = true;
            }
            // 4. 50% Credits Used
            else if (percentage >= 50 && !email_50_sent) {
                subject = "You've Used 50% of Your Bitlance Credits";
                contentHtml = `
                    <h2 class="title">You've Used 50% of Your Bitlance Credits</h2>
                    <p>Hello,</p>
                    <p>You have reached 50% consumption of your current credit plan.</p>
                    
                    <table class="stats-table">
                        <tr>
                            <td class="label">Total Credits:</td>
                            <td class="val">${total_credits.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Credits Used:</td>
                            <td class="val">${used_credits.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td class="label">Remaining Credits:</td>
                            <td class="val" style="font-weight: bold;">${remaining.toLocaleString()}</td>
                        </tr>
                    </table>

                    <p>You can monitor your usage details anytime on your dashboard.</p>
                    
                    <div style="text-align: center;">
                        <a href="https://app.bitlancetechhub.com/login?redirectTo=/dashboard/api-keys" class="btn">View Dashboard</a>
                    </div>
                    
                    <p>Best regards,<br><strong>Team Bitlance</strong></p>
                `;
                updates.email_50_sent = true;
                emailSent = true;
            }

            if (emailSent) {
                const html = getSystemEmailTemplate(subject, contentHtml);
                const mailResult = await sendMailtrapEmail(email, subject, html);

                if (mailResult.success) {
                    // Update database sent flags
                    const { error: dbErr } = await supabaseAdmin
                        .from('user_credits')
                        .update(updates)
                        .eq('user_id', user_id);

                    if (dbErr) {
                        console.error(`[CreditMonitor] Failed to update email sent flags for user ${user_id}:`, dbErr.message);
                    } else {
                        console.log(`[CreditMonitor] Successfully sent credit usage notification (${subject}) to ${email}`);
                    }
                } else {
                    console.error(`[CreditMonitor] Failed to send email to ${email}:`, mailResult.error);
                }
            }
        }
        
        console.log('[CreditMonitor] Credit usage monitoring scan completed.');
    } catch (err) {
        console.error('[CreditMonitor] Error during credit monitoring check:', err.message);
    }
};

/**
 * Sends revocation email to client when their API Key is revoked by admin
 */
export const sendRevocationEmail = async (email, plan, apiKeyPrefix, label = '') => {
    const planFormatted = plan ? (plan.charAt(0).toUpperCase() + plan.slice(1)) : 'Starter';
    const labelText = label ? ` (Labeled: <strong>${label}</strong>)` : '';
    
    const content = `
        <h2 class="title" style="color: #dc2626;">Your Bitlance AI API Key has been Revoked</h2>
        <p>Hello,</p>
        <p>This is to notify you that your API key starting with <strong>${apiKeyPrefix}</strong> for the <strong>${planFormatted} Plan</strong>${labelText} has been revoked by the administrator.</p>
        
        <p>As a result, access to the Bitlance AI API has been permanently blocked. Any subsequent requests using this key will return a <code>403 Forbidden</code> error.</p>
        
        <p>If you believe this has occurred in error or if you wish to reactivate your access, please reply to this email.</p>
        
        <p>Best regards,<br><strong>Team Bitlance</strong></p>
    `;

    const html = getSystemEmailTemplate('Your Bitlance AI API Key has been Revoked', content);
    return sendMailtrapEmail(email, 'Your Bitlance AI API Key has been Revoked', html);
};
