import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

/**
 * GET /api/public/blogs
 * Fetch all articles with pagination (public access, no auth required)
 */
router.get('/blogs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || 'created_at'; // created_at, seo_title, etc.
        const order = req.query.order || 'desc'; // asc or desc

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Fetch articles with pagination
        const { data: articles, error, count } = await supabase
            .from('articles')
            .select('*', { count: 'exact' })
            .order(sort, { ascending: order === 'asc' })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching articles:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch articles'
            });
        }

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            success: true,
            articles: articles || [],
            pagination: {
                currentPage: page,
                totalPages,
                totalArticles: count,
                limit,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        console.error('Public blogs fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/public/blogs/:id
 * Fetch a single article by ID (public access, no auth required)
 */
router.get('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if id is a valid UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let query = supabase.from('articles').select('*');

        if (isUUID) {
            query = query.eq('id', id);
        } else {
            query = query.eq('slug', id);
        }

        const { data: article, error } = await query.single();

        if (error) {
            console.error('Error fetching article:', error);
            return res.status(404).json({
                success: false,
                error: 'Article not found'
            });
        }

        res.json({
            success: true,
            article
        });
    } catch (error) {
        console.error('Public blog fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
