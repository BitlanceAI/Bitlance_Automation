import express from 'express';
import { getRankData, getSites } from '../controllers/seoRankController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/rank-data', authenticateUser, getRankData);
router.get('/sites',     authenticateUser, getSites);
export default router;
