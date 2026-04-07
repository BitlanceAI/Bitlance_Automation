import express from 'express';
import {
    createSignRequest,
    getSignStatus,
    handleWebhook,
    myAgreements,
} from '../controllers/eSignController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authenticated routes
router.post('/create-request', authenticateUser, createSignRequest);
router.get('/status/:orderId', authenticateUser, getSignStatus);
router.get('/my-agreements', authenticateUser, myAgreements);

// Cashfree callback — no auth, verified via HMAC signature inside controller
router.post('/webhook', handleWebhook);

export default router;
