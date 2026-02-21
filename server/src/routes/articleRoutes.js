import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import {
    generateArticle,
    createArticle,
    listArticles,
    getArticle,
    updateArticle,
    deleteArticle,
    publicListBlogs,
    publicGetBlog,
} from '../controllers/articleController.js';

const router = express.Router();

// Public routes (no auth)
router.get('/public/blogs', publicListBlogs);
router.get('/public/blogs/:identifier', publicGetBlog);

// Authenticated routes
router.post('/articles/generate', authenticateUser, generateArticle);
router.post('/blog/posts', authenticateUser, createArticle);
router.get('/blog/posts', authenticateUser, listArticles);
router.get('/blog/posts/:id', authenticateUser, getArticle);
router.put('/blog/posts/:id', authenticateUser, updateArticle);
router.delete('/blog/posts/:id', authenticateUser, deleteArticle);

export default router;
