/**
 * Service to handle interactions with n8n webhooks
 */

import API_BASE_URL from '../config';

// Use absolute path using API_BASE_URL to handle CORS
const N8N_WEBHOOK_URL = `${API_BASE_URL}/api/n8n/webhook/broadcast-bitlance`;

export const n8nService = {
    /**
     * Send a broadcast message via n8n
     * @param {Object} data - The broadcast data
     * @param {string} data.phone - Recipient phone number
     * @param {string} data.message - Message text
     * @param {string} [data.mediaUrl] - Optional media URL
     * @param {string} [data.mediaType] - Optional media type (image, video, document)
     * @returns {Promise<Object>} - The response from n8n
     */
    sendBroadcast: async (data) => {
        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to send broadcast');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending broadcast:', error);
            throw error;
        }
    }
};
