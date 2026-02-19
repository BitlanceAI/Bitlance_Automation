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

export const getPosts = async (req, res) => {
    try {
        const supabase = getScopedSupabase(req);
        if (!supabase) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const { page = 1, limit = 10, status } = req.query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('articles')
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

        const { data, error } = await supabase
            .from('articles')
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
            .from('articles')
            .insert(postData)
            .select()
            .single();

        if (error) throw error;

        // Send Push Notification if published
        if (data.is_published) {
            const { sendPushNotification } = await import('../services/pushService.js');

            // Run asynchronously, don't block response
            sendPushNotification({
                title: `New Post: ${data.topic || data.title || 'Fresh Content'}`,
                body: data.seo_description || 'Check out our latest update!',
                image: data.featured_image,
                target: 'topic',
                data: {
                    slug: data.slug,
                    topic: 'blog_updates',
                    useTopic: true
                }
            }).catch(err => console.error('Background Push Error:', err));
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

        // Prevent updating immutable fields if any
        delete updates.id;
        delete updates.created_at;
        delete updates.user_id;

        updates.updated_at = new Date().toISOString();
        if (updates.title) updates.topic = updates.title;

        const { data, error } = await supabase
            .from('articles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

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

        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
