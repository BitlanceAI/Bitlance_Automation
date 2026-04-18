import express from 'express';
import { getSuggestions } from '../controllers/keywordController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/suggest', authenticateUser, getSuggestions);
export default router;
