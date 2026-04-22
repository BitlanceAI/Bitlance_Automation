import express from 'express';
import multer from 'multer';
import {
    getSettings,
    updateSettings,
    toggleCron,
    scheduleAutoBlog,
    syncGoogleSheetToQueue,
    listScheduledBlogs,
    deleteScheduledBlog,
    getQueueStats,
} from '../../controllers/admin/autoBlogController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();


// Auto Blog Settings
router.get('/settings', authenticateUser, getSettings);
router.put('/settings', authenticateUser, updateSettings);
router.post('/settings/toggle', authenticateUser, toggleCron); // kept for backward compat

// Queue Stats
router.get('/stats', authenticateUser, getQueueStats);

// Auto Blog Queue Management
router.get('/schedule', authenticateUser, listScheduledBlogs);
router.post('/schedule', authenticateUser, scheduleAutoBlog);
router.delete('/schedule/:id', authenticateUser, deleteScheduledBlog);

// Sync from Google Sheet → Queue
router.post('/sync-sheet', authenticateUser, syncGoogleSheetToQueue);

export default router;
