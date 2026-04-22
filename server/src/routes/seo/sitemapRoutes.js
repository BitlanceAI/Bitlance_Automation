import express from 'express';
import { supabaseAdmin } from '../../config/supabaseClient.js';

const router = express.Router();

const BASE = 'https://www.bitlancetechhub.com';

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

router.get('/sitemap.xml', async (req, res) => {
    try {
        // Fetch published blog articles
        const { data: articles } = await supabaseAdmin
            .from('articles')
            .select('slug, updated_at, created_at')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        const articleUrls = (articles || []).map(a => ({
            loc: `/blogs/${a.slug}`,
            changefreq: 'monthly',
            priority: '0.7',
            lastmod: (a.updated_at || a.created_at || '').slice(0, 10),
        }));

        const allUrls = [...staticUrls, ...articleUrls];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${BASE}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (err) {
        console.error('[Sitemap] error:', err.message);
        res.status(500).send('Sitemap generation failed');
    }
});

export default router;