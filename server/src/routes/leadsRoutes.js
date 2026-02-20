import express from 'express';
import { createLead } from '../controllers/leadsController.js';
import { bookAudit } from '../controllers/leadController.js';

const router = express.Router();

router.post('/', createLead);
router.post('/book-audit', bookAudit);

export default router;
