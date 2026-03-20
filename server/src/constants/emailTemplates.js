/**
 * Email template for PDF/Guide delivery (Path A: Download)
 * @param {object} lead - The lead object from Supabase
 * @returns {string} HTML email content
 */
export const PDF_DELIVERY_TEMPLATE = (lead) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden;">
        <tr>
            <td style="padding:40px 30px; text-align:center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">Your CRM Automation Guide 📦</h1>
            </td>
        </tr>
        <tr>
            <td style="padding:30px;">
                <p style="font-size:16px; color:#333;">Hi ${lead.name || 'there'},</p>
                <p style="font-size:16px; color:#333; line-height:1.6;">
                    Thank you for downloading our CRM Automation Guide! Inside, you'll discover proven strategies
                    to automate your lead management, reduce response times, and increase conversions.
                </p>
                <div style="text-align:center; margin:30px 0;">
                    <a href="#" style="display:inline-block; padding:14px 32px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; text-decoration:none; border-radius:6px; font-size:16px; font-weight:bold;">
                        📥 Download Your Guide
                    </a>
                </div>
                <p style="font-size:14px; color:#666; line-height:1.6;">
                    Have questions? Just reply to this email — we're happy to help.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding:20px 30px; background:#f8f8f8; text-align:center;">
                <p style="font-size:12px; color:#999; margin:0;">© ${new Date().getFullYear()} South Bay Investment. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Email template for booking confirmation
 * @param {string} name - Lead's name
 * @param {string|null} formattedTime - Formatted booking time string, or null
 * @returns {string} HTML email content
 */
export const BOOKING_CONFIRMATION_TEMPLATE = (name, formattedTime) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden;">
        <tr>
            <td style="padding:40px 30px; text-align:center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                <h1 style="color:#ffffff; margin:0; font-size:24px;">Your Strategy Session is Confirmed! ✅</h1>
            </td>
        </tr>
        <tr>
            <td style="padding:30px;">
                <p style="font-size:16px; color:#333;">Hi ${name || 'there'},</p>
                <p style="font-size:16px; color:#333; line-height:1.6;">
                    Great news — your strategy session has been confirmed!
                </p>
                ${formattedTime ? `
                <div style="background:#f0fdf4; border-left:4px solid #38ef7d; padding:16px 20px; margin:20px 0; border-radius:4px;">
                    <p style="margin:0; font-size:16px; color:#333;">
                        📅 <strong>${formattedTime}</strong>
                    </p>
                </div>
                ` : ''}
                <p style="font-size:16px; color:#333; line-height:1.6;">
                    We'll walk you through how AI-powered automation can transform your lead management
                    and help you close more deals with less effort.
                </p>
                <p style="font-size:14px; color:#666; line-height:1.6;">
                    Need to reschedule? Just reply to this email and we'll sort it out.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding:20px 30px; background:#f8f8f8; text-align:center;">
                <p style="font-size:12px; color:#999; margin:0;">© ${new Date().getFullYear()} South Bay Investment. All rights reserved.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Remarketing reminder email — sent to leads who downloaded but haven't booked.
 * The CTA link pre-fills the booking form with their data.
 * @param {object} lead - The lead object from Supabase
 * @returns {string} HTML email content
 */
export const REMINDER_EMAIL_TEMPLATE = (lead) => {
    const bookingUrl = `https://www.bitlancetechhub.com/apply/audit?email=${encodeURIComponent(lead.email || '')}&name=${encodeURIComponent(lead.name || '')}&phoneno=${encodeURIComponent(lead.phone || '')}&lid=${lead.id || ''}`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin:0; padding:0; background:#f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background:#fff; border-radius:8px; border-top: 4px solid #3b82f6; }
        h2 { color: #1e3a8a; }
        .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; font-size: 15px; }
        .footer { margin-top: 30px; font-size: 12px; color: #888; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Hi ${lead.name || 'there'}, let's automate your growth.</h2>
        <p>I noticed you downloaded our automation guide recently.</p>
        <p>Reading the guide is a great first step — but if you want to skip the trial-and-error phase, we can show you exactly how this system applies to <strong>your specific business model</strong>.</p>
        <p>Let's hop on a quick <strong>15-minute strategy call</strong>. No sales pressure, just pure value.</p>

        <center>
            <a href="${bookingUrl}" class="btn">📅 Book Your Free Strategy Demo</a>
        </center>

        <p style="margin-top:24px;">Looking forward to speaking with you!</p>
        <p><strong>— The Bitlance Team</strong></p>

        <div class="footer">
            <p>You received this email because you opted in on our website.<br>
            <a href="#" style="color:#888;">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>
`;
};

