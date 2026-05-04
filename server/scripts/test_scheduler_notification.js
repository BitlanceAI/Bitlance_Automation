import dotenv from 'dotenv';
import { sendPushNotification } from '../src/services/pushService.js';

dotenv.config();

const testSchedulerNotification = async () => {
    console.log('Testing scheduler notification logic...');

    // Mock post object similar to what scheduler receives from DB
    const mockPost = {
        id: 'test-post-123',
        topic: 'Test Blog Post Topic',
        title: 'Test Blog Post Title',
        seo_description: 'This is a test description for the scheduler notification.',
        slug: 'test-blog-post',
        notification_settings: {
            send: true // simulating default or explicit true
        }
    };

    try {
        console.log('Sending notification for mock post:', mockPost.title);

        const result = await sendPushNotification({
            title: mockPost.notification_settings?.title || mockPost.topic || mockPost.title || 'New Blog Post',
            body: mockPost.notification_settings?.body || mockPost.seo_description || 'Check out our latest article!',
            target: 'topic',
            data: {
                slug: mockPost.slug,
                topic: 'blog_updates',
                url: `/blogs/${mockPost.slug}`,
                useTopic: 'true' // ensure string for data payload just in case, though JS object is fine if handled
            }
        });

        console.log('Notification sent successfully:', result);
    } catch (error) {
        console.error('Failed to send notification:', error);
    }
};

testSchedulerNotification();
