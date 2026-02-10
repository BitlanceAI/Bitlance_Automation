import { supabase } from '../config/supabaseClient.js';
import AnalyticsService from '../services/analyticsService.js';
import MetaService from '../services/metaService.js';
import CampaignFactoryService from '../services/campaigns/CampaignFactoryService.js';

export const createCampaign = async (req, res) => {
    try {
        const { type, ...campaignData } = req.body;
        const userId = req.user.id;

        let tableName;
        switch (type) {
            case 'awareness': tableName = 'awareness_campaigns'; break;
            case 'traffic': tableName = 'traffic_campaigns'; break;
            case 'engagement': tableName = 'engagement_campaigns'; break;
            case 'leadgen': tableName = 'leadgen_campaigns'; break;
            case 'conversion': tableName = 'conversion_campaigns'; break;
            case 'app_promotion': tableName = 'app_promotion_campaigns'; break;
            case 'local_business': tableName = 'local_business_campaigns'; break;
            case 'remarketing': tableName = 'remarketing_campaigns'; break;
            case 'offer_event': tableName = 'offer_event_campaigns'; break;
            default: return res.status(400).json({ error: 'Invalid campaign type' });
        }

        const { data, error } = await supabase
            .from(tableName)
            .insert({ ...campaignData, created_by: userId })
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
        let query = supabase.from('awareness_campaigns').select('*'); // Default, need to handle multiple types or specific type

        // Simplified for MVP: just fetch awareness for now or specific table if provided
        // In a real app, might want a union view or separate endpoints
        let tableName = 'awareness_campaigns';
        if (type === 'traffic') tableName = 'traffic_campaigns';
        if (type === 'engagement') tableName = 'engagement_campaigns';
        if (type === 'leadgen') tableName = 'leadgen_campaigns';
        if (type === 'conversion') tableName = 'conversion_campaigns';
        if (type === 'app_promotion') tableName = 'app_promotion_campaigns';
        if (type === 'local_business') tableName = 'local_business_campaigns';
        if (type === 'remarketing') tableName = 'remarketing_campaigns';
        if (type === 'offer_event') tableName = 'offer_event_campaigns';

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('created_by', req.user.id) // Filter by user
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, campaigns: data });
    } catch (error) {
        console.error('Get Campaigns Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const serveCampaign = async (req, res) => {
    try {
        const { type, context } = req.query; // context could be 'sidebar', 'hero', etc.
        const userId = req.user ? req.user.id : null;

        // Logic to select best campaign
        // 1. Fetch active campaigns of requested type
        // 2. Filter by targeting (simple version)
        // 3. Check frequency caps (if user is logged in)
        // 4. Return selected campaign

        let tableName = 'awareness_campaigns';
        if (type === 'traffic') tableName = 'traffic_campaigns';

        const { data: campaigns, error } = await supabase
            .from(tableName)
            .select('*')
            //.eq('status', 'active') // Uncomment when status field is populated/used
            .limit(5); // Get a batch to choose from

        if (error) throw error;

        if (!campaigns || campaigns.length === 0) {
            return res.json({ success: true, campaign: null });
        }

        // Simple Random Selection for MVP
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
