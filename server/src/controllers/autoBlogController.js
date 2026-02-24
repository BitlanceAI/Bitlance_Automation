import { supabaseAdmin } from '../config/supabaseClient.js';

// Get current auto blog settings (cron toggle and last run)
export const getSettings = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('auto_blog_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error && error.code === 'PGRST116') {
            return res.json({ success: true, settings: { is_enabled: false } });
        }
        if (error && error.code === 'PGRST205') {
            return res.json({ success: true, settings: { is_enabled: false } });
        }
        if (error) throw error;
        res.json({ success: true, settings: data });
    } catch (error) {
        console.error('Error fetching auto blog settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Toggle the auto blog cron on/off
export const toggleCron = async (req, res) => {
    try {
        const { is_enabled } = req.body;

        const { data, error } = await supabaseAdmin
            .from('auto_blog_settings')
            .update({ is_enabled })
            .eq('id', 1)
            .select()
            .single();

        if (error && error.code === 'PGRST205') {
            return res.json({ success: true, message: `Auto blog cron is offline (setup required)`, settings: { is_enabled: false } });
        }
        if (error) throw error;
        res.json({ success: true, message: `Auto blog cron is now ${is_enabled ? 'enabled' : 'disabled'}`, settings: data });
    } catch (error) {
        console.error('Error toggling auto blog settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add a new auto blog entry to the queue
export const scheduleAutoBlog = async (req, res) => {
    try {
        const { niche, title, keywords } = req.body;

        if (!niche || !title || !keywords) {
            return res.status(400).json({ success: false, error: 'Niche, title, and keywords are required' });
        }

        const { data, error } = await supabaseAdmin
            .from('auto_blogs')
            .insert({ niche, title, keywords, status: 'pending' })
            .select()
            .single();

        if (error && error.code === 'PGRST205') {
            return res.status(400).json({ success: false, error: 'Database setup required before scheduling' });
        }
        if (error) throw error;
        res.json({ success: true, message: 'Auto blog entry scheduled successfully', entry: data });
    } catch (error) {
        console.error('Error scheduling auto blog:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// List all scheduled and processed auto blogs
export const listScheduledBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { data, error, count } = await supabaseAdmin
            .from('auto_blogs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + parseInt(limit) - 1);

        if (error && error.code === 'PGRST205') {
            return res.json({
                success: true,
                entries: [],
                pagination: { currentPage: parseInt(page), totalPages: 0, total: 0 }
            });
        }
        if (error) throw error;

        const totalPages = Math.ceil(count / parseInt(limit));

        res.json({
            success: true,
            entries: data,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                total: count
            }
        });
    } catch (error) {
        console.error('Error listing auto blogs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete a scheduled blog entry manually
export const deleteScheduledBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('auto_blogs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, message: 'Auto blog entry deleted' });
    } catch (error) {
        console.error('Error deleting auto blog:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
