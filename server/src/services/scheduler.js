import { createClient } from '@supabase/supabase-js';
import MetaService from './metaService.js';
import { decryptData } from '../../utils/encryption.js';

let supabase;

const CHECK_INTERVAL = 60 * 1000; // 1 minute

export const startPostScheduler = () => {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

    // Set interval
    setInterval(checkAndPublishPosts, CHECK_INTERVAL);
};

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
