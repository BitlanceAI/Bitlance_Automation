import dotenv from 'dotenv';
import { sendPushNotification } from '../src/services/pushService.js';

dotenv.config();

const main = async () => {
    console.log('Sending test notification...');
    try {
        const result = await sendPushNotification({
            title: 'Test Notification',
            body: 'If you see this, FCM is working correctly via topic!',
            target: 'topic',
            data: {
                topic: 'blog_updates',
                test: 'true'
            }
        });
        console.log('Result:', result);
    } catch (error) {
        console.error('Test Failed:', error);
    }
    process.exit();
};

main();
