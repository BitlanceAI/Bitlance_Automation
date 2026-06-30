import { sendMailtrapEmail } from './mailtrapService.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Resolve the logo path relative to this file's location
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const _logoPath = path.resolve(__dirname, '../../../../../billing-dashboard/public/logo.jpg');
let _logoBase64 = '';
try {
    _logoBase64 = `data:image/jpeg;base64,${readFileSync(_logoPath).toString('base64')}`;
} catch {
    // Fallback to hosted URL if file not found
    _logoBase64 = 'https://lotlite.bitlancetechhub.com/logo.jpg';
}

/**
 * Sends a styled welcome verification email containing account info,
 * getting started steps, and terms & conditions.
 *
 * @param {object} user - Supabase user object
 * @param {string} fullName - Full name of the registered user
 */
export const sendSignupWelcomeEmail = async (user, fullName, verificationLink) => {
    try {
        const clientUrl = process.env.CLIENT_URL || 'https://lotlite.bitlancetechhub.com';
        const logoUrl = `${clientUrl}/logo.jpg`;
        
        const firstName = fullName ? fullName.split(' ')[0] : 'there';
        const dynamicName = fullName || user.email.split('@')[0];
        const accountId = `ACC-${(user.id || Math.random().toString(36).slice(2, 10)).slice(0, 8).toUpperCase()}`;
        
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const registrationDate = new Date().toLocaleDateString('en-US', options);

        const emailSubject = "Confirm your email address - Bitlance Voice AI Agent! 🎙";

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Bitlance Voice AI Agent</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            color: #1e293b;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #ffffff;
            padding: 32px 32px 8px;
            text-align: center;
        }
        .header img {
            height: 48px;
            width: auto;
            border-radius: 8px;
            display: inline-block;
        }
        .hero {
            padding: 40px 40px 20px;
            text-align: center;
        }
        .hero-badge {
            display: inline-block;
            background-color: #ecfeff;
            color: #0891b2;
            font-size: 12px;
            font-weight: 700;
            padding: 6px 16px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
        }
        .hero h1 {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 12px;
            letter-spacing: -0.02em;
        }
        .hero p {
            font-size: 15px;
            color: #475569;
            line-height: 1.6;
            margin: 0;
        }
        .content {
            padding: 0 40px 40px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin: 28px 0 12px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 8px;
        }
        .step-list {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .step-item {
            position: relative;
            padding-left: 32px;
            margin-bottom: 16px;
            font-size: 14px;
            color: #475569;
            line-height: 1.6;
        }
        .step-item::before {
            content: "•";
            position: absolute;
            left: 12px;
            top: 0;
            color: #0891b2;
            font-weight: bold;
            font-size: 18px;
        }
        .btn-container {
            text-align: center;
            margin: 32px 0 16px;
        }
        .btn {
            display: inline-block;
            background-color: #0891b2;
            color: #ffffff !important;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(8, 145, 178, 0.2), 0 2px 4px -1px rgba(8, 145, 178, 0.1);
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #0e7490;
        }
        .info-card {
            background-color: #f0f9ff;
            border: 1px solid #e0f2fe;
            border-radius: 12px;
            padding: 16px 20px;
            font-size: 13.5px;
            color: #0369a1;
            line-height: 1.6;
            margin-top: 20px;
        }
        .info-card a {
            color: #0284c7;
            text-decoration: underline;
            font-weight: 700;
        }
        .footer {
            background-color: #f8fafc;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.6;
        }
        .footer a {
            color: #0891b2;
            text-decoration: none;
            font-weight: 600;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <img src="${logoUrl}" alt="Bitlance Voice AI Agent">
            </div>
            
            <div class="hero">
                <span class="hero-badge">🎙 Email Verification</span>
                <h1>Verify Your Email Address</h1>
                <p>Welcome to Bitlance Voice AI Agent! Please verify your email to activate your account.</p>
            </div>
            
            <div class="content">
                <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
                    Hi ${firstName},
                </p>
                <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
                    Thank you for signing up for Voice AI Agent! We're thrilled to have you on board. Your account is ready to use as soon as you confirm your email.
                </p>
                <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
                    Below is a summary of your account details and what to expect next.
                </p>
                
                <div class="section-title">📋 Your Account Details</div>
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #64748b; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Full Name</td>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${dynamicName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #64748b; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Email Address</td>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${user.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #64748b; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Account ID</td>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; font-family: monospace; letter-spacing: 0.5px;">${accountId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #64748b; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Plan</td>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Free Trial (10 Credits)</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-size: 14px; color: #64748b; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Registration Date</td>
                        <td style="padding: 10px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${registrationDate}</td>
                    </tr>
                </table>
                
                <div class="section-title">🚀 Getting Started</div>
                <ul class="step-list">
                    <li class="step-item">Log in to your dashboard at <a href="${clientUrl}" style="color: #0891b2; text-decoration: none; font-weight: 600;">app.voiceaiagent.com</a> using your registered email and password.</li>
                    <li class="step-item">Set up your first Voice AI Agent by following the quick-start wizard in the dashboard.</li>
                    <li class="step-item">Customize your agent's voice, language, and response behavior from the Settings panel.</li>
                    <li class="step-item">Integrate your agent with your platform via our easy-to-use API (documentation available in the developer portal).</li>
                    <li class="step-item">Test your agent using our built-in simulator before going live.</li>
                </ul>
                
                <div class="btn-container">
                    <a href="${verificationLink || clientUrl}" class="btn">Confirm Email Address</a>
                </div>
                
                <div class="info-card">
                    <strong>📄 Terms & Conditions Acknowledgment</strong><br>
                    By completing your registration, you have agreed to our 
                    <a href="${clientUrl}/?showTerms=true" target="_blank">Terms and Conditions of Service</a>. 
                    If you did not agree to these terms or did not sign up for this account, please contact us immediately at 
                    <a href="mailto:ceo@bitlancetechhub.com">ceo@bitlancetechhub.com</a>.
                </div>
                
                <div class="section-title">🔐 Security Reminder</div>
                <p style="font-size: 13.5px; color: #64748b; line-height: 1.6; margin: 0 0 16px;">
                    For your security, please remember:
                </p>
                <ul class="step-list" style="margin-bottom: 0;">
                    <li class="step-item" style="font-size: 13px;">Never share your password or API keys with anyone.</li>
                    <li class="step-item" style="font-size: 13px;">We will never ask for your password via email or phone.</li>
                    <li class="step-item" style="font-size: 13px;">If you suspect unauthorized activity, contact <a href="mailto:ceo@bitlancetechhub.com" style="color: #0891b2; text-decoration: none;">ceo@bitlancetechhub.com</a> immediately.</li>
                </ul>
            </div>
            
            <div class="footer">
                <p style="font-weight: 700; color: #475569; margin: 0 0 4px;">📞 Need Help?</p>
                <p style="margin: 0 0 16px;">
                    Our support team is available to assist you via email at 
                    <a href="mailto:ceo@bitlancetechhub.com">ceo@bitlancetechhub.com</a> or via live chat in the dashboard.
                </p>
                <p style="margin: 0 0 16px; font-style: italic;">
                    "We're excited to have you on board. Let's build something amazing together!"
                </p>
                <p style="margin: 0 0 20px; font-weight: 600; color: #475569;">
                    Warm regards,<br>
                    The BITLANCE Voice AI Agent Team<br>
                    <a href="https://www.bitlancetechub.com" target="_blank">www.bitlancetechub.com</a>
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px;">
                    <tr>
                        <td align="left" style="font-size: 11px; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5;">
                            &copy; 2026 Bitlance Voice AI Agent. All Rights Reserved. &nbsp;|&nbsp; 
                            <a href="${clientUrl}/?showTerms=true" target="_blank" style="color: #0891b2; text-decoration: underline; font-weight: 600;">Terms & Conditions</a>
                        </td>
                        <td align="right" style="padding-left: 10px; width: 80px; vertical-align: middle;">
                            <img src="${logoUrl}" alt="Logo" style="height: 20px; width: auto; display: block; float: right;">
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const res = await sendMailtrapEmail(user.email, emailSubject, emailHtml);
        console.log(`[SignupEmail] Send status for ${user.email}:`, res);
    } catch (err) {
        console.error('[SignupEmail] Failed to send welcome email:', err.message);
    }
};

export const sendPurchaseSuccessEmail = async (email, fullName, amount, planName, planType, creditsAdded, newBalance) => {
    try {
        const clientUrl = process.env.CLIENT_URL || 'https://lotlite.bitlancetechhub.com';
        const logoUrl = `${clientUrl}/logo.jpg`;
        
        const firstName = fullName ? fullName.split(' ')[0] : 'there';
        const dynamicName = fullName || email.split('@')[0];
        
        const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        const purchaseDate = new Date().toLocaleDateString('en-US', options);

        const emailSubject = `Payment Confirmed: Thank you for your purchase! 🎉`;

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Confirmation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            color: #1e293b;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #ffffff;
            padding: 32px 32px 8px;
            text-align: center;
        }
        .header img {
            height: 48px;
            width: auto;
            border-radius: 8px;
            display: inline-block;
        }
        .hero {
            padding: 40px 40px 20px;
            text-align: center;
        }
        .hero-badge {
            display: inline-block;
            background-color: #f0fdf4;
            color: #16a34a;
            font-size: 12px;
            font-weight: 700;
            padding: 6px 16px;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
        }
        .hero h1 {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 12px;
            letter-spacing: -0.02em;
        }
        .hero p {
            font-size: 15px;
            color: #475569;
            line-height: 1.6;
            margin: 0;
        }
        .content {
            padding: 0 40px 40px;
        }
        .info-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-top: 16px;
        }
        .info-row {
            margin-bottom: 14px;
            font-size: 14px;
            color: #475569;
            line-height: 1.5;
        }
        .info-row:last-child {
            margin-bottom: 0;
            border-top: 1px solid #e2e8f0;
            padding-top: 14px;
            margin-top: 14px;
        }
        .info-label {
            font-weight: 600;
            color: #64748b;
            display: inline-block;
            width: 150px;
        }
        .info-value {
            font-weight: 700;
            color: #0f172a;
        }
        .highlight-value {
            color: #16a34a;
            font-weight: 800;
        }
        .footer {
            background-color: #f8fafc;
            padding: 32px 40px;
            border-top: 1px solid #e2e8f0;
            font-size: 13px;
            color: #64748b;
            line-height: 1.6;
        }
        .footer a {
            color: #0891b2;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <img src="${logoUrl}" alt="BITLANCE Logo">
            </div>
            
            <div class="hero">
                <div class="hero-badge">Payment Confirmed</div>
                <h1>Thank You!</h1>
                <p>Hi ${firstName},</p>
                <p style="margin-top: 8px;">
                    Thank you! We've successfully processed your payment. Below is a summary of your purchase and updated credit details.
                </p>
            </div>
            
            <div class="content">
                <div class="info-card">
                    <div class="info-row">
                        <span class="info-label">Customer Name</span>
                        <span class="info-value">${dynamicName}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email Address</span>
                        <span class="info-value">${email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Plan Purchased</span>
                        <span class="info-value">${planName} (${planType === 'seo_geo' ? 'SEO & GEO Agent' : 'Email Automation'})</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Amount Paid</span>
                        <span class="info-value">₹${amount}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Credits Added</span>
                        <span class="highlight-value">+${creditsAdded.toLocaleString()} Credits</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Total Balance</span>
                        <span class="info-value" style="color: #0891b2; font-size: 16px;">${newBalance.toLocaleString()} Credits</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Transaction Date</span>
                        <span class="info-value">${purchaseDate}</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p style="font-weight: 700; color: #475569; margin: 0 0 4px;">📞 Need Support?</p>
                <p style="margin: 0 0 16px;">
                    If you have any questions, encounter any issues, or require assistance, please reply directly to this email or reach out to us at 
                    <a href="mailto:ceo@bitlancetechhub.com">ceo@bitlancetechhub.com</a>.
                </p>
                <p style="margin: 0 0 16px; font-style: italic;">
                    "Thank you for choosing BITLANCE Voice AI Agent. Enjoy building and automating!"
                </p>
                <p style="margin: 0 0 20px; font-weight: 600; color: #475569;">
                    Warm regards,<br>
                    The BITLANCE Voice AI Agent Team<br>
                    <a href="https://www.bitlancetechub.com" target="_blank">www.bitlancetechub.com</a>
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px;">
                    <tr>
                        <td align="left" style="font-size: 11px; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5;">
                            &copy; 2026 Bitlance Voice AI Agent. All Rights Reserved. &nbsp;|&nbsp; 
                            <a href="${clientUrl}/?showTerms=true" target="_blank" style="color: #0891b2; text-decoration: underline; font-weight: 600;">Terms & Conditions</a>
                        </td>
                        <td align="right" style="padding-left: 10px; width: 80px; vertical-align: middle;">
                            <img src="${logoUrl}" alt="Logo" style="height: 20px; width: auto; display: block; float: right;">
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        await sendMailtrapEmail(email, emailSubject, emailHtml);
        console.log(`[PurchaseEmail] Send status: success for ${email}`);
    } catch (err) {
        console.error('[PurchaseEmail] Failed to send purchase confirmation email:', err.message);
    }
};
