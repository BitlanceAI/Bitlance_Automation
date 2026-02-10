import express from 'express';
import { createCampaign, getCampaigns, serveCampaign, trackInteraction } from '../controllers/campaignController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Initialize Supabase (reusing env vars, defaulting to service role if needed for storage policies, 
// but usually authenticated user token is better. Here we use service role for backend upload to ensure it works, 
// assuming RLS is handled or we want backend to have full write access to this bucket)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for storage uploads from backend
);

// Configure Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit for videos
    }
});

const router = express.Router();

// Public endpoints
router.get('/serve', serveCampaign);
router.post('/track', trackInteraction);

// Protected endpoints
router.post('/', authenticateUser, createCampaign);
router.get('/', authenticateUser, getCampaigns);

// Upload Endpoint
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.id;

        if (!file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Create unique filename: userId/timestamp-originalName
        const fileExt = path.extname(file.originalname);
        const fileName = `${userId}/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;

        // Upload to Supabase 'campaign-media' bucket
        const { data, error } = await supabase
            .storage
            .from('campaign-media')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Supabase Storage Upload Error:', error);
            throw error;
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('campaign-media')
            .getPublicUrl(fileName);

        res.json({
            success: true,
            url: publicUrl,
            type: file.mimetype.startsWith('video/') ? 'video' : 'image'
        });

    } catch (error) {
        console.error('Upload route error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
