import { supabaseAdmin } from '../config/supabaseClient.js';
import { google } from 'googleapis';
import { decryptData } from '../utils/encryption.js';

// Get current auto blog settings (cron toggle, delay, and last run)
export const getSettings = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('auto_blog_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error && error.code === 'PGRST116') {
            return res.json({ success: true, settings: { is_enabled: false, delay_minutes: 300 } });
        }
        if (error && error.code === 'PGRST205') {
            return res.json({ success: true, settings: { is_enabled: false, delay_minutes: 300 } });
        }
        if (error) throw error;
        res.json({ success: true, settings: data });
    } catch (error) {
        console.error('Error fetching auto blog settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update settings (is_enabled and/or delay_minutes)
export const updateSettings = async (req, res) => {
    try {
        const { is_enabled, delay_minutes, website_url } = req.body;

        const updates = {};
        if (typeof is_enabled === 'boolean') updates.is_enabled = is_enabled;
        if (typeof delay_minutes === 'number' && delay_minutes > 0) updates.delay_minutes = delay_minutes;
        if (website_url !== undefined) updates.website_url = website_url;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
        }

        const { data, error } = await supabaseAdmin
            .from('auto_blog_settings')
            .update(updates)
            .eq('id', 1)
            .select()
            .single();

        if (error && error.code === 'PGRST205') {
            return res.json({ success: true, message: 'Auto blog settings table not set up yet', settings: { is_enabled: false, delay_minutes: 300 } });
        }
        if (error) throw error;
        res.json({ success: true, message: 'Settings updated successfully', settings: data });
    } catch (error) {
        console.error('Error updating auto blog settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Toggle the auto blog cron on/off (kept for backward compat)
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
            return res.json({ success: true, message: `Auto blog cron is offline (setup required)`, settings: { is_enabled: false, delay_minutes: 300 } });
        }
        if (error) throw error;
        res.json({ success: true, message: `Auto blog cron is now ${is_enabled ? 'enabled' : 'disabled'}`, settings: data });
    } catch (error) {
        console.error('Error toggling auto blog settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add a new auto blog entry to the queue (manual single topic)
export const scheduleAutoBlog = async (req, res) => {
    try {
        const { niche = '', title, keywords = '', delay_after_minutes } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const insertData = { niche, title, keywords, status: 'pending' };
        if (delay_after_minutes) insertData.delay_after_minutes = delay_after_minutes;

        const { data, error } = await supabaseAdmin
            .from('auto_blogs')
            .insert(insertData)
            .select()
            .single();

        if (error && error.code === 'PGRST205') {
            return res.status(400).json({ success: false, error: 'Database setup required before scheduling' });
        }
        if (error) throw error;
        res.json({ success: true, message: 'Topic added to queue successfully', entry: data });
    } catch (error) {
        console.error('Error scheduling auto blog:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Sync topics from configured Google Sheet to the auto_blogs queue
export const syncGoogleSheetToQueue = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch user's Google Sheets credentials
        const { data: userSettings, error: userError } = await supabaseAdmin
            .from('user_settings')
            .select('google_sheet_id, google_service_email, google_private_key')
            .eq('user_id', userId)
            .single();

        if (userError || !userSettings || !userSettings.google_sheet_id) {
            return res.status(400).json({ success: false, error: 'Google Sheets is not configured. Please go to Settings to configure it.' });
        }

        const spreadsheetId = userSettings.google_sheet_id;
        const clientEmail = userSettings.google_service_email;
        let privateKey = '';
        try {
            // Handle escaped newlines properly
            privateKey = decryptData(userSettings.google_private_key).replace(/\\n/g, '\n');
        } catch (e) {
            return res.status(400).json({ success: false, error: 'Failed to decrypt Google private key. Please re-enter credentials in Settings.' });
        }

        // 2. Authenticate with Google Sheets API
        const auth = new google.auth.JWT(
            clientEmail,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/spreadsheets.readonly']
        );

        const sheets = google.sheets({ version: 'v4', auth });

        // Fetch spreadsheet metadata to get the first sheet's name
        const metadata = await sheets.spreadsheets.get({ spreadsheetId });
        const firstSheetName = metadata.data.sheets[0].properties.title;

        // Fetch values from the first sheet
        const sheetResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${firstSheetName}!A:Z`
        });

        const rows = sheetResponse.data.values;
        if (!rows || rows.length === 0) {
            return res.status(400).json({ success: false, error: 'The Google Sheet is empty.' });
        }

        // 3. Parse headers to find corresponding columns dynamically
        const headers = rows[0];
        const rowData = rows.slice(1);

        const nicheIndex = headers.findIndex(h => h.toLowerCase().includes('niche') || h.toLowerCase().includes('industry'));
        const titleIndex = headers.findIndex(h => h.toLowerCase().includes('title') || h.toLowerCase().includes('topic'));
        const keywordsIndex = headers.findIndex(h => h.toLowerCase().includes('keyword'));

        if (titleIndex === -1) {
            return res.status(400).json({ success: false, error: 'The Google Sheet must have a "Title" or "Topic" column header.' });
        }

        const getField = (row, index) => {
            if (index === -1) return '';
            return row[index] ? row[index].toString().trim() : '';
        }

        // 4. Transform rows to queue entries
        const entries = [];
        for (const row of rowData) {
            const title = getField(row, titleIndex);
            if (!title) continue;

            const niche = getField(row, nicheIndex) || 'General';
            const keywords = getField(row, keywordsIndex);

            entries.push({
                niche,
                title,
                keywords,
                status: 'pending'
            });
        }

        if (entries.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid topics found in the Google Sheet (skip empty rows).' });
        }

        // 5. Avoid duplicates (don't add topics that are already pending or processing)
        const { data: existingBlogs } = await supabaseAdmin
            .from('auto_blogs')
            .select('title')
            .in('status', ['pending', 'processing']);

        const existingTitles = new Set((existingBlogs || []).map(b => b.title.toLowerCase()));

        const newEntries = entries.filter(e => !existingTitles.has(e.title.toLowerCase()));

        if (newEntries.length === 0) {
            return res.json({ success: true, message: 'No new topics to sync. All topics from the sheet are already in the queue.' });
        }

        // 6. Insert new distinct entries
        const { data: insertedData, error: insertError } = await supabaseAdmin
            .from('auto_blogs')
            .insert(newEntries)
            .select();

        if (insertError && insertError.code === 'PGRST205') {
            return res.status(400).json({ success: false, error: 'Database setup required. auto_blogs table not found.' });
        }
        if (insertError) throw insertError;

        res.json({
            success: true,
            message: `Successfully synced ${insertedData.length} new topic(s) from your Google Sheet!`,
            count: insertedData.length,
            entries: insertedData
        });

    } catch (error) {
        console.error('Error syncing Google Sheet to queue:', error);
        res.status(500).json({ success: false, error: 'Failed to access Google Sheet: ' + error.message });
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

// Get queue stats (pending, processing, completed, failed counts)
export const getQueueStats = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('auto_blogs')
            .select('status');

        if (error && error.code === 'PGRST205') {
            return res.json({ success: true, stats: { pending: 0, processing: 0, completed: 0, failed: 0 } });
        }
        if (error) throw error;

        const stats = { pending: 0, processing: 0, completed: 0, failed: 0 };
        (data || []).forEach(row => {
            if (stats[row.status] !== undefined) stats[row.status]++;
        });

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error getting queue stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
