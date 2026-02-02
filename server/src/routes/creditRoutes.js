import express from 'express';
import {
    getCredits,
    deductCredits,
    getUserBalance,
    getUserUsageHistory,
    getUserAnalytics,
    checkCreditsForAgent,
    reconcileUserBalance,
    getPricing,
    getAgentPricing,
    getAgentStats
} from '../controllers/creditController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================
// LEGACY ROUTES (Backward Compatibility)
// ============================================
router.get('/balance', authenticateUser, getCredits);
router.post('/deduct', authenticateUser, deductCredits);

// ============================================
// NEW CREDIT LEDGER ROUTES
// ============================================

// Public pricing info
router.get('/pricing', getPricing);
router.get('/pricing/:agentType', getAgentPricing);

// Protected user routes
router.get('/balance/detailed', authenticateUser, getUserBalance);
router.get('/history', authenticateUser, getUserUsageHistory);
router.get('/analytics', authenticateUser, getUserAnalytics);
router.post('/check', authenticateUser, checkCreditsForAgent);
router.get('/stats/:agentType', authenticateUser, getAgentStats);

// Admin routes
router.post('/reconcile/:userId', authenticateUser, reconcileUserBalance);

export default router;
