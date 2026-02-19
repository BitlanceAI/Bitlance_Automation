import { createClient } from '@supabase/supabase-js';
import MetaService from './metaService.js';
import { decryptData } from '../../utils/encryption.js';

let supabase;

const CHECK_INTERVAL = 60 * 1000; // 1 minute

import { sendPushNotification } from './pushService.js';

export const startPostScheduler = () => {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log(`[Scheduler] Initializing with URL: ${supabaseUrl}`);
        console.log(`[Scheduler] Service Role Key Length: ${supabaseKey ? supabaseKey.length : 'MISSING'}`);

        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ [Scheduler] Missing Supabase credentials!');
            return;
        }

        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        });
    }

    console.log('⏰ Starting Post Scheduler (1-minute interval)...');

    // Run immediately on start
    checkAndPublishPosts();
    checkAndPublishBlogPosts();

    // Set interval
    setInterval(() => {
        checkAndPublishPosts();
        checkAndPublishBlogPosts();
    }, CHECK_INTERVAL);
};

const checkAndPublishBlogPosts = async () => {
    try {
        const now = new Date().toISOString();

        // 1. Fetch pending blog posts
        // We assume 'notification_settings' is a JSONB column or we handle it via other means
        // For now, simpler approach: if notification_sent is false/null and has content
        const { data: posts, error } = await supabase
            .from('articles')
            .select(`*`)
            .eq('is_published', false)
            .lte('publish_date', now)
            .not('publish_date', 'is', null);

        if (error) {
            console.error('❌ [Scheduler] Error fetching blog posts:', error);
            return;
        }

        if (!posts || posts.length === 0) return;

        console.log(`⏰ [Scheduler] Found ${posts.length} blog posts to publish.`);

        for (const post of posts) {
            // Publish
            const { error: updateError } = await supabase
                .from('articles')
                .update({ is_published: true })
                .eq('id', post.id);

            if (updateError) {
                console.error(`❌ [Scheduler] Failed to publish blog post ${post.id}:`, updateError);
                continue;
            }

            console.log(`✅ [Scheduler] Blog post ${post.id} published.`);

            // Send Notification if configured
            // Check if there's a title/body for notification in metadata or similar
            // For now, we'll try to guess or just skip if no explicit instructions
            // Assuming we added a 'notification_settings' json column or similar in the future
            // Or just check if 'send_notification' is set

            // NOTE: For this task, we will try to look for a special logic or just default to sending
            // if we have enough info.

            // To make it robust without schema changes, we can look at a convention or just skip for now
            // until frontend sets it.
            // Let's assume we want to notify for ALL automated posts for now? No, that's spammy.
            // We really need a flag. "Link a notification to any blog post"
            // Let's assume we store it in `author_details` (JSON) as a hack if schema is locked?
            // Or `notification_settings` column (preferred).

            // Mock implementation assuming 'notification_settings' exists or we just won't send if missing.
            if (post.notification_settings && post.notification_settings.send) {
                await sendPushNotification({
                    title: post.notification_settings.title || post.topic,
                    body: post.notification_settings.body || post.seo_description || 'New blog post published!',
                    target: post.notification_settings.target || 'all',
                    data: { url: `/blogs/${post.slug}` }
                });
                console.log(`🔔 [Scheduler] Notification sent for blog post ${post.id}`);
            }
        }

    } catch (error) {
        console.error('💥 [Scheduler] Blog Error:', error);
    }
}

const checkAndPublishPosts = async () => {
    try {
        const now = new Date().toISOString();

        // 1. Fetch pending posts scheduled for now or in the past
        const { data: posts, error } = await supabase
            .from('scheduled_posts')
            .select(`
                *,
                meta_connections (
                    access_token,
                    user_id
                )
            `)
            .eq('status', 'pending')
            .lte('scheduled_time', now);

        if (error) {
            console.error('❌ [Scheduler] Error fetching posts:', error);
            return;
        }

        if (!posts || posts.length === 0) return;

        console.log(`⏰ [Scheduler] Found ${posts.length} posts to publish.`);

        // 2. Process each post
        for (const post of posts) {
            await publishPost(post);
        }

    } catch (error) {
        console.error('💥 [Scheduler] Critical error:', error);
    }
};

const publishPost = async (post) => {
    console.log(`🚀 [Scheduler] Publishing post ${post.id} for page ${post.page_name}...`);

    try {
        // Validation
        if (!post.meta_connections) {
            throw new Error('Meta connection not found or deleted');
        }

        // Decrypt Token
        let accessToken;
        try {
            accessToken = decryptData(post.meta_connections.access_token);
        } catch (e) {
            throw new Error('Failed to decrypt access token');
        }

        const metaService = new MetaService(accessToken);

        // Get Page Access Token (needed for publishing as Page)
        // We need to fetch pages again to get the specific page token, 
        // OR we could have stored page token. Assuming user token can get page token.
        // Let's first try usage with User Token context if allowed, otherwise fetch page token.
        // Best practice: Get Page Token.
        const pagesResult = await metaService.getPages();
        if (!pagesResult.success) {
            throw new Error('Failed to fetch pages to get page token');
        }

        const page = pagesResult.pages.find(p => p.id === post.page_id);
        if (!page || !page.access_token) {
            throw new Error('Page not found or missing access token');
        }

        // Publish
        const result = await metaService.publishPost(
            post.page_id,
            page.access_token,
            {
                message: post.content,
                link: post.link_url,
                mediaUrls: post.media_urls
            }
        );

        if (result.success) {
            console.log(`✅ [Scheduler] Post ${post.id} published successfully! ID: ${result.data.id}`);

            // Update DB Status
            await supabase
                .from('scheduled_posts')
                .update({
                    status: 'published',
                    published_at: new Date().toISOString(),
                    meta_post_id: result.data.id
                })
                .eq('id', post.id);

        } else {
            throw new Error(result.error || 'Unknown Meta API error');
        }

    } catch (error) {
        console.error(`❌ [Scheduler] Failed to publish post ${post.id}:`, error.message);

        // Update DB Status to Failed
        await supabase
            .from('scheduled_posts')
            .update({
                status: 'failed',
                error_message: error.message
            })
            .eq('id', post.id);
    }
};
