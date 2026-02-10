import { supabase, supabaseAdmin } from '../config/supabaseClient.js';
import AnalyticsService from '../services/analyticsService.js';

// Use admin client (bypasses RLS) since auth is already handled by middleware
const db = supabaseAdmin || supabase;

// Map frontend type values to DB enum values
const TYPE_MAP = {
    'awareness': 'AWARENESS',
    'traffic': 'TRAFFIC',
    'engagement': 'ENGAGEMENT',
    'leadgen': 'LEAD_GENERATION',
    'conversion': 'SALES',
    'app_promotion': 'APP_PROMOTION',
    'local_business': 'LOCAL_BUSINESS',
    'remarketing': 'REMARKETING',
    'offer_event': 'OFFER_EVENT'
};

export const createCampaign = async (req, res) => {
    try {
        const { type, name, objective, creative_assets, destination_url, start_date, end_date, targeting, ...extra } = req.body;
        const userId = req.user.id;

        const dbType = TYPE_MAP[type];
        if (!dbType) {
            return res.status(400).json({ success: false, error: `Invalid campaign type: ${type}` });
        }

        const campaignRow = {
            user_id: userId,
            name: name || 'Untitled Campaign',
            type: dbType,
            objective: objective || type,
            status: 'DRAFT',
            creative: creative_assets || null,
            targeting: targeting || null,
            start_time: start_date || null,
            end_time: end_date || null,
            raw_config: { destination_url, ...extra }
        };

        const { data, error } = await db
            .from('campaigns')
            .insert(campaignRow)
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ success: true, campaign: data });
    } catch (error) {
        console.error('Create Campaign Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getCampaigns = async (req, res) => {
    try {
        const { type } = req.query;
        const userId = req.user.id;

        let query = db
            .from('campaigns')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        // Filter by type if provided
        if (type && TYPE_MAP[type]) {
            query = query.eq('type', TYPE_MAP[type]);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ success: true, campaigns: data || [] });
    } catch (error) {
        console.error('Get Campaigns Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const serveCampaign = async (req, res) => {
    try {
        const { type, context } = req.query;
        const userId = req.user ? req.user.id : null;

        let query = db
            .from('campaigns')
            .select('*')
            .eq('status', 'ACTIVE')
            .limit(5);

        if (type && TYPE_MAP[type]) {
            query = query.eq('type', TYPE_MAP[type]);
        }

        const { data: campaigns, error } = await query;

        if (error) throw error;

        if (!campaigns || campaigns.length === 0) {
            return res.json({ success: true, campaign: null });
        }

        // Simple Random Selection
        const selected = campaigns[Math.floor(Math.random() * campaigns.length)];

        // Track Impression (Async)
        AnalyticsService.trackEvent(`${type}_campaign_impression`, {
            campaignId: selected.id,
            placement: context
        }, userId, req.headers['x-session-id']);

        res.json({ success: true, campaign: selected });

    } catch (error) {
        console.error('Serve Campaign Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const trackInteraction = async (req, res) => {
    try {
        const { campaignId, action, properties } = req.body;
        const userId = req.user ? req.user.id : null;

        await AnalyticsService.trackEvent(action, {
            campaignId,
            ...properties
        }, userId, req.headers['x-session-id']);

        res.json({ success: true });
    } catch (error) {
        console.error('Track Interaction Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
