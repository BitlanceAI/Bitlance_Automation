import { supabase, supabaseAdmin } from '../config/supabaseClient.js';

/**
 * Credit Ledger Service
 * Centralized service for managing credit consumption across all AI agents
 */
class CreditLedgerService {
    /**
     * Deduct credits atomically with ledger entry
     * @param {Object} params - Transaction parameters
     * @param {string} params.userId - User UUID
     * @param {string} params.agentType - Agent identifier (blog, voice, design)
     * @param {string} params.referenceId - UUID of resource that consumed credits
     * @param {string} params.referenceTable - Table name (articles, sales_calls, etc.)
     * @param {number} params.usageQuantity - Amount consumed (words, seconds, images)
     * @param {Object} params.metadata - Additional context data
     * @returns {Promise<Object>} Transaction result
     */
    static async deductCreditsWithLedger({
        userId,
        agentType,
        referenceId,
        referenceTable,
        usageQuantity,
        metadata = {}
    }) {
        try {
            // Call the atomic PostgreSQL function
            const { data, error } = await supabaseAdmin.rpc('deduct_credits_with_ledger', {
                p_user_id: userId,
                p_agent_type: agentType,
                p_reference_id: referenceId,
                p_reference_table: referenceTable,
                p_usage_quantity: usageQuantity,
                p_metadata: metadata
            });

            if (error) {
                console.error('Credit deduction error:', error);
                throw new Error(error.message);
            }

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`✅ Credits deducted: ${data.credits_deducted} (Balance: ${data.new_balance})`);
            return data;

        } catch (error) {
            console.error('Credit ledger error:', error);

            // Handle insufficient credits specifically
            if (error.message.includes('Insufficient credits')) {
                const err = new Error('INSUFFICIENT_CREDITS');
                err.code = 'INSUFFICIENT_CREDITS';
                throw err;
            }

            throw error;
        }
    }

    /**
     * Pre-flight check: Verify user has enough credits
     * @param {string} userId 
     * @param {string} agentType 
     * @param {number} estimatedQuantity 
     * @returns {Promise<Object>} Validation result
     */
    static async validateCreditsAvailable(userId, agentType, estimatedQuantity) {
        try {
            // Get pricing
            const { data: pricing, error: pricingError } = await supabaseAdmin
                .from('agent_pricing')
                .select('unit_cost')
                .eq('agent_type', agentType)
                .eq('is_active', true)
                .single();

            if (pricingError) throw pricingError;
            if (!pricing) throw new Error(`No pricing found for agent: ${agentType}`);

            const creditsNeeded = estimatedQuantity * pricing.unit_cost;

            // Get user balance
            const { data: userCredits, error: balanceError } = await supabaseAdmin
                .from('user_credits')
                .select('balance')
                .eq('user_id', userId)
                .single();

            if (balanceError) throw balanceError;

            const hasEnough = userCredits.balance >= creditsNeeded;

            return {
                hasEnough,
                creditsNeeded,
                currentBalance: userCredits.balance,
                deficit: hasEnough ? 0 : creditsNeeded - userCredits.balance
            };

        } catch (error) {
            console.error('Credit validation error:', error);
            throw error;
        }
    }

    /**
     * Get user usage history with pagination
     * @param {string} userId 
     * @param {number} limit 
     * @param {number} offset 
     * @returns {Promise<Array>} Usage history
     */
    static async getUserUsageHistory(userId, limit = 50, offset = 0) {
        try {
            const { data, error } = await supabaseAdmin.rpc('get_user_usage_history', {
                p_user_id: userId,
                p_limit: limit,
                p_offset: offset
            });

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('Usage history error:', error);
            throw error;
        }
    }

    /**
     * Get aggregated analytics for a user
     * @param {string} userId 
     * @returns {Promise<Array>} Analytics data
     */
    static async getUserAnalytics(userId) {
        try {
            const { data, error } = await supabaseAdmin
                .from('user_credit_analytics')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('Analytics error:', error);
            throw error;
        }
    }

    /**
     * Admin: Reconcile user balance
     * @param {string} userId 
     * @returns {Promise<Object>} Reconciliation result
     */
    static async reconcileBalance(userId) {
        try {
            const { data, error } = await supabaseAdmin.rpc('reconcile_user_balance', {
                p_user_id: userId
            });

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Reconciliation error:', error);
            throw error;
        }
    }

    /**
     * Get pricing for all agents
     * @returns {Promise<Array>} Pricing configuration
     */
    static async getAllPricing() {
        try {
            const { data, error } = await supabaseAdmin
                .from('agent_pricing')
                .select('*')
                .eq('is_active', true)
                .order('agent_type');

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('Pricing fetch error:', error);
            throw error;
        }
    }

    /**
     * Get pricing for a specific agent
     * @param {string} agentType 
     * @returns {Promise<Object>} Pricing info
     */
    static async getAgentPricing(agentType) {
        try {
            const { data, error } = await supabaseAdmin
                .from('agent_pricing')
                .select('*')
                .eq('agent_type', agentType)
                .eq('is_active', true)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Agent pricing fetch error:', error);
            throw error;
        }
    }
}

export default CreditLedgerService;
