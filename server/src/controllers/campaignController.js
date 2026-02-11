import { supabase, supabaseAdmin } from '../config/supabaseClient.js';
import AnalyticsService from '../services/analyticsService.js';
import MetaService from '../services/metaService.js';
import { decryptData } from '../utils/encryption.js';

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

        // 2. Try to create on Meta (Async or Sync? Sync for now to return ID)
        let metaResult = null;
        try {
            console.log('🔄 [Campaign] Checking for Meta connection...');
            // Get connection
            const { data: connection } = await db
                .from('meta_connections')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .single();

            if (connection) {
                console.log('🔐 [Campaign] Decrypting token...');
                const decryptedToken = decryptData(connection.access_token);
                if (decryptedToken) {
                    const metaService = new MetaService(decryptedToken);

                    const adAccountId = connection.ad_accounts?.[0]?.account_id;
                    console.log(`📢 [Campaign] Using Ad Account: ${adAccountId}`);

                    if (adAccountId) {
                        const metaObjective = META_OBJECTIVE_MAP[dbType] || 'OUTCOME_AWARENESS';

                        console.log(`🚀 [Campaign] Creating on Meta: ${name} (${metaObjective})`);

                        // Convert budget to cents if provided (Meta expects 1000 for 10.00)
                        // Assuming frontend sends float like 10.00
                        const dailyBudget = budget ? Math.round(parseFloat(budget) * 100) : null;

                        metaResult = await metaService.createCampaign(adAccountId, {
                            name: name || 'Untitled Campaign',
                            objective: metaObjective,
                            status: 'PAUSED', // Always create as PAUSED first
                            special_ad_categories: [], // Required
                            dailyBudget // Pass budget
                        });

                        if (metaResult.success) {
                            console.log('✅ [Campaign] Meta Success:', metaResult.data);

                            // Update local record with Meta ID
                            await db
                                .from('campaigns')
                                .update({
                                    meta_campaign_id: metaResult.data.id,
                                    status: 'PAUSED' // Sync status
                                })
                                .eq('id', localCampaign.id);

                            localCampaign.meta_campaign_id = metaResult.data.id;
                            localCampaign.status = 'PAUSED';
                        } else {
                            console.error('❌ [Campaign] Meta Failed:', metaResult.error);
                            // Keep local campaign but maybe log error?
                            // Note: We intentionally swallow this error to avoid failing the local creation
                        }
                    } else {
                        console.warn('⚠️ [Campaign] No Ad Account found for Meta connection');
                    }
                } else {
                    console.error('❌ [Campaign] Token decryption failed');
                }
            } else {
                console.log('ℹ️ [Campaign] No active Meta connection found, skipping Meta creation');
            }
        } catch (metaError) {
            console.error('⚠️ [Campaign] Meta Integration Exception:', metaError);
            // Don't fail the whole request check
        }

        console.log('🏁 [Campaign] Sending response');
        res.status(201).json({
            success: true,
            campaign: localCampaign,
            meta_result: metaResult
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

        // Fetch Meta Stats if available
        if (campaign.meta_campaign_id) {
            try {
                // Get connection to decrypt token
                const { data: connection } = await db
                    .from('meta_connections')
                    .select('access_token')
                    .eq('user_id', userId)
                    .eq('is_active', true)
                    .single();

                if (connection) {
                    const token = decryptData(connection.access_token);
                    if (token) {
                        const metaService = new MetaService(token);
                        const insights = await metaService.getCampaignInsights(campaign.meta_campaign_id);

                        if (insights.success && insights.data && insights.data.data && insights.data.data.length > 0) {
                            const metaData = insights.data.data[0];
                            // Merge or overwrite internal stats?
                            // Usually Meta stats are authoritative for Meta campaigns.
                            // But we might have internal tracking too.
                            // For now, let's use Meta stats as they include spend.
                            impressions = parseInt(metaData.impressions || 0);
                            clicks = parseInt(metaData.clicks || 0);
                            spend = parseFloat(metaData.spend || 0);
                            cpc = parseFloat(metaData.cpc || 0);
                        }
                    }
                }
            } catch (metaStatsError) {
                console.warn('Failed to fetch Meta stats:', metaStatsError);
            }
        }

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
