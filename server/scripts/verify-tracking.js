
// ESM or CJS agnostic if no imports used.
// Relies on global fetch (Node 18+)

async function verifyTracking() {
    try {
        console.log('Testing Tracking Endpoint: http://localhost:3001/api/track');

        const response = await fetch('http://localhost:3001/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventName: 'PageView',
                userData: {
                    email: 'test-verification@example.com'
                },
                sourceUrl: 'http://localhost:3000/verification-test'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);

        if (response.ok && data.success) {
            console.log('SUCCESS: Tracking endpoint verified.');
        } else {
            console.error('FAILURE: Tracking endpoint returned error or success=false.');
            process.exit(1);
        }
    } catch (error) {
        console.error('ERROR: Failed to connect to tracking endpoint. ensure server is running.', error.message);
        process.exit(1);
    }
}

verifyTracking();
