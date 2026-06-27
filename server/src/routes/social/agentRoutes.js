import express from 'express';
import { 
    getPendingBundles, updateBundleStatus, generateCalendar,
    getBrandConfigs, createBrandConfig, updateBrandConfig, deleteBrandConfig,
    getCalendars, createCalendar, updateCalendar, deleteCalendar
} from '../../controllers/social/agentController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

// Get all pending post bundles for review
router.get('/bundles/pending', getPendingBundles);

// Update status of a specific post bundle (approve/reject)
router.patch('/bundles/:id/status', updateBundleStatus);

// Generate N days of content via Python API
router.post('/bundles/generate', generateCalendar);

// Brand Configs CRUD
router.get('/brand-configs', getBrandConfigs);
router.post('/brand-configs', createBrandConfig);
router.put('/brand-configs/:id', updateBrandConfig);
router.delete('/brand-configs/:id', deleteBrandConfig);

// Content Calendars CRUD
router.get('/calendars', getCalendars);
router.post('/calendars', createCalendar);
router.put('/calendars/:id', updateCalendar);
router.delete('/calendars/:id', deleteCalendar);

export default router;
