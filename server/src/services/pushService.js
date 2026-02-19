import { firestore, messaging } from './firebaseService.js';

const TOKENS_COLLECTION = 'device_tokens';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const sendPushNotification = async ({ title, body, target = 'all', image, data }) => {
    if (!firestore || !messaging) {
        throw new Error('Firebase service unavailable');
    }

    // 1. Fetch active tokens based on target
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

    // 2. Prepare Message
    const message = {
        notification: {
            title,
            body,
            ...(image && { imageUrl: image })
        },
        data: data || {},
        tokens: tokens
    };

    // 3. Send
    const response = await messaging.sendEachForMulticast(message);

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
