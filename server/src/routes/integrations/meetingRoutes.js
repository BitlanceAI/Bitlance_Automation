import express from 'express';
import { getMeetings, updateMeeting } from '../../controllers/integrations/meetingController.js';

const router = express.Router();

router.get('/', getMeetings);
router.put('/:id', updateMeeting);

export default router;
