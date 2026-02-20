import twilio from 'twilio';
import nodemailer from 'nodemailer';

// Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || process.env.FROM_NUMBER;

// Initialize Nodemailer Transport
// Using standard SMTP configuration (replace with your provider's credentials)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Helper: Send WhatsApp Message via Twilio
const sendWhatsApp = async (to, message) => {
    if (!twilioClient) {
        console.warn('⚠️ Twilio config missing. Skipping WhatsApp message to:', to);
        return;
    }

    try {
        // Twilio requires 'whatsapp:' prefix for WhatsApp messages
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : '+91' + to}`;
        const formattedFrom = TWILIO_FROM.startsWith('whatsapp:') ? TWILIO_FROM : `whatsapp:${TWILIO_FROM}`;

        const response = await twilioClient.messages.create({
            body: message,
            from: formattedFrom,
            to: formattedTo
        });
        console.log(`✅ WhatsApp sent to ${formattedTo}. SID: ${response.sid}`);
    } catch (error) {
        console.error(`❌ Failed to send WhatsApp to ${to}:`, error.message);
    }
};

// Helper: Send Email via Nodemailer
const sendEmail = async (to, subject, htmlContent) => {
    if (!process.env.SMTP_USER && process.env.SMTP_HOST !== 'smtp.ethereal.email') {
        console.warn('⚠️ SMTP config missing. Skipping Email to:', to);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"South Bay Investment" <${process.env.SMTP_USER || 'noreply@southbay.com'}>`,
            to,
            subject,
            html: htmlContent
        });
        console.log(`✅ Email sent to ${to}. MessageId: ${info.messageId}`);
    } catch (error) {
        console.error(`❌ Failed to send Email to ${to}:`, error.message);
    }
};


// -----------------------------------------------------
// MAIN CONTROLLER FUNCTION
// -----------------------------------------------------
export const bookAudit = async (req, res) => {
    try {
        const { leadData, booking } = req.body;

        if (!leadData || !booking || !booking.date || !booking.time) {
            return res.status(400).json({ error: 'Missing lead or booking details.' });
        }

        const { name, email, whatsapp, revenue, lead_volume, marketing_spend, real_estate_type } = leadData;
        const auditDateTime = new Date(`${booking.date.split('T')[0]}T${convertTo24Hour(booking.time)}:00.000Z`);

        console.log(`\n📅 New AI Audit Booked by ${name} (${whatsapp}) for ${auditDateTime}`);

        // --- 1. IMMEDIATE ACTIONS ---

        // A) Send WhatsApp Confirmation
        const whatsappMsg = `Hi ${name}, your AI Growth Audit is confirmed for ${booking.time} on ${new Date(booking.date).toLocaleDateString()}. \n\nWe look forward to showing you how AI can reduce your CAC. Talk soon!`;
        await sendWhatsApp(whatsapp, whatsappMsg);

        // B) Send Email 1 (Confirmation)
        const email1Subject = 'Booking Confirmed: Your Real Estate AI Audit';
        const email1Html = `
            <h3>Hi ${name},</h3>
            <p>Your AI Growth Audit has been successfully scheduled.</p>
            <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${booking.time} (IST)</p>
            <br/>
            <p>Please come prepared with your current lead costs and CRM metrics so we can dive straight into identifying automation opportunities.</p>
            <p>See you then!</p>
        `;
        await sendEmail(email, email1Subject, email1Html);


        // --- 2. SCHEDULED NURTURE ACTIONS ---
        // For MVP, we use setTimeout. In production, consider BullMQ, Redis, or a cron DB scheduler.

        const now = new Date();
        const timeUntilAudit = auditDateTime.getTime() - now.getTime();

        // C) Schedule Email 2 (Case Study) -> 24 hours from now
        const delay24h = 24 * 60 * 60 * 1000;
        if (timeUntilAudit > delay24h) {
            console.log(`🕒 Scheduling Email 2 (Case Study) for ${name} in 24 hours...`);
            setTimeout(() => {
                const email2Subject = 'Case Study: How we dropped CAC by 40% for a luxury builder';
                const email2Html = `
                    <h3>Hi ${name},</h3>
                    <p>Before our call, I wanted to share a quick case study of how another Real Estate developer implemented AI voice agents to follow up with leads within 5 minutes, resulting in a 40% decrease in Customer Acquisition Cost.</p>
                    <p>[Link to PDF Case Study]</p>
                    <p>We'll discuss how similar strategies apply to your ${real_estate_type} projects.</p>
                `;
                sendEmail(email, email2Subject, email2Html);
            }, delay24h); // 24 hours
        }

        // D) Schedule Email 3 (Reminder) -> 1 hour before audit
        const delay1hBefore = timeUntilAudit - (60 * 60 * 1000);
        if (delay1hBefore > 0) {
            console.log(`🕒 Scheduling Email 3 (Reminder) for ${name} at ${new Date(now.getTime() + delay1hBefore).toLocaleString()}...`);
            setTimeout(() => {
                const email3Subject = 'Reminder: Your AI Audit is in 1 hour';
                const email3Html = `
                    <h3>Hi ${name},</h3>
                    <p>Just a quick reminder that our AI Growth Audit is starting in exactly 1 hour.</p>
                    <p>Here's the link to join: [Zoom/Google Meet Link]</p>
                    <p>See you shortly!</p>
                `;
                sendEmail(email, email3Subject, email3Html);
            }, delay1hBefore);
        }

        // Return success
        return res.status(200).json({
            success: true,
            message: 'Booking confirmed and nurture sequence initiated.'
        });

    } catch (error) {
        console.error('Error booking audit:', error);
        return res.status(500).json({ error: 'Internal server error during booking.' });
    }
};

// Helper to convert "02:00 PM" -> "14:00" for Date generation
function convertTo24Hour(time12h) {
    if (!time12h) return "00:00";
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours}:${minutes}`;
}
