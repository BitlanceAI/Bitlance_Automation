import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
} from '../controllers/blogController.js';

const router = express.Router();

router.use(authenticateUser); // Protect all blog management routes

router.get('/', getPosts);
router.post('/', createPost);
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;
