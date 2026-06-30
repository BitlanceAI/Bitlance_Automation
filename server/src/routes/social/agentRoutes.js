import express from 'express';
import {
    getPendingBundles, updateBundleStatus, generateCalendar,
    getBrandConfigs, createBrandConfig, updateBrandConfig, deleteBrandConfig,
    getCalendars, createCalendar, updateCalendar, deleteCalendar,
    onboardBloomBrand, getBloomBrandStatus,
} from '../../controllers/social/agentController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

// Post bundles
router.get('/bundles/pending',       getPendingBundles);
router.patch('/bundles/:id/status',  updateBundleStatus);
router.post('/bundles/generate',     generateCalendar);

// Brand Configs CRUD
router.get('/brand-configs',         getBrandConfigs);
router.post('/brand-configs',        createBrandConfig);
router.put('/brand-configs/:id',     updateBrandConfig);
router.delete('/brand-configs/:id',  deleteBrandConfig);

// Bloom brand onboarding (attach visual DNA to a BrandConfig)
router.post('/brand-configs/:id/onboard-bloom',  onboardBloomBrand);
router.get('/brand-configs/:id/bloom-status',    getBloomBrandStatus);

// Content Calendars CRUD
router.get('/calendars',         getCalendars);
router.post('/calendars',        createCalendar);
router.put('/calendars/:id',     updateCalendar);
router.delete('/calendars/:id',  deleteCalendar);

export default router;
