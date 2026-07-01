import dotenv from 'dotenv';
dotenv.config();

import ws from 'ws';
global.WebSocket = ws;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEW_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const newDb = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
    console.log('\n🔍 Checking new DB tables...\n');

    // Check organizations
    const { data: orgs, error: orgErr } = await newDb.from('organizations').select('id, name, admin_id').limit(5);
    if (orgErr) {
        console.error('❌ organizations table error:', orgErr.message);
    } else {
        console.log(`✅ organizations table OK — ${orgs.length} row(s):`, orgs);
    }

    // Check wallet
    const { data: wallets, error: walletErr } = await newDb.from('wallet').select('id, balance, organization_id').limit(5);
    if (walletErr) {
        console.error('❌ wallet table error:', walletErr.message);
    } else {
        console.log(`✅ wallet table OK — ${wallets.length} row(s):`, wallets);
    }

    // Check active_calls
    const { data: calls, error: callErr } = await newDb.from('active_calls').select('call_id').limit(5);
    if (callErr) {
        console.error('❌ active_calls table error:', callErr.message);
    } else {
        console.log(`✅ active_calls table OK — ${calls.length} row(s)`);
    }

    // Check sales_calls
    const { data: sc, error: scErr } = await newDb.from('sales_calls').select('*');
    if (scErr) {
        console.error('❌ sales_calls table error:', scErr.message);
    } else {
        console.log(`\n✅ sales_calls table OK — ${sc.length} row(s):`, JSON.stringify(sc, null, 2));
    }

    // Check transactions
    const { data: txs, error: txsErr } = await newDb.from('transactions').select('*');
    if (txsErr) {
        console.error('❌ transactions table error:', txsErr.message);
    } else {
        console.log(`\n✅ transactions table OK — ${txs.length} row(s):`, JSON.stringify(txs, null, 2));
    }

    // Check call_analytics
    const { data: ca, error: caErr } = await newDb.from('call_analytics').select('*');
    if (caErr) {
        console.error('❌ call_analytics table error:', caErr.message);
    } else {
        console.log(`\n✅ call_analytics table OK — ${ca.length} row(s):`, JSON.stringify(ca, null, 2));
    }

    // Check lotlite_leads
    const { data: ll, error: llErr } = await newDb.from('lotlite_leads').select('*');
    if (llErr) {
        console.error('❌ lotlite_leads table error:', llErr.message);
    } else {
        console.log(`\n✅ lotlite_leads table OK — ${ll.length} row(s):`, JSON.stringify(ll, null, 2));
    }

    process.exit(0);
}

check();
