import express from 'express';
import {
    getSettings,
    toggleCron,
    scheduleAutoBlog,
    listScheduledBlogs,
    deleteScheduledBlog
} from '../controllers/autoBlogController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auto Blog Cron Settings
router.get('/settings', authenticateUser, getSettings);
router.post('/settings/toggle', authenticateUser, toggleCron);

// Auto Blog Queue Management
router.get('/schedule', authenticateUser, listScheduledBlogs);
router.post('/schedule', authenticateUser, scheduleAutoBlog);
router.delete('/schedule/:id', authenticateUser, deleteScheduledBlog);

export default router;
