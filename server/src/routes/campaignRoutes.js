import express from 'express';
import { createCampaign, getCampaigns, serveCampaign, trackInteraction } from '../controllers/campaignController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public endpoints
router.get('/serve', serveCampaign);
router.post('/track', trackInteraction);

// Protected endpoints
router.post('/', authenticateUser, createCampaign);
router.get('/', authenticateUser, getCampaigns);

export default router;
