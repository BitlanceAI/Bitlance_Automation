import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
let serviceAccount = null;

try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        // Robust key handling: remove potentially extra wrapping quotes and replace escaped newlines
        const rawKey = process.env.FIREBASE_PRIVATE_KEY.replace(/^"|"$/g, '');

        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: rawKey.replace(/\\n/g, '\n'),
        };

        // Basic validation logging (security safe: only length)
        console.log(`🔑 Firebase Key loaded. Length: ${serviceAccount.privateKey.length}`);
        if (!serviceAccount.privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
            console.error('❌ WARNING: FIREBASE_PRIVATE_KEY might be malformed. It assumes a PEM format.');
        }

    } else {
        console.warn('⚠️ Firebase credentials missing in .env');
    }
} catch (error) {
    console.error('❌ Error parsing Firebase credentials:', error);
}

if (serviceAccount) {
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });
            console.log('✅ Firebase Admin Initialized');
        }
    } catch (error) {
        if (error.code === 'app/already-exists') {
            console.log('✅ Firebase Admin already initialized');
        } else {
            console.error('❌ Firebase Admin Initialization Error:', error.message);
            // Don't rethrow, just log, so server can keep running without Push features
        }
    }
}

// Safely export services only if app is initialized
const isInitialized = admin.apps.length > 0;
export const messaging = isInitialized ? admin.messaging() : null;
export const firestore = isInitialized ? admin.firestore() : null;
export default admin;
