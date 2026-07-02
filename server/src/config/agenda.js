import { Agenda } from 'agenda';
import mongoose from 'mongoose';

let agenda;

export const getAgenda = () => {
    if (!agenda) throw new Error('Agenda not initialized. Call initAgenda() first.');
    return agenda;
};

export const initAgenda = async () => {
    if (!process.env.MONGODB_URI) {
        console.warn('[Agenda] MONGODB_URI not set — job scheduling disabled');
        return null;
    }

    // Reuse the existing Mongoose connection instead of opening a second one
    agenda = new Agenda({
        mongo: mongoose.connection.db,
        collection: 'agenda_jobs',
        processEvery: '30 seconds',
        maxConcurrency: 10,
    });

    agenda.on('error', (err) => console.error('[Agenda] Error:', err.message));

    // Register job definitions
    const { registerPublishPostJob }   = await import('../jobs/social/publishPost.js');
    const { registerPublishBundleJob } = await import('../jobs/social/publishBundle.js');
    registerPublishPostJob(agenda);
    registerPublishBundleJob(agenda);

    await agenda.start();
    console.log('[Agenda] Started');
    return agenda;
};

export const gracefulStop = async () => {
    if (agenda) await agenda.stop();
};

export default getAgenda;
