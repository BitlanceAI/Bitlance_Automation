import express from 'express';
import designController from '../controllers/designController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// POST /api/design/generate-flyer
router.post('/generate-flyer', designController.generateFlyer);

// GET /api/design/jobs
router.get('/jobs', designController.getJobs);

// GET /api/design/jobs/:id
router.get('/jobs/:id', designController.getJobById);

export default router;
