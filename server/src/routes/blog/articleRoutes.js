import express from 'express';
import multer from 'multer';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import {
    generateArticle,
    bulkGenerateArticles,
    createArticle,
    listArticles,
    getArticle,
    updateArticle,
    deleteArticle,
    publicListBlogs,
    publicGetBlog,
    publicGetComments,
    publicPostComment,
} from '../../controllers/blog/articleController.js';

const router = express.Router();

// Memory storage for multer (we don't need to save the excel file to disk)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public routes (no auth)
router.get('/public/blogs', publicListBlogs);
router.get('/public/blogs/:identifier', publicGetBlog);
router.get('/public/blogs/:identifier/comments', publicGetComments);
router.post('/public/blogs/:identifier/comments', publicPostComment);

// Authenticated routes
router.post('/articles/generate', authenticateUser, generateArticle);
router.post('/articles/bulk-generate', authenticateUser, upload.single('file'), bulkGenerateArticles);
router.post('/blog/posts', authenticateUser, createArticle);
router.get('/blog/posts', authenticateUser, listArticles);
router.get('/blog/posts/:id', authenticateUser, getArticle);
router.put('/blog/posts/:id', authenticateUser, updateArticle);
router.delete('/blog/posts/:id', authenticateUser, deleteArticle);

export default router;
