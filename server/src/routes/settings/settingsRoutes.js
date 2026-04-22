import express from 'express';
import { saveSettings, getSettings, deleteSettings } from '../../controllers/settings/settingsController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateUser, saveSettings);
router.get('/:userId', authenticateUser, getSettings);
router.delete('/:userId', authenticateUser, deleteSettings);

export default router;
