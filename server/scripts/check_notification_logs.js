import { firestore } from '../src/services/firebaseService.js';
import dotenv from 'dotenv';

dotenv.config();

const checkNotifications = async () => {
    try {
        if (!firestore) {
            console.error('Firebase Service not initialized!');
            return;
        }

        console.log('Fetching last 5 notifications...');
        const snapshot = await firestore.collection('notifications')
            .orderBy('sentAt', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            console.log('No notifications found in logs.');
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log('--------------------------------------------------');
                console.log(`Time:    ${new Date(data.sentAt).toLocaleString()}`);
                console.log(`Title:   ${data.title}`);
                console.log(`Body:    ${data.body}`);
                console.log(`Target:  ${data.target}`);
                console.log(`Success: ${data.successCount}`);
                console.log(`Failure: ${data.failureCount}`);
            });
            console.log('--------------------------------------------------');
        }

    } catch (error) {
        console.error('Error fetching logs:', error);
    }
    process.exit();
};

checkNotifications();
