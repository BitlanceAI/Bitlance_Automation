import express from 'express';
import {
    verifyAccount,
    createUrl,
    getStatus,
    getDocument,
    handleWebhook,
} from '../../controllers/esign/digiLockerController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All routes require auth — DigiLocker data is PII
router.post('/verify-account', authenticateUser, verifyAccount);
router.post('/create-url', authenticateUser, createUrl);
router.get('/status/:verificationId', authenticateUser, getStatus);
router.get('/document/:documentType', authenticateUser, getDocument);

// Cashfree callback — no auth, verified via HMAC signature inside controller
router.post('/webhook', handleWebhook);

export default router;
