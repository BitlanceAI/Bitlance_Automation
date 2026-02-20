import { createClient } from '@supabase/supabase-js';

// Helper to get scoped client
const getScopedSupabase = (req) => {
    const token = req.token;
    if (!token) return null;
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};

const ADMIN_ID = '0d396440-7d07-407c-89da-9cb93e353347';

const getTableName = (req) => {
    // Check various sources for the table preference
    const isCompanyBlog = req.body?.is_company_blog || req.query?.is_company_blog === 'true';

    // If Admin:
    if (req.user && req.user.id === ADMIN_ID) {
        // If explicitly asking for client/regular articles, give it.
        // Otherwise default to company_articles
        if (req.body?.target_table === 'articles' || req.query?.target_table === 'articles') {
            return 'articles';
        }
        return 'company_articles';
    }

    return 'articles';
};

export const getPosts = async (req, res) => {
    try {
        const supabase = getScopedSupabase(req);
        if (!supabase) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const { page = 1, limit = 10, status } = req.query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const tableName = getTableName(req);

        let query = supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (status === 'published') {
            query = query.eq('is_published', true);
        } else if (status === 'draft') {
            query = query.eq('is_published', false);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            success: true,
            posts: data,
            meta: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getPostById = async (req, res) => {
    try {
        const supabase = getScopedSupabase(req);
        if (!supabase) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const { id } = req.params;
        const tableName = getTableName(req);

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.json({ success: true, post: data });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const createPost = async (req, res) => {
    try {
        const supabase = getScopedSupabase(req);
        if (!supabase) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const {
            title,
            slug,
            content,
            seo_title,
            seo_description,
            keywords,
            is_published,
            publish_date,
            featured_image,
            category,
            author_name
        } = req.body;

        const userId = req.user.id;
        const tableName = getTableName(req);

        const postData = {
            user_id: userId,
            topic: title, // Mapping title to topic as per existing schema
            slug,
            content, // HTML content
            seo_title,
            seo_description,
            keywords,
            is_published: is_published || false,
            publish_date,
            featured_image,
            category,
            author_name,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(tableName)
            .insert(postData)
            .select()
            .single();

        if (error) throw error;

        // Send Push Notification if published
        if (data.is_published) {
            const { sendPushNotification } = await import('../services/pushService.js');
            const notifSettings = req.body.notification_settings || {};

            // Run asynchronously, don't block response
            // Respect notification_settings from request if provided (even if not saved to DB yet)
            if (notifSettings.send !== false) {
                sendPushNotification({
                    title: notifSettings.title || `New Post: ${data.topic || data.title || 'Fresh Content'}`,
                    body: notifSettings.body || data.seo_description || 'Check out our latest update!',
                    image: notifSettings.image || data.featured_image,
                    target: 'all',
                    data: {
                        slug: data.slug,
                        topic: 'blog_updates',
                        url: `/blogs/${data.slug}`
                    }
                }).catch(err => console.error('Background Push Error:', err));
            }
        }

        res.json({ success: true, post: data });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updatePost = async (req, res) => {
    try {
        const supabase = getScopedSupabase(req);
        if (!supabase) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const { id } = req.params;
        const updates = req.body;
        const tableName = getTableName(req);

        // Check if we are publishing a draft
        let isPublishing = false;
        if (updates.is_published === true) {
            const { data: current } = await supabase
                .from(tableName)
                .select('is_published')
                .eq('id', id)
                .single();
            if (current && !current.is_published) {
                isPublishing = true;
            }
        }

        const notificationSettings = updates.notification_settings || {};

        // Prevent updating immutable fields if any
        delete updates.id;
        delete updates.created_at;
        delete updates.user_id;
        delete updates.notification_settings;

        updates.updated_at = new Date().toISOString();
        if (updates.title) updates.topic = updates.title;

        const { data, error } = await supabase
            .from(tableName)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        // Send notification if just published
        if (!error && isPublishing && notificationSettings.send !== false) {
            const { sendPushNotification } = await import('../services/pushService.js');
            sendPushNotification({
                title: notificationSettings.title || `New Post: ${data.topic || data.title || 'Fresh Content'}`,
                body: notificationSettings.body || data.seo_description || 'Check out our latest update!',
                image: notificationSettings.image || data.featured_image,
                target: 'all',
                data: {
                    slug: data.slug,
                    topic: 'blog_updates',
                    url: `/blogs/${data.slug}`
                }
            }).catch(err => console.error('Background Push Error (Update):', err));
        }

        if (error) throw error;

        res.json({ success: true, post: data });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const supabase = getScopedSupabase(req);
        if (!supabase) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const { id } = req.params;
        const tableName = getTableName(req);

        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
