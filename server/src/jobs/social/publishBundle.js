import PostBundle from '../../models/social/PostBundle.js';
import { publishToProfile } from './platformPublisher.js';

export const JOB_NAME = 'publish-approved-bundle';

export function registerPublishBundleJob(agenda) {
    agenda.define(JOB_NAME, { priority: 'normal', concurrency: 3 }, async (job) => {
        const { bundleId, userId, profileId, platform } = job.attrs.data;

        const bundle = await PostBundle.findById(bundleId);
        if (!bundle) {
            console.warn(`[Agenda:publishBundle] Bundle ${bundleId} not found`);
            return;
        }

        if (bundle.status !== 'approved') {
            console.warn(`[Agenda:publishBundle] Bundle ${bundleId} status is "${bundle.status}" — skipping`);
            return;
        }

        try {
            const result = await publishToProfile({
                userId,
                platform:  platform || (bundle.platforms?.[0] || 'instagram'),
                profileId: profileId || bundle.platforms?.[0],
                text:      bundle.generated_caption,
                mediaUrl:  bundle.graphic_url,
                visibility: 'PUBLIC',
            });

            await PostBundle.findByIdAndUpdate(bundleId, {
                status:   'published',
                publishedPostId: result.postId,
            });

            console.log(`[Agenda:publishBundle] ✅ Bundle ${bundleId} published → ${result.postId}`);
        } catch (err) {
            await PostBundle.findByIdAndUpdate(bundleId, { status: 'failed' });
            console.error(`[Agenda:publishBundle] ❌ Bundle ${bundleId}:`, err.message);
            throw err;
        }
    });
}
