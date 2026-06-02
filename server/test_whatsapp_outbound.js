import dotenv from 'dotenv';

dotenv.config();

const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const GLOBAL_TOKEN = process.env.WHATSAPP_GLOBAL_TOKEN;
const TARGET_PHONE = '8318768905';

async function sendTestMessage() {
    console.log('======================================================================');
    console.log('1. RUNNING DYNAMIC OUTBOUND WHATSAPP DELIVERY ENGINE TEST');
    console.log('======================================================================');
    
    if (!PHONE_ID || !GLOBAL_TOKEN) {
        console.error('❌ Configuration Error: WHATSAPP_PHONE_ID or WHATSAPP_GLOBAL_TOKEN is missing in .env');
        process.exit(1);
    }
    
    console.log(`• Phone Number ID: ${PHONE_ID}`);
    console.log(`• Recipient Number: ${TARGET_PHONE}`);
    console.log('• Delivering message payload via Meta Cloud API...');

    // Meta API Endpoint (v21.0 or default to v18.0)
    const url = `https://graph.facebook.com/v21.0/${PHONE_ID}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: TARGET_PHONE,
        type: "text",
        text: {
            preview_url: false,
            body: "Hello! This is a live verification check from the Bitlance Automation outbound WhatsApp engine to confirm API integration."
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GLOBAL_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('\n🟢 Meta API request COMPLETED successfully!');
            console.log('• Message ID:', data.messages?.[0]?.id);
            console.log('• Contact Input:', data.contacts?.[0]?.input);
        } else {
            console.error('\n🔴 Meta API request FAILED:');
            console.error(`• Status Code: ${response.status}`);
            console.error('• Error Detail:', JSON.stringify(data.error, null, 2));
            
            // Helpful troubleshooting for Meta Cloud API common errors
            if (data.error?.code === 190) {
                console.warn('\n💡 Tip: The token provided is invalid or expired. Re-authenticate with Meta OAuth.');
            } else if (data.error?.code === 33) {
                console.warn('\n💡 Tip: The recipient number is not registered/active on WhatsApp.');
            }
        }
    } catch (err) {
        console.error('\n❌ Exception during delivery execution:', err.message);
    }
    console.log('======================================================================');
}

sendTestMessage();
