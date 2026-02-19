import { firestore, messaging } from './firebaseService.js';

const TOKENS_COLLECTION = 'device_tokens';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const sendPushNotification = async ({ title, body, target = 'all', image, data }) => {
    if (!firestore || !messaging) {
        throw new Error('Firebase service unavailable');
    }

    // 1. Determine Target (Topic or Tokens)
    let message = {
        notification: {
            title,
            body,
            ...(image && { imageUrl: image })
        },
        data: data || {}
    };

    let successCount = 0;
    let failureCount = 0;
    let response;

    try {
        if (target === 'all' || target === 'topic') {
            // Use topic if explicitly requested or conceptually 'all'
            // However, 'all' currently maps to fetching tokens manually in your old logic.
            // Let's support an explicit 'topic' param in the input object or infer it.
            // If data.topic is provided, use it.
            const topic = data?.topic || 'blog_updates'; // Default topic

            // If we are sending to a topic
            if (target === 'topic' || (target === 'all' && data?.useTopic)) {
                message.topic = topic;
                // Note: send() is for single message/topic, sendEachForMulticast is for tokens
                const msgId = await messaging.send(message);
                successCount = 1; // Topic send counts as 1 successful request (fanout handled by FCM)
                response = { successCount: 1, failureCount: 0, messageId: msgId };
                console.log('Sent to topic:', topic);
                return { success: true, message: `Notification sent to topic ${topic}`, details: response };
            }
        }

        // Fallback to Token-based sending (original logic) if not topic
        // 1b. Fetch active tokens based on target if not generic topic
        let query = firestore.collection(TOKENS_COLLECTION).where('isActive', '==', true);

        if (target === 'ios') {
            query = query.where('platform', '==', 'ios');
        } else if (target === 'android') {
            query = query.where('platform', '==', 'android');
        }

        const snapshot = await query.get();
        const tokens = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            if (d.token) tokens.push(d.token);
        });

        if (tokens.length === 0) {
            return { success: true, message: 'No active device tokens found to send to.', successCount: 0 };
        }

        // 2. Prepare Message for Multicast
        message.tokens = tokens; // Add tokens array

        // 3. Send
        response = await messaging.sendEachForMulticast(message);
        successCount = response.successCount;
        failureCount = response.failureCount;

    } catch (err) {
        console.error("Push Service Error:", err);
        throw err;
    }

    // 4. Log to History
    await firestore.collection(NOTIFICATIONS_COLLECTION).add({
        title,
        body,
        target,
        sentAt: new Date().toISOString(),
        successCount: response.successCount,
        failureCount: response.failureCount,
        image: image || null
    });

    return {
        success: true,
        message: `Notification sent to ${response.successCount} devices`,
        details: response
    };
};
