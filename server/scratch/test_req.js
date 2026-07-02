import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const res = await fetch('https://backend.bitlancetechhub.com/api/billing/call-history?limit=250', {
        headers: {
            'Authorization': 'Bearer dummy-token-for-dev'
        }
    });
    const data = await res.json();
    console.log("Success:", data.success);
    if (data.success) {
        console.log("Total calls returned:", data.calls.length);
        data.calls.forEach(c => {
            console.log(`- Call ID: ${c.call_id}, Org: ${c.organization_id}, Number: ${c.customer_number}`);
        });
    } else {
        console.error("Error:", data.error);
    }
}
run();
