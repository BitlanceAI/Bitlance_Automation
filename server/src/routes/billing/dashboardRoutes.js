import express from 'express';
import {
    getDashboardStats,
    getActiveCalls,
    getCallHistory,
    getPaymentHistory,
    triggerCall,
    forceTerminateCall,
    createRazorpayOrder,
    verifyRazorpayPayment,
    failRazorpayPayment,
    getUserWorkflows
} from '../../controllers/billing/dashboardController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Mount protected dashboard endpoints
router.get('/stats', authenticateUser, getDashboardStats);
router.get('/active-calls', authenticateUser, getActiveCalls);
router.get('/call-history', authenticateUser, getCallHistory);
router.get('/payment-history', authenticateUser, getPaymentHistory);
router.get('/workflows', authenticateUser, getUserWorkflows);
router.post('/trigger-call', authenticateUser, triggerCall);
router.post('/force-terminate/:callId', authenticateUser, forceTerminateCall);

// Custom Razorpay integration for billing wallet recharges
router.post('/razorpay/create-order', authenticateUser, createRazorpayOrder);
router.post('/razorpay/verify',       authenticateUser, verifyRazorpayPayment);
router.post('/razorpay/fail',         authenticateUser, failRazorpayPayment);

export default router;
