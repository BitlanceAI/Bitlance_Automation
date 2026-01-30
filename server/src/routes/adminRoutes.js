import express from 'express';
import { getAllUsers } from '../controllers/adminController.js';
// In a real app, adding a strict "isAdmin" middleware here is recommended
// For now, we assume the dashboard uses this route and is protected by general auth or is internal

const router = express.Router();

router.get('/users', getAllUsers);

export default router;
