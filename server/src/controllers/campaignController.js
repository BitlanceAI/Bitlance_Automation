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

// Map internal types to Meta Objectives (v19.0+)
const META_OBJECTIVE_MAP = {
    'AWARENESS': 'OUTCOME_AWARENESS',
    'TRAFFIC': 'OUTCOME_TRAFFIC',
    'ENGAGEMENT': 'OUTCOME_ENGAGEMENT',
    'LEAD_GENERATION': 'OUTCOME_LEADS',
    'SALES': 'OUTCOME_SALES',
    'APP_PROMOTION': 'OUTCOME_APP_PROMOTION',
    'LOCAL_BUSINESS': 'OUTCOME_AWARENESS', // Or OUTCOME_LEADS depending on goal
    'REMARKETING': 'OUTCOME_SALES', // Default fallback
    'OFFER_EVENT': 'OUTCOME_SALES'
};

export const createCampaign = async (req, res) => {
    console.log('📝 [Campaign] Create request received');
    try {
        if (!req.user || !req.user.id) {
            console.error('❌ [Campaign] User not authenticated in controller');
            return res.status(401).json({ success: false, error: 'User authentication failed' });
        }

        const { type, name, objective, creative_assets, destination_url, start_date, end_date, targeting, budget, ...extra } = req.body;
        const userId = req.user.id;
        console.log(`👤 [Campaign] User: ${userId}, Type: ${type}, Budget: ${budget}`);

        const dbType = TYPE_MAP[type];
        if (!dbType) {
            console.error(`❌ [Campaign] Invalid type: ${type}`);
            return res.status(400).json({ success: false, error: `Invalid campaign type: ${type}` });
        }

        // 1. Create Local Campaign (DRAFT)
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
            raw_config: { destination_url, budget, ...extra }
        };

        console.log('💾 [Campaign] Inserting into DB...', campaignRow);
        const { data: localCampaign, error: dbError } = await db
            .from('campaigns')
            .insert(campaignRow)
            .select()
            .single();

        if (dbError) {
            console.error('❌ [Campaign] DB Error:', dbError);
            throw dbError;
        }

        if (!localCampaign) {
            console.error('❌ [Campaign] No data returned from insert');
            throw new Error('Failed to create campaign record');
        }

        console.log('✅ [Campaign] Local campaign created:', localCampaign.id);

        console.log('🏁 [Campaign] Sending response');
        res.status(201).json({
            success: true,
            campaign: localCampaign
        });

    } catch (error) {
        console.error('❌ [Campaign] Global Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
        }
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
        res.status(500).json({ success: false, error: error.message });
    }
};

export const stopCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership & get meta campaign ID
        const { data: campaign, error: campError } = await db
            .from('campaigns')
            .select('id, meta_campaign_id, status')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (campError || !campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        if (campaign.status === 'PAUSED') {
            return res.status(400).json({ success: false, error: 'Campaign is already paused' });
        }

        // Update local status
        await db
            .from('campaigns')
            .update({ status: 'PAUSED' })
            .eq('id', id);

        console.log(`⏸️ [Campaign] Stopped campaign: ${id}`);
        res.json({ success: true, message: 'Campaign paused successfully' });

    } catch (error) {
        console.error('Stop Campaign Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership & get meta campaign ID
        const { data: campaign, error: campError } = await db
            .from('campaigns')
            .select('id, meta_campaign_id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (campError || !campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        // Delete from local DB
        const { error: deleteError } = await db
            .from('campaigns')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        console.log(`🗑️ [Campaign] Deleted campaign: ${id}`);
        res.json({ success: true, message: 'Campaign deleted successfully' });

    } catch (error) {
        console.error('Delete Campaign Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getCampaignStats = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify campaign ownership
        const { data: campaign, error: campError } = await db
            .from('campaigns')
            .select('id, meta_campaign_id, raw_config')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (campError || !campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        // Fetch Internal Stats (Impressions & Clicks)
        // Using parallel queries for efficiency
        const [impressionsRes, clicksRes] = await Promise.all([
            db.from('events')
                .select('*', { count: 'exact', head: true })
                .eq('campaign_id', id)
                .eq('event_type', 'impression'),
            db.from('events')
                .select('*', { count: 'exact', head: true })
                .eq('campaign_id', id)
                .eq('event_type', 'click')
        ]);

        let impressions = impressionsRes.count || 0;
        let clicks = clicksRes.count || 0;
        let spend = 0;
        let cpc = 0;

        res.json({
            success: true,
            stats: {
                impressions,
                clicks,
                ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0,
                spend: spend.toFixed(2),
                cpc: cpc.toFixed(2),
                budget: campaign.raw_config?.budget || 0
            }
        });

    } catch (error) {
        console.error('Get Campaign Stats Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
