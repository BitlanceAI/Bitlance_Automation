import express from 'express';
import { supabaseAdmin } from '../../config/supabaseClient.js';

const router = express.Router();

const BASE = 'https://www.bitlancetechhub.com';

// ── Static pages ──────────────────────────────────────────────────────────────
const staticUrls = [
    { loc: '/',                      changefreq: 'weekly',  priority: '1.0' },
    { loc: '/features/voice-bot',    changefreq: 'monthly', priority: '0.9' },
    { loc: '/features/blog-agent',   changefreq: 'monthly', priority: '0.9' },
    { loc: '/apply',                 changefreq: 'monthly', priority: '0.8' },
    { loc: '/apply/real-estate',     changefreq: 'monthly', priority: '0.8' },
    { loc: '/blogs',                 changefreq: 'daily',   priority: '0.8' },
    { loc: '/contact',               changefreq: 'yearly',  priority: '0.5' },
    { loc: '/privacy',               changefreq: 'yearly',  priority: '0.3' },
    { loc: '/terms',                 changefreq: 'yearly',  priority: '0.3' },
];

// ── Helper: fetch all published blog articles from Supabase ───────────────────
const fetchPublishedArticles = async () => {
    const { data: articles, error } = await supabaseAdmin
        .from('company_articles')          // ✅ corrected table
        .select('slug, updated_at, created_at')
        .eq('is_published', true)          // ✅ corrected filter (boolean field)
        .not('slug', 'is', null)           // only include articles that have a slug
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Sitemap] Supabase error:', error.message);
        return [];
    }

    // De-duplicate slugs (safety net)
    const seen = new Set();
    return (articles || []).filter(a => {
        if (!a.slug || seen.has(a.slug)) return false;
        seen.add(a.slug);
        return true;
    });
};

// ── Helper: build <url> XML block ─────────────────────────────────────────────
const buildUrlBlock = ({ loc, changefreq, priority, lastmod }) =>
    `  <url>
    <loc>${BASE}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`;

// ── GET /sitemap.xml — master sitemap (static + all blog posts) ───────────────
router.get('/sitemap.xml', async (req, res) => {
    try {
        const articles = await fetchPublishedArticles();

        const articleUrls = articles.map(a => ({
            loc: `/blogs/${a.slug}`,
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: (a.updated_at || a.created_at || '').slice(0, 10),
        }));

        const allUrls = [...staticUrls, ...articleUrls];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(buildUrlBlock).join('\n')}
</urlset>`;

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (err) {
        console.error('[Sitemap] /sitemap.xml error:', err.message);
        res.status(500).send('Sitemap generation failed');
    }
});

// ── GET /blog-sitemap.xml — blog-only sitemap (for scale / Search Console) ───
router.get('/blog-sitemap.xml', async (req, res) => {
    try {
        const articles = await fetchPublishedArticles();

        const articleUrls = articles.map(a => ({
            loc: `/blogs/${a.slug}`,
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: (a.updated_at || a.created_at || '').slice(0, 10),
        }));

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articleUrls.map(buildUrlBlock).join('\n')}
</urlset>`;

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (err) {
        console.error('[Sitemap] /blog-sitemap.xml error:', err.message);
        res.status(500).send('Blog sitemap generation failed');
    }
});

export default router;