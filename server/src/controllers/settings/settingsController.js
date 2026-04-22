import { supabase } from '../../config/supabaseClient.js';
import { encryptData, decryptData } from '../../utils/encryption.js';

// Save/Update User Settings (Google Sheets + WordPress)
export const saveSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { googleSheetId, googleServiceEmail, googlePrivateKey, wpUrl, wpUsername, wpAppPassword } = req.body;

        // Build update object with only provided fields (partial upsert)
        const updates = { user_id: userId, updated_at: new Date().toISOString() };

        if (googleSheetId !== undefined) updates.google_sheet_id = googleSheetId;
        if (googleServiceEmail !== undefined) updates.google_service_email = googleServiceEmail;
        if (googlePrivateKey) updates.google_private_key = encryptData(googlePrivateKey);

        if (wpUrl !== undefined) updates.wp_url = wpUrl || null;
        if (wpUsername !== undefined) updates.wp_username = wpUsername || null;
        if (wpAppPassword) updates.wp_app_password = encryptData(wpAppPassword);

        const { error } = await supabase
            .from('user_settings')
            .upsert(updates, { onConflict: 'user_id' });

        if (error) throw error;

        res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Save Settings Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get User Settings
export const getSettings = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('user_settings')
            .select('google_sheet_id, google_service_email, google_private_key, wp_url, wp_username, wp_app_password')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (!data) {
            return res.json({ success: true, configured: false });
        }

        res.json({
            success: true,
            configured: true,
            googleSheetId: data.google_sheet_id,
            googleServiceEmail: data.google_service_email,
            hasPrivateKey: !!data.google_private_key,
            // WordPress — never send password back to client
            wpUrl: data.wp_url || '',
            wpUsername: data.wp_username || '',
            wpConfigured: !!(data.wp_url && data.wp_username && data.wp_app_password),
        });
    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete User Settings
export const deleteSettings = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await supabase
            .from('user_settings')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;

        res.json({ success: true, message: 'Settings deleted successfully' });
    } catch (error) {
        console.error('Delete Settings Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
