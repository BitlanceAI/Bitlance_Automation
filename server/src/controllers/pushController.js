import { firestore, messaging } from '../services/firebaseService.js';

// Collection references
const TOKENS_COLLECTION = 'device_tokens';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const registerToken = async (req, res) => {
    try {
        const { token, platform, deviceId } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, error: 'Token is required' });
        }

        if (!firestore) {
            return res.status(503).json({ success: false, error: 'Firebase service unavailable' });
        }

        const tokenData = {
            token,
            platform: platform || 'unknown',
            deviceId: deviceId || 'unknown',
            isActive: true,
            lastUpdated: new Date().toISOString()
        };

        // Use token as document ID to prevent duplicates easily
        // Or use deviceId if available and consistent
        await firestore.collection(TOKENS_COLLECTION).doc(token).set(tokenData, { merge: true });

        res.json({ success: true, message: 'Token registered successfully' });
    } catch (error) {
        console.error('Error registering token:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const listTokens = async (req, res) => {
    try {
        if (!firestore) {
            return res.status(503).json({ success: false, error: 'Firebase service unavailable' });
        }
        const snapshot = await firestore.collection(TOKENS_COLLECTION).get();
        const tokens = [];
        snapshot.forEach(doc => {
            tokens.push({ id: doc.id, ...doc.data() });
        });
        res.json({ success: true, tokens });
    } catch (error) {
        console.error('Error listing tokens:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const toggleToken = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!firestore) {
            return res.status(503).json({ success: false, error: 'Firebase service unavailable' });
        }

        await firestore.collection(TOKENS_COLLECTION).doc(id).update({
            isActive: isActive,
            lastUpdated: new Date().toISOString()
        });

        res.json({ success: true, message: 'Token updated successfully' });
    } catch (error) {
        console.error('Error toggling token:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteToken = async (req, res) => {
    try {
        const { id } = req.params;

        if (!firestore) {
            return res.status(503).json({ success: false, error: 'Firebase service unavailable' });
        }

        await firestore.collection(TOKENS_COLLECTION).doc(id).delete();
        res.json({ success: true, message: 'Token deleted successfully' });
    } catch (error) {
        console.error('Error deleting token:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

import { sendPushNotification } from '../services/pushService.js';

export const sendNotification = async (req, res) => {
    try {
        const { title, body, target = 'all', image, data } = req.body;

        if (!title || !body) {
            return res.status(400).json({ success: false, error: 'Title and Body are required' });
        }

        const result = await sendPushNotification({ title, body, target, image, data });
        res.json(result);

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
