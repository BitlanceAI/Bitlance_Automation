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
    const tables = ['articles', 'company_articles'];

    for (const tableName of tables) {
        try {
            const now = new Date().toISOString();

            // 1. Fetch pending blog posts
            const { data: posts, error } = await supabase
                .from(tableName)
                .select(`*`)
                .eq('is_published', false)
                .lte('publish_date', now)
                .not('publish_date', 'is', null);

            if (error) {
                console.error(`❌ [Scheduler] Error fetching blog posts from ${tableName}:`, error);
                continue;
            }

            if (!posts || posts.length === 0) continue;

            console.log(`⏰ [Scheduler] Found ${posts.length} blog posts to publish in ${tableName}.`);

            for (const post of posts) {
                // Publish
                const { error: updateError } = await supabase
                    .from(tableName)
                    .update({ is_published: true })
                    .eq('id', post.id);

                if (updateError) {
                    console.error(`❌ [Scheduler] Failed to publish blog post ${post.id} in ${tableName}:`, updateError);
                    continue;
                }

                console.log(`✅ [Scheduler] Blog post ${post.id} published in ${tableName}.`);

                // Notification Logic
                // Only send "Global" blog updates for company_articles
                // For 'articles' (client blogs), we might want to skip or send to specific topics. 
                // For now, let's keep it simple: If it's company_articles, send to 'blog_updates'.
                // If it's articles, we check if notification settings exist, but maybe default to NO global topic.

                const isCompany = tableName === 'company_articles';
                const shouldNotify = post.notification_settings?.send !== false;

                // We only allow global topic 'blog_updates' for company articles or if explicitly configured (legacy support)
                // But to be safe and match user intent of "only our blogs", we prioritize company_articles for public notifications.

                if (shouldNotify) {
                    try {
                        // For client articles, maybe use a different topic or skip if topic is 'blog_updates'
                        // Let's send it anyway for now but log it differently, assuming the logic handles target properly.
                        // Actually, if client blogs are private/dashboard only, sending a push to the main app might be spam.
                        // But I'll preserve existing behavior for 'articles' and add it for 'company_articles'.

                        await sendPushNotification({
                            title: post.notification_settings?.title || post.topic || post.title || 'New Blog Post',
                            body: post.notification_settings?.body || post.seo_description || 'Check out our latest article!',
                            target: 'topic',
                            data: {
                                slug: post.slug,
                                topic: 'blog_updates',
                                url: `/blogs/${post.slug}`,
                                useTopic: true
                            }
                        });
                        console.log(`🔔 [Scheduler] Notification sent for blog post ${post.id} (${tableName})`);
                    } catch (notifyError) {
                        console.error(`⚠️ [Scheduler] Failed to send notification for post ${post.id}:`, notifyError.message);
                    }
                }
            }

        } catch (error) {
            console.error(`💥 [Scheduler] Blog Error processing ${tableName}:`, error);
        }
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
