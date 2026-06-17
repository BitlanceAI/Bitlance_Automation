import express from 'express';
import {
    getPricing,
    createOrder,
    verifyPayment,
    handleWebhook,
} from '../../controllers/payments/razorpayController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public — full pricing catalogue
router.get('/pricing', getPricing);

// Protected — regular (non-admin) users only
router.post('/create-order', authenticateUser, createOrder);
router.post('/verify',       authenticateUser, verifyPayment);

// Razorpay webhook (no auth — signature verified internally)
router.post('/webhook', handleWebhook);

export default router;
