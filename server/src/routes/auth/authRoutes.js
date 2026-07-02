import express from 'express';
import {
    login,
    signup,
    logout,
    getCurrentUser,
    refreshToken,
    resendVerification,
    forgotPassword,
    resetPassword
} from '../../controllers/auth/authController.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', login);
router.post('/signup', signup);
router.post('/refresh', refreshToken);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (authentication required)
router.post('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getCurrentUser);

export default router;
