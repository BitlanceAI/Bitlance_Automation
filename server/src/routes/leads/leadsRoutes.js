import express from 'express';
import { createLead, markLeadAsBooked, getLeads, getContactLeads, getStats, getLeadById, bookAudit, handleCalendlyWebhook, confirmBooking, trackClick, quizOptin, submitContactForm } from '../../controllers/leads/leadController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createLead);
router.post('/contact', submitContactForm);
router.post('/quiz-optin', quizOptin);
router.post('/book-audit', bookAudit);
router.post('/calendly', handleCalendlyWebhook);
router.post('/confirm-booking', confirmBooking);
router.post('/track-click', trackClick);

// Protected routes
router.get('/', protect, getLeads);
router.get('/contacts', protect, getContactLeads);
router.get('/stats', protect, getStats);
router.get('/:id', protect, getLeadById);
router.put('/:id/book', markLeadAsBooked);

export default router;
