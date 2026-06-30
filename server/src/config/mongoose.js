import mongoose from 'mongoose';

export const connectMongo = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn('[MongoDB] MONGODB_URI not set — skipping connection');
        return;
    }
    try {
        await mongoose.connect(uri, { dbName: 'bitlance-social' });
        console.log('[MongoDB] Connected');
    } catch (err) {
        console.error('[MongoDB] Connection failed:', err.message);
        process.exit(1);
    }
};

export default mongoose;
