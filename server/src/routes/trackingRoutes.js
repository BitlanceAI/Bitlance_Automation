import express from 'express';
import { trackEvent } from '../controllers/trackingController.js';

const router = express.Router();

// Main tracking endpoint
router.post('/', trackEvent);

// Alias endpoints for convenience/clarity (all route to same logic currently)
router.post('/view', (req, res, next) => {
    req.body.eventName = 'PageView';
    trackEvent(req, res, next);
});

router.post('/lead', (req, res, next) => {
    req.body.eventName = 'Lead';
    trackEvent(req, res, next);
});

router.post('/purchase', (req, res, next) => {
    req.body.eventName = 'Purchase';
    trackEvent(req, res, next);
});

export default router;
