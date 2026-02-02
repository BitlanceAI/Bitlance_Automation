import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Credits API Client
 * Centralized API for credit management and ledger operations
 */
export const creditsApi = {
    /**
     * Get user balance (legacy endpoint)
     * @returns {Promise<{success: boolean, balance: number}>}
     */
    getBalance: async () => {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE_URL}/api/credits/balance`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    },

    /**
     * Get detailed balance with metadata (NEW)
     * @returns {Promise<{success: boolean, balance: number, lastUpdated: string}>}
     */
    getDetailedBalance: async () => {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE_URL}/api/credits/balance/detailed`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    },

    /**
     * Pre-flight check before executing an agent action (NEW)
     * @param {string} agentType - Agent identifier (blog, voice, design)
     * @param {number} estimatedQuantity - Estimated usage (words, seconds, images)
     * @returns {Promise<{success: boolean, hasEnough: boolean, creditsNeeded: number, currentBalance: number, deficit: number}>}
     */
    checkCredits: async (agentType, estimatedQuantity) => {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(
            `${API_BASE_URL}/api/credits/check`,
            { agentType, estimatedQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    },

    /**
     * Get usage history with pagination (NEW)
     * @param {number} limit - Number of records to fetch
     * @param {number} offset - Pagination offset
     * @returns {Promise<{success: boolean, history: Array, pagination: Object}>}
     */
    getHistory: async (limit = 50, offset = 0) => {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
            `${API_BASE_URL}/api/credits/history?limit=${limit}&offset=${offset}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    },

    /**
     * Get user analytics (aggregated stats) (NEW)
     * @returns {Promise<{success: boolean, analytics: Array}>}
     */
    getAnalytics: async () => {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE_URL}/api/credits/analytics`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    },

    /**
     * Get public pricing for all agents (NEW)
     * @returns {Promise<{success: boolean, pricing: Array}>}
     */
    getPricing: async () => {
        const { data } = await axios.get(`${API_BASE_URL}/api/credits/pricing`);
        return data;
    },

    /**
     * Get pricing for specific agent (NEW)
     * @param {string} agentType - Agent identifier
     * @returns {Promise<{success: boolean, pricing: Object}>}
     */
    getAgentPricing: async (agentType) => {
        const { data } = await axios.get(`${API_BASE_URL}/api/credits/pricing/${agentType}`);
        return data;
    },

    /**
     * Admin: Reconcile user balance (NEW)
     * @param {string} userId - User UUID
     * @returns {Promise<{success: boolean, reconciliation: Object}>}
     */
    reconcileBalance: async (userId) => {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(
            `${API_BASE_URL}/api/credits/reconcile/${userId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    },

    /**
     * Legacy: Deduct credits (kept for backward compatibility)
     * @deprecated Use ledger system instead
     */
    deductCredits: async (amount, action) => {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(
            `${API_BASE_URL}/api/credits/deduct`,
            { amount, action },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    }
};

export default creditsApi;
