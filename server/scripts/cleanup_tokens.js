import { firestore } from '../src/services/firebaseService.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const cleanTokens = async () => {
    if (!firestore) {
        console.error('Firebase Service not initialized!');
        process.exit(1);
    }

    const tokensRef = firestore.collection('device_tokens');
    const snapshot = await tokensRef.get();

    if (snapshot.empty) {
        console.log('No tokens found.');
        process.exit();
    }

    console.log(`Found ${snapshot.size} tokens.`);

    // List them first
    snapshot.forEach(doc => {
        console.log(`Token ID: ${doc.id.slice(0, 20)}... | Updated: ${doc.data().lastUpdated}`);
    });

    // Ask to delete
    console.log('\nDeleting all tokens to ensure clean slate for new Project ID...');

    const batch = firestore.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('All tokens deleted. Please refresh your frontend to register a fresh token.');
    process.exit();
};

cleanTokens();
