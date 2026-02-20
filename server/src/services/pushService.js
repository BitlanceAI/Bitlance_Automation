import { firestore, messaging } from './firebaseService.js';

const TOKENS_COLLECTION = 'device_tokens';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const sendPushNotification = async ({ title, body, target = 'all', image, data }) => {
    if (!firestore || !messaging) {
        throw new Error('Firebase service unavailable');
    }

    // FCM requires ALL data values to be strings — convert everything
    const sanitizedData = {};
    if (data) {
        Object.entries(data).forEach(([key, val]) => {
            if (val !== null && val !== undefined) {
                sanitizedData[key] = String(val);
            }
        });
    }

    let message = {
        notification: {
            title: title || 'New Update',
            body: body || 'Check out our latest content!',
            ...(image && { imageUrl: image })
        },
        data: sanitizedData
    };

    let successCount = 0;
    let failureCount = 0;
    let response;

    try {
        // Fetch active tokens from Firestore
        let query = firestore.collection(TOKENS_COLLECTION).where('isActive', '==', true);

        if (target === 'ios') {
            query = query.where('platform', '==', 'ios');
        } else if (target === 'android') {
            query = query.where('platform', '==', 'android');
        }
        // 'all' fetches all platforms

        const snapshot = await query.get();
        const tokens = [];
        snapshot.forEach(doc => {
            const d = doc.data();
            if (d.token) tokens.push(d.token);
        });

        console.log(`[Push] Found ${tokens.length} active token(s) for target="${target}"`);

        if (tokens.length === 0) {
            console.warn('[Push] No active device tokens found. Make sure devices have registered tokens with isActive=true in Firestore.');
            return { success: true, message: 'No active device tokens found.', successCount: 0 };
        }

        // Send via multicast (up to 500 tokens per call)
        message.tokens = tokens;
        response = await messaging.sendEachForMulticast(message);
        successCount = response.successCount;
        failureCount = response.failureCount;

        // Log per-token results for debugging
        response.responses.forEach((r, idx) => {
            if (r.success) {
                console.log(`[Push] ✅ Token[${idx}] sent successfully. MessageId: ${r.messageId}`);
            } else {
                console.error(`[Push] ❌ Token[${idx}] failed. Code: ${r.error?.code} | Message: ${r.error?.message}`);
                // Mark stale tokens as inactive
                if (
                    r.error?.code === 'messaging/invalid-registration-token' ||
                    r.error?.code === 'messaging/registration-token-not-registered'
                ) {
                    const staleToken = tokens[idx];
                    firestore.collection(TOKENS_COLLECTION).doc(staleToken).update({ isActive: false })
                        .then(() => console.log(`[Push] Marked stale token as inactive: ${staleToken.slice(0, 10)}...`))
                        .catch(e => console.error('[Push] Failed to mark stale token:', e.message));
                }
            }
        });

        console.log(`[Push] Result: ${successCount} success, ${failureCount} failed`);

    } catch (err) {
        console.error('[Push] Service Error:', err);
        throw err;
    }

    // Log to Firestore history
    try {
        await firestore.collection(NOTIFICATIONS_COLLECTION).add({
            title,
            body,
            target,
            sentAt: new Date().toISOString(),
            successCount,
            failureCount,
            image: image || null
        });
    } catch (logErr) {
        console.warn('[Push] Could not log to Firestore history:', logErr.message);
    }

    return {
        success: true,
        message: `Notification sent to ${successCount} device(s)`,
        details: { successCount, failureCount }
    };
};
