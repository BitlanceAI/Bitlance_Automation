import express from 'express';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { 
    schedulePost, 
    getScheduledPosts, 
    cancelScheduledPost,
    suggestOptimalTimes,
    reschedulePost,
    resendApproval
} from '../../controllers/social/scheduleController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateUser);

router.post('/', schedulePost);
router.get('/', getScheduledPosts);
router.delete('/:id', cancelScheduledPost);
router.put('/:id', reschedulePost);
router.post('/:id/resend-approval', resendApproval);
router.post('/ai-suggest', suggestOptimalTimes);

export default router;
