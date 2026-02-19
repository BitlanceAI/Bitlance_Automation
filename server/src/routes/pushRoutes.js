import express from 'express';
// import { authenticateUser } from '../middleware/authMiddleware.js'; // Optional: Use if you want to protect these routes
import {
    registerToken,
    listTokens,
    toggleToken,
    deleteToken,
    sendNotification
} from '../controllers/pushController.js';

const router = express.Router();

// Public route for mobile app to register? Or protect it with an API key?
// For now, we'll keep register public or assume mobile app has some auth.
// Dashboard management routes should likely be protected.

router.post('/tokens/register', registerToken);
router.get('/tokens', listTokens); // Protect this
router.put('/tokens/:id', toggleToken); // Protect this
router.delete('/tokens/:id', deleteToken); // Protect this

router.post('/send', sendNotification); // Protect this

export default router;
