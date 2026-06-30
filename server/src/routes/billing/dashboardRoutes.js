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
import { authenticateUser, resolveOldBillingUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth and user ID resolution middleware to all routes
router.use(authenticateUser);
router.use(resolveOldBillingUser);

// Mount protected dashboard endpoints
router.get('/stats', getDashboardStats);
router.get('/active-calls', getActiveCalls);
router.get('/call-history', getCallHistory);
router.get('/payment-history', getPaymentHistory);
router.get('/workflows', getUserWorkflows);
router.post('/trigger-call', triggerCall);
router.post('/force-terminate/:callId', forceTerminateCall);

// Custom Razorpay integration for billing wallet recharges
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify',       verifyRazorpayPayment);
router.post('/razorpay/fail',         failRazorpayPayment);

export default router;
