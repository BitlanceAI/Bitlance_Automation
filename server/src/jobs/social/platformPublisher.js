/**
 * Shared publisher — resolves platform connection from Supabase,
 * decrypts the token, and calls the appropriate service.
 */
import { createClient } from '@supabase/supabase-js';
import { decryptData } from '../../../utils/encryption.js';
import axios from 'axios';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Facebook / Instagram ──────────────────────────────────────────────────────

async function publishMeta(userId, profileId, platform, text, mediaUrl) {
    const { data: connections } = await supabase
        .from('meta_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

    if (!connections?.length) throw new Error('No active Meta connection');

    let accessToken = null;
    let pageToken = null;

    for (const conn of connections) {
        const pages = conn.pages || [];
        const page = pages.find(p =>
            (p.accountId === profileId || p.profileId === profileId) && p.platform === platform
        );
        if (page) {
            accessToken = decryptData(conn.access_token);
            pageToken = page.accessToken || accessToken;
            break;
        }
    }

    if (!pageToken) throw new Error(`${platform} profile ${profileId} not found in Meta connections`);

    const MetaService = (await import('../../services/social/metaService.js')).default;
    const svc = new MetaService(pageToken);

    let result;
    if (platform === 'facebook') {
        result = await svc.createFacebookPost(profileId, text, mediaUrl);
    } else if (platform === 'instagram') {
        result = await svc.createInstagramPost(profileId, text, mediaUrl);
    } else {
        throw new Error(`Unsupported Meta platform: ${platform}`);
    }

    if (!result.success) throw new Error(result.error || 'Meta post failed');
    return result.postId;
}

// ── Twitter ───────────────────────────────────────────────────────────────────

async function publishTwitter(userId, twitterUserId, text) {
    const { data: conn } = await supabase
        .from('twitter_connections')
        .select('access_token')
        .eq('user_id', userId)
        .eq('twitter_user_id', twitterUserId)
        .eq('is_active', true)
        .single();

    if (!conn) throw new Error(`Twitter connection not found for user ${twitterUserId}`);

    const accessToken = decryptData(conn.access_token);

    const tweetRes = await axios.post(
        'https://api.twitter.com/2/tweets',
        { text },
        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    return tweetRes.data.data.id;
}

// ── LinkedIn ──────────────────────────────────────────────────────────────────

async function publishLinkedIn(userId, profileId, text, visibility = 'PUBLIC') {
    const { data: conn } = await supabase
        .from('linkedin_connections')
        .select('access_token')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .single();

    if (!conn) throw new Error(`LinkedIn connection not found for profile ${profileId}`);

    const accessToken = decryptData(conn.access_token);
    const LinkedinService = (await import('../../services/social/linkedinService.js')).default;
    const svc = new LinkedinService(accessToken);
    const result = await svc.createPost(profileId, text, visibility);

    if (!result.success) throw new Error(result.error || 'LinkedIn post failed');
    return result.postId;
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

/**
 * Publish to one (platform, profileId) pair.
 * Returns { platform, profileId, postId } on success.
 * Throws on failure.
 */
export async function publishToProfile({ userId, platform, profileId, text, mediaUrl, visibility }) {
    switch (platform) {
        case 'facebook':
        case 'instagram':
            return { platform, profileId, postId: await publishMeta(userId, profileId, platform, text, mediaUrl) };
        case 'twitter':
            return { platform, profileId, postId: await publishTwitter(userId, profileId, text) };
        case 'linkedin':
            return { platform, profileId, postId: await publishLinkedIn(userId, profileId, text, visibility) };
        default:
            throw new Error(`Unknown platform: ${platform}`);
    }
}
