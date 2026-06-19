import express from 'express';
import { supabase } from '../../config/supabaseClient.js';

const router = express.Router();

// Get User API Keys
router.get('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.replace("Bearer ", "").trim();

        // Verify token and get user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: "Invalid token" });
        }

        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, keys: data || [] });

    } catch (error) {
        console.error('Error fetching user API keys:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
