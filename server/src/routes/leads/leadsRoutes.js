import express from 'express';
import { createLead, markLeadAsBooked, getLeads, getStats, getLeadById, bookAudit, handleCalendlyWebhook, confirmBooking, trackClick, quizOptin } from '../../controllers/leads/leadController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createLead);
router.post('/quiz-optin', quizOptin);
router.post('/book-audit', bookAudit);
router.post('/calendly', handleCalendlyWebhook);
router.post('/confirm-booking', confirmBooking);
router.post('/track-click', trackClick);
router.get('/', protect, getLeads);
router.get('/stats', protect, getStats);
router.get('/:id', getLeadById);
router.put('/:id/book', markLeadAsBooked);

export default router;
