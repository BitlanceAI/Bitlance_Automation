import express from 'express';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { sendTemplate, sendMessage } from '../../controllers/social/whatsappController.js';

const router = express.Router();

router.post('/send-template', sendTemplate);
router.post('/send', authenticateUser, sendMessage);

export default router;
