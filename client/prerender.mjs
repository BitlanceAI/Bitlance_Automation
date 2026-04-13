/**
 * prerender.mjs — Post-build static HTML generator
 *
 * Run AFTER `vite build`:
 *   node prerender.mjs
 *
 * Uses `react-dom/server` renderToString to inject real HTML into dist/index.html
 * for each public route, so Googlebot reads content instead of an empty <div>.
 *
 * How it works:
 *  1. Spins up the built dist/ on a temp server (vite preview)
 *  2. Fetches each route as HTML
 *  3. Writes a separate index.html per route into dist/
 *
 * Requirements: Node 18+ (built-in fetch)
 */

import { exec } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir   = join(__dirname, 'dist');

// Public routes to prerender
const ROUTES = [
    '/',
    '/features/voice-bot',
    '/features/blog-agent',
    '/apply',
    '/contact',
    '/blogs',
];

const PORT = 4999;

// ── Start preview server ──────────────────────────────────────────────────────
function startPreview() {
    return new Promise((resolve, reject) => {
        const proc = exec(`npx vite preview --port ${PORT} --strictPort`, { cwd: __dirname });
        setTimeout(() => resolve(proc), 3000); // give it 3s to start
        proc.on('error', reject);
    });
}

// ── Fetch rendered HTML for a route ──────────────────────────────────────────
async function fetchRoute(route) {
    const url = `http://localhost:${PORT}${route}`;
    const res = await fetch(url);
    return res.text();
}

// ── Write route HTML to dist ──────────────────────────────────────────────────
function writeRoute(route, html) {
    if (route === '/') {
        writeFileSync(join(distDir, 'index.html'), html, 'utf-8');
        return;
    }
    const routeDir = join(distDir, ...route.split('/').filter(Boolean));
    mkdirSync(routeDir, { recursive: true });
    writeFileSync(join(routeDir, 'index.html'), html, 'utf-8');
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
    console.log('[prerender] Starting preview server…');
    const proc = await startPreview();

    console.log(`[prerender] Rendering ${ROUTES.length} routes…`);
    for (const route of ROUTES) {
        try {
            const html = await fetchRoute(route);
            writeRoute(route, html);
            console.log(`[prerender] ✓  ${route}`);
        } catch (err) {
            console.error(`[prerender] ✗  ${route} — ${err.message}`);
        }
    }

    proc.kill();
    console.log('[prerender] Done. Static HTML written to dist/');
})();
