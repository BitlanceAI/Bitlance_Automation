import { supabase } from '../config/supabaseClient.js';
import { createClient } from '@supabase/supabase-js';

const getScopedSupabase = (token) => {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};

export const getCredits = async (req, res) => {
    try {
        const userId = req.user.id;
        const scopedSupabase = getScopedSupabase(req.token);

        const { data, error } = await scopedSupabase
            .from('user_credits')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (error) throw error; // If PGRST116, it throws, caught below.

        res.json({ success: true, balance: data?.balance || 0 });
    } catch (error) {
        console.error('Error fetching credits:', error);
        // Handle no rows gracefully for get
        if (error.code === 'PGRST116') {
            return res.json({ success: true, balance: 0 });
        }
        res.status(500).json({ success: false, error: "Failed to fetch credits" });
    }
};

export const deductCredits = async (req, res) => {
    try {
        const { amount, action } = req.body;
        const userId = req.user.id;
        const scopedSupabase = getScopedSupabase(req.token);

        if (!amount) {
            return res.status(400).json({ success: false, error: 'Amount required' });
        }

        // 1. Check current balance
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

        // 2. Deduct credits
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
