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

import { exec, execSync } from 'child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir   = join(__dirname, 'dist');
const isWin     = platform() === 'win32';

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

// ── Kill any leftover process on PORT (cross-platform) ────────────────────────
function killPort(port) {
    try {
        if (isWin) {
            const out = execSync(
                `netstat -ano | findstr :${port} | findstr LISTENING`,
                { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
            );
            const pids = [...new Set(
                out.trim().split('\n')
                   .map(l => l.trim().split(/\s+/).pop())
                   .filter(Boolean)
            )];
            for (const pid of pids) {
                try { execSync(`taskkill /PID ${pid} /F /T`, { stdio: 'ignore' }); } catch {}
            }
            if (pids.length) console.log(`[prerender] Killed leftover process(es) on port ${port}: ${pids.join(', ')}`);
        } else {
            // Linux / macOS
            execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
        }
    } catch {
        // No process on port — that's fine
    }
}

// ── Start preview server ──────────────────────────────────────────────────────
function startPreview() {
    killPort(PORT);

    return new Promise((resolve, reject) => {
        const proc = exec(`npx vite preview --port ${PORT} --strictPort`, { cwd: __dirname });

        // Log stderr so we can see if vite preview has issues
        proc.stderr.on('data', d => process.stderr.write(d));

        proc.on('error', reject);

        // Poll until the server actually responds (up to 30s)
        const maxWait = 30_000;
        const interval = 500;
        let elapsed = 0;

        const timer = setInterval(async () => {
            elapsed += interval;
            try {
                await fetch(`http://localhost:${PORT}/`);
                clearInterval(timer);
                resolve(proc);
            } catch {
                if (elapsed >= maxWait) {
                    clearInterval(timer);
                    proc.kill();
                    reject(new Error('Preview server did not start within 30s'));
                }
            }
        }, interval);
    });
}

// ── Fetch rendered HTML for a route (with retries) ───────────────────────────
async function fetchRoute(route, retries = 3) {
    const url = `http://localhost:${PORT}${route}`;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url);
            return await res.text();
        } catch (err) {
            if (attempt === retries) throw err;
            await new Promise(r => setTimeout(r, 1000 * attempt)); // backoff
        }
    }
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
    killPort(PORT); // ensure cleanup on Windows
    console.log('[prerender] Done. Static HTML written to dist/');
})();
