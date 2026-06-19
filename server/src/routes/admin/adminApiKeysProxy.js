/**
 * Admin API Keys Proxy Routes
 *
 * The Python AI agent runs as a PRIVATE/INTERNAL service on DigitalOcean
 * (internal_ports: 8001) — it has no public URL the browser can reach.
 * The Node.js backend proxies these requests to the Python service using
 * the PYTHON_API_URL env var (set to ${bitlance-ai-agent.PRIVATE_URL} in app.yaml).
 *
 * Frontend calls:  POST/GET /api/admin/api-keys/...  (Node.js — public)
 * Node proxies to: POST/GET <PYTHON_API_URL>/api/v1/admin/api-keys/...  (internal)
 */

import express from 'express';
// Uses Node 18+ native fetch (no external dependency needed)

const router = express.Router();

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';

/**
 * Forward a request to the internal Python AI agent service.
 * Passes through the Authorization header so the Python service
 * can validate the Supabase JWT token.
 */
async function proxyToPython(req, res, pythonPath, method = 'GET', body = null) {
    const url = `${PYTHON_API_URL}${pythonPath}`;
    try {
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: req.headers.authorization || '',
            },
        };
        if (body) {
            fetchOptions.body = JSON.stringify(body);
        }

        const pythonRes = await fetch(url, fetchOptions);
        const data = await pythonRes.json();
        return res.status(pythonRes.status).json(data);
    } catch (err) {
        console.error(`[AdminApiKeysProxy] Error forwarding to ${url}:`, err.message);
        return res.status(502).json({
            error: 'Failed to reach AI agent service',
            detail: err.message,
        });
    }
}

// GET  /api/admin/api-keys/list   → Python: GET /api/v1/admin/api-keys/list
router.get('/list', (req, res) => {
    return proxyToPython(req, res, '/api/v1/admin/api-keys/list', 'GET');
});

// POST /api/admin/api-keys/create → Python: POST /api/v1/admin/api-keys/create
router.post('/create', (req, res) => {
    return proxyToPython(req, res, '/api/v1/admin/api-keys/create', 'POST', req.body);
});

// POST /api/admin/api-keys/revoke → Python: POST /api/v1/admin/api-keys/revoke
router.post('/revoke', (req, res) => {
    return proxyToPython(req, res, '/api/v1/admin/api-keys/revoke', 'POST', req.body);
});

// POST /api/admin/api-keys/blog/generate → Python: POST /api/blog/generate
// Used by PartnerTestLab — proxied because Python service has no public URL
router.post('/blog/generate', (req, res) => {
    return proxyToPython(req, res, '/api/blog/generate', 'POST', req.body);
});

// POST /api/admin/api-keys/seo/generate → Python: POST /api/v1/seo/generate
// Used by PartnerPortal — proxied because Python service has no public URL
router.post('/seo/generate', (req, res) => {
    return proxyToPython(req, res, '/api/v1/seo/generate', 'POST', req.body);
});


export default router;
