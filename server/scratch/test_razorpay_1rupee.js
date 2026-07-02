// Test ₹1 payment order creation directly with Razorpay API
import dotenv from 'dotenv';
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
    console.error('❌ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in .env');
    process.exit(1);
}

const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
const amount = 1; // ₹1 in INR
const amountPaise = Math.round(amount * 100); // 100 paise = ₹1

console.log(`Testing Razorpay order creation with amount: ₹${amount} (${amountPaise} paise)`);
console.log(`Using Key ID: ${keyId.substring(0, 10)}...`);

try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount: amountPaise,
            currency: 'INR',
            receipt: `TEST-${Date.now()}`,
            notes: { test: true }
        })
    });

    const data = await res.json();

    if (res.ok) {
        console.log('✅ Razorpay order created successfully!');
        console.log('Order ID:', data.id);
        console.log('Amount:', data.amount, 'paise');
        console.log('Status:', data.status);
    } else {
        console.error('❌ Razorpay API Error:', JSON.stringify(data, null, 2));
        console.error('HTTP Status:', res.status);
    }
} catch (err) {
    console.error('❌ Request failed:', err.message);
}
