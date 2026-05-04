import whatsappService from '../src/services/whatsappService.js';

// Mock getMetaCredentials to bypass DB
whatsappService.getMetaCredentials = async () => {
    console.log('[Test] Mocking Meta Credentials');
    return {
        whatsappPhoneId: '123456789',
        accessToken: 'mock_token',
        wabaId: 'mock_waba'
    };
};

// Mock axios.post to prevent actual network call and just log the payload
// Since we can't easily mock the internal axios import without a test framework,
// we will rely on the fact that the service will try to make a call.
// We'll wrap the call in a try/catch and inspect the logs we added, 
// OR better: we can overwrite the `sendMediaMessage` method's reliance on axios 
// if we could, but we can't easily.
// However, the `sendMediaMessage` function logs the transformation *before* the axios call.
// So we just need to run it.

const testCloudinaryUrl = 'https://res.cloudinary.com/demo/video/upload/dog.mp4';
const testNormalUrl = 'https://example.com/video.mp4';

async function runTest() {
    console.log('--- Test 1: Cloudinary Video ---');
    try {
        await whatsappService.sendMediaMessage('test_user', '1234567890', testCloudinaryUrl, 'video');
    } catch (e) {
        console.log('[Test] Expected error (network/mock):', e.message);
    }

    console.log('\n--- Test 2: Normal Video ---');
    try {
        await whatsappService.sendMediaMessage('test_user', '1234567890', testNormalUrl, 'video');
    } catch (e) {
        console.log('[Test] Expected error (network/mock):', e.message);
    }
}

runTest();
