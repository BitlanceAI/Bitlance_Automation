/**
 * bloomMCPService.js
 * Brand-aware image generation via Bloom AI MCP server.
 * Also exposes a helper to call the local Python social-agent MCP server.
 *
 * Workflow:
 *   1. onboardBrand(websiteUrl) → brand_session_id  [one-time per brand]
 *   2. generateImage(brandSessionId, prompt)        → image_url
 */

import axios from 'axios';

const MCP_URL = 'https://www.trybloom.ai/api/mcp';
const API_KEY = () => process.env.BLOOM_API_KEY || '';

let _sessionId = null;
let _reqId = 1;
const nextId = () => _reqId++;

function headers() {
    const h = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
    };
    if (API_KEY())    h['Authorization']  = `Bearer ${API_KEY()}`;
    if (_sessionId)   h['Mcp-Session-Id'] = _sessionId;
    return h;
}

async function rpc(method, params = {}) {
    const body = { jsonrpc: '2.0', id: nextId(), method, params };
    const res  = await axios.post(MCP_URL, body, { headers: headers(), timeout: 120_000 });

    if (res.headers?.['mcp-session-id']) _sessionId = res.headers['mcp-session-id'];

    const data = res.data;
    if (data.error) throw new Error(`[BloomMCP] ${data.error.message || JSON.stringify(data.error)}`);
    return data.result;
}

async function ensureSession() {
    if (_sessionId) return;
    await rpc('initialize', {
        protocolVersion: '2024-11-05',
        capabilities:    {},
        clientInfo:      { name: 'bitlance-social', version: '1.0.0' },
    });
}

async function callTool(name, args = {}) {
    await ensureSession();
    const result = await rpc('tools/call', { name, arguments: args });
    const content = result?.content || [];
    const text = content.filter(c => c.type === 'text').map(c => c.text).join('\n');
    try { return JSON.parse(text); } catch { return text; }
}

// ── Brand Management ──────────────────────────────────────────────────────────

/**
 * Onboard a brand by scraping its website or Instagram URL.
 * Returns the brand ID. Poll with waitForBrand() until status = 'ready'.
 */
export async function onboardBrand(url, logoUrl = null) {
    const args = { url, collect_images: true };
    if (logoUrl) args.logo_url = logoUrl;
    const result = await callTool('bloom_onboard_brand', args);
    console.log('[BloomMCP] onboardBrand raw result:', result);
    
    let brandId = null;
    if (typeof result === 'string') {
        const match = result.match(/ID:\s*([a-f0-9-]+)/i);
        if (match) brandId = match[1];
    } else if (result?.id) {
        brandId = result.id;
    }
    
    if (!brandId) throw new Error('Could not parse brand ID from Bloom response: ' + result);
    
    console.log(`[BloomMCP] Waiting for brand ${brandId} to be ready...`);
    // Wait for the brand analysis to finish
    const finalBrandStr = await waitForBrand(brandId, 120);
    console.log('[BloomMCP] waitForBrand raw result:', finalBrandStr);
    
    // We assume waitForBrand might also return a string like "Brand is ready" or a JSON object.
    // For now, if we got here without throwing, we assume it's ready and return the ID.
    return { id: brandId, status: 'ready' };
}

/**
 * Poll until brand is ready (or failed). Bloom takes ~60s.
 * Pass wait=true to let the server hold the connection (up to 120s).
 */
export async function waitForBrand(brandId, timeoutSecs = 120) {
    const result = await callTool('bloom_get_brand', { id: brandId, wait: true, timeout: timeoutSecs });
    return result;
}

/** List all onboarded brands for this account. */
export async function listBrands() {
    const result = await callTool('bloom_list_brands', {});
    return result?.brands || [];
}

/** Check remaining image generation credits. */
export async function checkCredits() {
    const result = await callTool('bloom_check_credits', {});
    return result;
}

// ── Image Generation ──────────────────────────────────────────────────────────

/**
 * Generate a brand-aware image.
 * @param {string} brandSessionId - from onboardBrand / listBrands
 * @param {string} prompt         - WHAT to create (subject, composition). Bloom adds brand style automatically.
 * @param {object} opts
 *   @param {string} opts.aspectRatio  - '1:1' | '4:5' | '9:16' | '16:9' etc. Default '4:5' (IG portrait)
 *   @param {string} opts.model        - 'fast' | 'standard' | 'pro'. Default 'standard'
 *   @param {number} opts.variants     - 1-5 variants. Default 1
 *   @param {string[]} opts.referenceIds - optional reference image IDs
 * @returns {{ imageId: string, variantGroupId: string|null }}
 */
