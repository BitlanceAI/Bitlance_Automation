import express from 'express';
import { createWebCall, createPhoneCall, handleWebhook, syncCalls } from '../../controllers/integrations/retellController.js';

const router = express.Router();

router.post('/create-web-call', createWebCall);
router.post('/create-phone-call', createPhoneCall);
router.post('/webhook/retell', handleWebhook);
router.get('/sync-calls', syncCalls);

export default router;
