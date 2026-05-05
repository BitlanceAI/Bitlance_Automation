/**
 * prerender.mjs — Post-build static route generator
 *
 * Run AFTER `vite build`:
 *   node prerender.mjs
 *
 * Copies the built dist/index.html into each public route's directory
 * so that every URL has its own index.html for SEO and direct-navigation.
 *
 * Works everywhere: local, Azure Static Web Apps (Oryx), Docker, CI/CD.
 * No server needed — just file copies.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
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

// ── Main ─────────────────────────────────────────────────────────────────────
const indexPath = join(distDir, 'index.html');

if (!existsSync(indexPath)) {
    console.error('[prerender] ✗  dist/index.html not found. Run `vite build` first.');
    process.exit(1);
}

const html = readFileSync(indexPath, 'utf-8');

console.log(`[prerender] Copying index.html to ${ROUTES.length} routes…`);

for (const route of ROUTES) {
    if (route === '/') {
        // Root already has index.html from the build
        console.log(`[prerender] ✓  ${route} (already exists)`);
        continue;
    }

    const routeDir  = join(distDir, ...route.split('/').filter(Boolean));
    const routeFile = join(routeDir, 'index.html');

    mkdirSync(routeDir, { recursive: true });
    writeFileSync(routeFile, html, 'utf-8');
    console.log(`[prerender] ✓  ${route}`);
}

console.log('[prerender] Done. Static HTML written to dist/');
