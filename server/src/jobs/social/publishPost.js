import ScheduledPost from '../../models/social/ScheduledPost.js';
import { publishToProfile } from './platformPublisher.js';

export const JOB_NAME = 'publish-scheduled-post';

export function registerPublishPostJob(agenda) {
    agenda.define(JOB_NAME, { priority: 'high', concurrency: 5 }, async (job) => {
        const { postId } = job.attrs.data;

        const post = await ScheduledPost.findById(postId);
        if (!post) {
            console.warn(`[Agenda:publishPost] Post ${postId} not found — skipping`);
            return;
        }

        if (post.status === 'cancelled') {
            console.log(`[Agenda:publishPost] Post ${postId} was cancelled — skipping`);
            return;
        }

        if (post.status === 'pending_approval') {
            console.warn(`[Agenda:publishPost] Post ${postId} still pending approval — skipping`);
            await ScheduledPost.findByIdAndUpdate(postId, { status: 'failed', failReason: 'Not approved before scheduled time' });
            return;
        }

        const results = [];
        const errors = [];

        // platforms and profile_ids are parallel arrays
        const pairs = (post.platforms || []).map((platform, i) => ({
            platform,
            profileId: (post.profile_ids || [])[i],
        })).filter(p => p.profileId);

        for (const { platform, profileId } of pairs) {
            try {
                const result = await publishToProfile({
                    userId:    post.userId,
                    platform,
                    profileId,
                    text:      post.text,
                    mediaUrl:  post.media_url,
                    visibility: 'PUBLIC',
                });
                results.push(result);
                console.log(`[Agenda:publishPost] ✅ ${platform}/${profileId} → postId ${result.postId}`);
            } catch (err) {
                errors.push({ platform, profileId, error: err.message });
                console.error(`[Agenda:publishPost] ❌ ${platform}/${profileId}:`, err.message);
            }
        }

        const finalStatus = errors.length === 0 ? 'published'
            : results.length > 0 ? 'published'   // partial success — still mark published
            : 'failed';

        await ScheduledPost.findByIdAndUpdate(postId, {
            status:       finalStatus,
            publishResults: results,
            publishErrors:  errors,
        });

        if (errors.length > 0) {
            throw new Error(`Partial failure: ${errors.map(e => `${e.platform}: ${e.error}`).join('; ')}`);
        }
    });
}
