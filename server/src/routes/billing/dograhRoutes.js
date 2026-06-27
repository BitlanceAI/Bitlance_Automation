import express from 'express';
import { handleDograhWebhook } from '../../controllers/billing/dograhController.js';

const router = express.Router();

// Webhook endpoint for Dograh call events
router.post('/', handleDograhWebhook);

export default router;
