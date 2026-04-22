import express from 'express';
import {
    createSignRequest,
    getSignStatus,
    handleWebhook,
    myAgreements,
} from '../../controllers/esign/eSignController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (auth optional — controller uses req.user?.id if present)
router.post('/create-request', createSignRequest);
router.get('/status/:orderId', getSignStatus);

// Authenticated routes
router.get('/my-agreements', authenticateUser, myAgreements);

// Cashfree callback — no auth, verified via HMAC signature inside controller
router.post('/webhook', handleWebhook);

export default router;