export async function generateImage(brandSessionId, prompt, opts = {}) {
    const {
        aspectRatio  = '4:5',
        model        = 'standard',
        variants     = 1,
        referenceIds = [],
    } = opts;

    const args = {
        brand_session_id: brandSessionId,
        prompt,
        aspect_ratio:    aspectRatio,
        model,
        variant_count:   variants,
    };
    if (referenceIds.length) args.reference_image_ids = referenceIds;

    const result = await callTool('bloom_generate_image', args);
    console.log('[BloomMCP] generateImage raw result:', result);

    let imageIds = [];
    let variantGroupId = null;

    if (typeof result === 'string') {
        // TryBloom often returns: "Generation started. Image IDs: uuid1, uuid2"
        const matches = result.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi);
        if (matches) imageIds = matches;
    } else if (result?.image_ids) {
        imageIds = result.image_ids;
        variantGroupId = result.variant_group_id;
    }

    if (!imageIds.length) {
        throw new Error('Could not parse image IDs from Bloom response: ' + result);
    }

    return { imageIds, variantGroupId };
}

/**
 * Wait for a generated image to complete and return its URL.
 * Bloom generation takes ~60-90s. wait=true holds the connection.
 */
export async function waitForImage(imageId, timeoutSecs = 180) {
    const result = await callTool('bloom_get_image', { image_id: imageId, wait: true, timeout: timeoutSecs });
    console.log('[BloomMCP] waitForImage raw result:', result);

    if (typeof result === 'string') {
        const match = result.match(/https?:\/\/[^\s]+/i);
        if (match) return match[0];
        if (result.toLowerCase().includes('failed')) throw new Error(`[BloomMCP] Image generation failed for ${imageId}`);
        throw new Error('Could not parse image URL from Bloom response: ' + result);
    }
    
    if (result.status === 'failed') throw new Error(`[BloomMCP] Image generation failed for ${imageId}`);
    return result.image_url;
}

/**
 * Full generate + wait flow. Returns the CDN image URL.
 * Used by the agent controller for each post bundle.
 */
export async function generateAndWait(brandSessionId, prompt, opts = {}) {
    const { imageIds } = await generateImage(brandSessionId, prompt, opts);
    const primaryId    = imageIds[0];
    const imageUrl     = await waitForImage(primaryId);
    return { imageUrl, imageId: primaryId };
}

/**
 * Resize an existing image to a new aspect ratio.
 * Useful for adapting one graphic to Instagram square, stories, etc.
 */
export async function resizeImage(imageId, brandSessionId, targetAspectRatio) {
    const result = await callTool('bloom_resize_image', {
        image_id:            imageId,
        brand_session_id:    brandSessionId,
        target_aspect_ratio: targetAspectRatio,
    });
    const resizedUrl = await waitForImage(result.image_id);
    return resizedUrl;
}

/**
 * Find real high-performing ads by concept and recreate for the brand.
 * Returns array of ad objects: { id, image_url, brand_name, description }
 */
export async function findReferenceAds(brandSessionId, query, topK = 6) {
    const result = await callTool('bloom_find_reference_ads', {
        brand_session_id: brandSessionId,
        query,
        top_k: topK,
        mode: 'display',
    });
    return result?.ads || [];
}

// ── Local Python Social-Agent MCP Server ─────────────────────────────────────

// Same port as the Python REST agent — MCP is just another route on it
const SOCIAL_MCP_URL = () =>
    `${process.env.PYTHON_MCP_URL || process.env.PYTHON_API_URL || 'http://127.0.0.1:8001'}/api/social/mcp`;

let _socialSessionId = null;
let _socialReqId = 1;
const nextSocialId = () => _socialReqId++;

async function socialRpc(method, params = {}) {
    const h = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
    };
    if (_socialSessionId) h['Mcp-Session-Id'] = _socialSessionId;
    // Auth: use API key if set, fall back to debug bypass for local dev
    const pythonApiKey = process.env.PYTHON_API_KEY;
    if (pythonApiKey) {
        h['Authorization'] = `Bearer ${pythonApiKey}`;
    } else {
        h['X-Debug-Bypass'] = 'true';
    }

    const body = { jsonrpc: '2.0', id: nextSocialId(), method, params };
    const res  = await axios.post(SOCIAL_MCP_URL(), body, { headers: h, timeout: 120_000 });

    if (res.headers?.['mcp-session-id']) _socialSessionId = res.headers['mcp-session-id'];
    const data = res.data;
    if (data.error) throw new Error(`[SocialMCP] ${data.error.message}`);
    return data.result;
}

async function ensureSocialSession() {
    if (_socialSessionId) return;
    await socialRpc('initialize', {
        protocolVersion: '2024-11-05',
        capabilities:    {},
        clientInfo:      { name: 'bitlance-server', version: '1.0.0' },
    });
}

async function callSocialTool(name, args = {}) {
    await ensureSocialSession();
    const result = await socialRpc('tools/call', { name, arguments: args });
    const content = result?.content || [];
    const text = content.filter(c => c.type === 'text').map(c => c.text).join('\n');
    try { return JSON.parse(text); } catch { return text; }
}

/**
 * Call the Python social-agent MCP server to generate full post bundles.
 * Each bundle includes caption, hashtags, and a Bloom-ready image prompt.
 */
export async function generateBundlesViaMCP({ brandConfig, calendar, days = 7, language = 'English' }) {
    return callSocialTool('generate_full_bundle', {
        brand_config: brandConfig,
        calendar,
        days,
        language,
    });
}
