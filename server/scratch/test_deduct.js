import dotenv from 'dotenv';
dotenv.config();

import ws from 'ws';
global.WebSocket = ws;

import { createClient } from '@supabase/supabase-js';

const newDb = createClient(process.env.NEW_SUPABASE_URL, process.env.NEW_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function deductDbCredits(adminId, amount, callId, orgId) {
    if (amount <= 0) return 0;
    try {
        const { data: wallet, error: walletErr } = await newDb
            .from('wallet')
            .select('id, balance')
            .eq('organization_id', orgId)
            .single();

        if (walletErr || !wallet) {
            console.error(`[deductDbCredits] Wallet not found for org ${orgId}:`, walletErr?.message);
            return 0;
        }

        const currentBalance = parseFloat(wallet.balance);
        console.log('Current balance:', currentBalance);
        let toDeduct = Math.min(amount, currentBalance);
        if (toDeduct <= 0) return 0;

        // Round to nearest integer since wallet balance is an INTEGER type in DB
        toDeduct = Math.round(toDeduct);
        if (amount > 0 && toDeduct === 0 && currentBalance >= 1) {
            toDeduct = 1;
        }

        console.log('To deduct (rounded):', toDeduct);
        const newBalance = Math.max(0, currentBalance - toDeduct);
        console.log('New balance to update:', newBalance);

        const { error: updateErr } = await newDb
            .from('wallet')
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq('id', wallet.id);

        if (updateErr) {
            console.error(`[deductDbCredits] Failed to update wallet:`, updateErr.message);
            return 0;
        }

        // Record transaction
        const txResult = await newDb.from('transactions').insert({
            organization_id: orgId,
            wallet_id: wallet.id,
            amount: -toDeduct,
            type: 'debit',
            description: `Voice call credit deduction for call ${callId}`,
            reference_table: 'sales_calls'
        });
        if (txResult.error) {
            console.error('[deductDbCredits] Transaction log failed:', txResult.error.message);
        } else {
            console.log('Transaction logged successfully.');
        }

        console.log(`✅ [deductDbCredits] Deducted ${toDeduct} credits from org ${orgId}. New balance: ${newBalance}`);
        return toDeduct;
    } catch (err) {
        console.error(`[deductDbCredits] Error:`, err.stack);
        return 0;
    }
}

async function run() {
    const adminId = '152ed44a-aeaf-46db-9f39-f960caa4b076';
    const orgId = 'b78dc4f9-7083-4bac-8ac2-7f318e3c54fd';
    const amount = 2.0833;
    const callId = 'test-run-12345';
    
    console.log('Running simulated deduction...');
    await deductDbCredits(adminId, amount, callId, orgId);
    process.exit(0);
}

run();
