import dotenv from 'dotenv';
dotenv.config();

const appId = process.env.ONESIGNAL_APP_ID;
const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

/**
 * Sends a remarketing email via OneSignal REST API (v2 key compatible)
 * @param {Array<string>} userEmails - The emails to target
 * @param {string} subject - Email subject line
 * @param {string} body - HTML email body
 */
export const sendRemarketingEmail = async (userEmails, subject, body) => {
    try {
        if (!appId || !restApiKey) {
            throw new Error('OneSignal configuration missing from environment variables.');
        }

        const payload = {
            app_id: appId,
            // Target by email tokens
            include_email_tokens: userEmails,
            // Email channel content
            email_subject: subject,
            email_body: body,
            // Explicitly set channel to email only
            channel_for_external_user_ids: "email"
        };

        const response = await fetch('https://api.onesignal.com/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${restApiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OneSignal API Error:', data);
            throw new Error(data.errors?.[0] || JSON.stringify(data));
        }

        console.log('OneSignal email sent successfully:', data);
        return { success: true, response: data };

    } catch (error) {
        console.error('Error sending OneSignal remarketing email:', error);
        return { success: false, error: error.message };
    }
};

export default {
    sendRemarketingEmail
};
