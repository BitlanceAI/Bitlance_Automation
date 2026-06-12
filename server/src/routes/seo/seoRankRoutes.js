import express from 'express';
import { getRankData, getSites, trackGeoRank } from '../../controllers/seo/seoRankController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.get('/rank-data', authenticateUser, getRankData);
router.get('/sites',     authenticateUser, getSites);
router.post('/geo-track', authenticateUser, trackGeoRank);

export default router;
