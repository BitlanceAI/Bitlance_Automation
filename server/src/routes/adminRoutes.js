import express from 'express';
import { getAllUsers, addUser, addUserCredits } from '../controllers/adminController.js';
// In a real app, adding a strict "isAdmin" middleware here is recommended
// For now, we assume the dashboard uses this route and is protected by general auth or is internal

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/users', addUser);
router.post('/users/:id/credits', addUserCredits);

export default router;
