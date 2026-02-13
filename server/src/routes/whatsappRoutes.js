import express from 'express';
import whatsappController from '../controllers/whatsappController.js';
import multer from 'multer';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer();

// Apply auth middleware to all WhatsApp routes
router.use(authenticateUser);

// ==================== BROADCAST ====================
router.post('/broadcast', upload.single('file'), whatsappController.sendBroadcast);
router.get('/history', whatsappController.getHistory);

// ==================== TEMPLATES ====================
router.get('/templates', whatsappController.getTemplates);
router.post('/templates', whatsappController.createTemplate);
router.get('/meta-templates', whatsappController.getMetaTemplates);
router.post('/sync-templates', whatsappController.syncTemplates);

// ==================== CONFIG ====================
router.post('/config', whatsappController.saveConfig);
router.get('/phone-numbers', whatsappController.getPhoneNumbers);

export default router;
