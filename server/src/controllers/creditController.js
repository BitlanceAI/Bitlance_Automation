import CreditLedgerService from '../services/creditLedgerService.js';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { createClient } from '@supabase/supabase-js';

// Legacy scoped Supabase helper
const getScopedSupabase = (token) => {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};

/**
 * LEGACY: Get credits (kept for backward compatibility)
 * TODO: Migrate to getUserBalance
 */
export const getCredits = async (req, res) => {
    try {
        const userId = req.user.id;
        const scopedSupabase = getScopedSupabase(req.token);

        const { data, error } = await scopedSupabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        res.json({ success: true, balance: data?.balance || 0 });
    } catch (error) {
        console.error('Error fetching credits:', error);
        if (error.code === 'PGRST116') {
            return res.json({ success: true, balance: 0 });
        }
        res.status(500).json({ success: false, error: "Failed to fetch credits" });
    }
};

/**
 * LEGACY: Deduct credits (kept for backward compatibility)
 * TODO: Migrate to credit ledger system
 */
export const deductCredits = async (req, res) => {
    try {
        const { amount, action } = req.body;
        const userId = req.user.id;
        const scopedSupabase = getScopedSupabase(req.token);

        if (!amount) {
            return res.status(400).json({ success: false, error: 'Amount required' });
        }

        const { data: currentData, error: fetchError } = await scopedSupabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (fetchError) throw fetchError;

        const currentBalance = currentData?.balance || 0;

        if (currentBalance < amount) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient credits',
                currentBalance
            });
        }

        const { data: updatedData, error: updateError } = await scopedSupabase
            .from('user_credits')
            .update({
                balance: currentBalance - amount,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Credits deducted successfully',
            newBalance: updatedData.balance
        });

    } catch (error) {
        console.error('Error deducting credits:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// NEW CREDIT LEDGER ENDPOINTS
// ============================================

/**
 * Get current user balance with metadata
 */
export const getUserBalance = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabaseAdmin
            .from('user_credits')
            .select('balance, updated_at')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        res.json({
            success: true,
            balance: data.balance,
            lastUpdated: data.updated_at
        });

    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get user usage history with pagination
 */
export const getUserUsageHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;

        const history = await CreditLedgerService.getUserUsageHistory(
            userId,
            parseInt(limit),
            parseInt(offset)
        );

        res.json({
            success: true,
            history,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: history.length === parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Usage history error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get user analytics (aggregated stats)
 */
export const getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        const analytics = await CreditLedgerService.getUserAnalytics(userId);

        res.json({
            success: true,
            analytics
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Pre-flight credit check before executing an agent action
 */
export const checkCreditsForAgent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { agentType, estimatedQuantity } = req.body;

        if (!agentType || !estimatedQuantity) {
            return res.status(400).json({
                success: false,
                error: 'agentType and estimatedQuantity are required'
            });
        }

        const validation = await CreditLedgerService.validateCreditsAvailable(
            userId,
            agentType,
            parseInt(estimatedQuantity)
        );

        res.json({
            success: true,
            ...validation
        });

    } catch (error) {
        console.error('Credit check error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Admin: Reconcile user balance
 */
export const reconcileUserBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if requester is admin
        const isAdmin = req.user.raw_user_meta_data?.role === 'admin';
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const result = await CreditLedgerService.reconcileBalance(userId);

        res.json({
            success: true,
            reconciliation: result
        });

    } catch (error) {
        console.error('Reconciliation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get public pricing information
 */
export const getPricing = async (req, res) => {
    try {
        const pricing = await CreditLedgerService.getAllPricing();

        res.json({
            success: true,
            pricing
        });

    } catch (error) {
        console.error('Get pricing error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get pricing for a specific agent
 */
export const getAgentPricing = async (req, res) => {
    try {
        const { agentType } = req.params;

        const pricing = await CreditLedgerService.getAgentPricing(agentType);

        if (!pricing) {
            return res.status(404).json({
                success: false,
                error: `No pricing found for agent: ${agentType}`
            });
        }

        res.json({
            success: true,
            pricing
        });

    } catch (error) {
        console.error('Get agent pricing error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Get agent-specific usage statistics for the current user
 */
export const getAgentStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { agentType } = req.params;

        // Get total credits used for this agent
        const { data: ledgerData, error: ledgerError } = await supabaseAdmin
            .from('credit_ledger')
            .select('credits_used, created_at')
            .eq('user_id', userId)
            .eq('agent_type', agentType)
            .order('created_at', { ascending: false });

        if (ledgerError) throw ledgerError;

        // Calculate statistics
        const totalCreditsUsed = ledgerData.reduce((sum, entry) => sum + entry.credits_used, 0);
        const totalUsageCount = ledgerData.length;

        // Get last usage date
        const lastUsed = ledgerData.length > 0 ? ledgerData[0].created_at : null;

        // Get current user balance
        const { data: balanceData, error: balanceError } = await supabaseAdmin
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (balanceError) throw balanceError;

        res.json({
            success: true,
            stats: {
                agentType,
                totalCreditsUsed,
                totalUsageCount,
                lastUsed,
                currentBalance: balanceData.balance
            }
        });

    } catch (error) {
        console.error('Get agent stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
