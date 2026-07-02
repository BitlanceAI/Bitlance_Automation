import express from 'express';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import {
    schedulePost,
    getScheduledPosts,
    cancelScheduledPost,
    reschedulePost,
    approvePost,
    resendApproval,
    suggestOptimalTimes,
} from '../../controllers/social/scheduleController.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/',                     schedulePost);
router.get('/',                      getScheduledPosts);
router.delete('/:id',                cancelScheduledPost);
router.put('/:id',                   reschedulePost);
router.patch('/:id/approve',         approvePost);
router.post('/:id/resend-approval',  resendApproval);
router.post('/ai-suggest',           suggestOptimalTimes);

export default router;
