import express from 'express';
import { createCampaign, getCampaigns, serveCampaign, trackInteraction, getCampaignStats, stopCampaign, deleteCampaign } from '../../controllers/campaigns/campaignController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import { uploadBuffer } from '../../utils/bunnyStorage.js';

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
router.get('/:id/stats', authenticateUser, getCampaignStats);
router.patch('/:id/stop', authenticateUser, stopCampaign);
router.delete('/:id', authenticateUser, deleteCampaign);

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

        // Upload to Bunny.net 'campaign-media' folder
        const publicUrl = await uploadBuffer(file.buffer, `campaign-media/${fileName}`, file.mimetype);

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
