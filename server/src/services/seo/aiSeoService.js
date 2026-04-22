/**
 * src/services/aiSeoService.js
 *
 * AI SEO Processing Service — modular hook for title → SEO content generation.
 *
 * Current implementation: stub that returns a formatted string.
 * To swap in a real model (Gemini, OpenAI, Anthropic, etc.) just replace
 * the body of generateSEO() — the contract stays the same.
 */

// ─────────────────────────────────────────────────────────────────────────────
// generateSEO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate SEO-optimised content for a single title.
 *
 * @param {string} title - Raw title read from the Google Sheet
 * @returns {Promise<string>} - SEO-processed output string
 *
 * @example
 * // Stub output:
 * await generateSEO('10 Tips for Better Sleep');
 * // → "SEO Optimized: 10 Tips for Better Sleep"
 *
 * // Real-model swap example (Gemini):
 * // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
 * // const result = await model.generateContent(`Write an SEO meta description for: ${title}`);
 * // return result.response.text();
 */
export async function generateSEO(title) {
    if (!title || typeof title !== 'string') {
        throw new Error('generateSEO: title must be a non-empty string');
    }

    // ── STUB — replace with real AI call ─────────────────────────────────
    return `SEO Optimized: ${title}`;
    // ─────────────────────────────────────────────────────────────────────
}

/**
 * Generate SEO content for a single title and measure wall-clock time.
 *
 * @param {string} title
 * @returns {Promise<{ result: string, timeTakenMs: number, timeTakenSec: string }>}
 */
export async function generateSEOTimed(title) {
    const start = Date.now();
    let result;
    try {
        result = await generateSEO(title);
    } catch (err) {
        console.error(`[aiSeoService] Failed for title "${title}":`, err.message);
        result = `ERROR: ${err.message}`;
    }
    const timeTakenMs = Date.now() - start;
    return {
        result,
        timeTakenMs,
        timeTakenSec: (timeTakenMs / 1000).toFixed(2),
    };
}

/**
 * Batch-process an array of titles through generateSEO with per-row timing.
 * Processes sequentially so timings don't overlap.
 *
 * @param {string[]} titles
 * @returns {Promise<Array<{ result: string, timeTakenMs: number, timeTakenSec: string }>>}
 */
export async function batchGenerateSEOTimed(titles) {
    const results = [];
    for (const title of titles) {
        if (!title) {
            results.push({ result: '', timeTakenMs: 0, timeTakenSec: '0.00' });
            continue;
        }
        results.push(await generateSEOTimed(title));
    }
    return results;
}

/**
 * Batch-process an array of titles through generateSEO.
 * Empty / null titles are skipped (returns empty string in their slot).
 *
 * @param {string[]} titles
 * @returns {Promise<string[]>}
 */
export async function batchGenerateSEO(titles) {
    return Promise.all(
        titles.map(async (title) => {
            if (!title) return '';
            try {
                return await generateSEO(title);
            } catch (err) {
                console.error(`[aiSeoService] Failed for title "${title}":`, err.message);
                return `ERROR: ${err.message}`;
            }
        })
    );
}
