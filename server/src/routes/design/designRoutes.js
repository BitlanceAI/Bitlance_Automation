import express from 'express';
import axios from 'axios';
import designController from '../../controllers/design/designController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const GRAPHIC_AGENT_URL = process.env.GRAPHIC_AGENT_URL || process.env.GRAPHIC_GENERATOR_URL || 'http://localhost:8001';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// POST /api/design/generate-flyer
router.post('/generate-flyer', designController.generateFlyer);

// POST /api/design/generate-from-prompt
router.post('/generate-from-prompt', designController.generateFromPrompt);

// GET /api/design/jobs
router.get('/jobs', designController.getJobs);

// GET /api/design/jobs/:id
router.get('/jobs/:id', designController.getJobById);

// POST /api/design/generate-social-post
// Full pipeline: category → Google Trends → AI captions → graphic generation
router.post('/generate-social-post', designController.generateSocialPost);

export default router;
