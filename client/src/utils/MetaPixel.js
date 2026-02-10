/**
 * Meta Pixel Utility
 * Handles client-side tracking and server-side event forwarding
 */

// Your Meta Pixel ID
const PIXEL_ID = '916142120954550';

export const MetaPixel = {
    /**
     * Initialize Meta Pixel (already loaded in index.html, this is a fallback)
     * @param {string} pixelId - Optional override
     */
    init: (pixelId = PIXEL_ID) => {
        // Pixel is already initialized in index.html
        // This function exists for compatibility but doesn't re-init
        if (typeof window.fbq !== 'function') {
            console.warn('Meta Pixel not loaded. Check index.html.');
        }
    },

    /**
     * Track Standard Event
     * @param {string} eventName - e.g. 'PageView', 'Lead', 'Purchase'
     * @param {object} data - Event properties
     * @param {object} userData - User data for Advanced Matching (email, phone, etc.)
     */
    track: async (eventName, data = {}, userData = {}) => {
        // 1. Client-Side Track (Pixel)
        if (typeof window.fbq === 'function') {
            window.fbq('track', eventName, data);
        }

        // 2. Server-side Track (CAPI)
        try {
            // Get fbc/fbp cookies
            const fbc = getCookie('_fbc');
            const fbp = getCookie('_fbp');

            await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventName,
                    eventTime: Math.floor(Date.now() / 1000),
                    userData: { ...userData, fbc, fbp },
                    customData: data,
                    sourceUrl: window.location.href,
                    eventId: crypto.randomUUID() // Deduplication ID
                })
            });
        } catch (error) {
            console.error('CAPI Tracking Failed:', error);
        }
    },

    /**
     * Track Custom Event
     */
    trackCustom: (eventName, data = {}) => {
        if (typeof window.fbq === 'function') {
            window.fbq('trackCustom', eventName, data);
        }
    }
};

// Helper to get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export default MetaPixel;
