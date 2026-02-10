import AwarenessStrategy from './strategies/AwarenessStrategy.js';
import TrafficStrategy from './strategies/TrafficStrategy.js';
import LeadGenStrategy from './strategies/LeadGenStrategy.js';
import SalesStrategy from './strategies/SalesStrategy.js';
// ... import other strategies as needed

class CampaignFactoryService {
    constructor(metaService, supabase) {
        this.meta = metaService;
        this.supabase = supabase;

        // Initialize Strategies
        this.strategies = {
            'AWARENESS': new AwarenessStrategy(metaService, supabase),
            'TRAFFIC': new TrafficStrategy(metaService, supabase),
            'LEAD_GENERATION': new LeadGenStrategy(metaService, supabase),
            'SALES': new SalesStrategy(metaService, supabase),
            // 'ENGAGEMENT': new EngagementStrategy(...),
            // 'APP_PROMOTION': new AppPromotionStrategy(...),
            // 'LOCAL_BUSINESS': new LocalBusinessStrategy(...),
            // 'REMARKETING': new RemarketingStrategy(...),
            // 'OFFER_EVENT': new OfferEventStrategy(...)
        };
    }

    /**
     * Main Entry Point: Create a Campaign
     */
    async createCampaign({ user, promotionType, campaignData }) {
        console.log(`[CampaignFactory] Creating ${promotionType} campaign for user ${user.id}`);

        const strategy = this.strategies[promotionType];
        if (!strategy) {
            throw new Error(`Unsupported Promotion Type: ${promotionType}`);
        }

        try {
            // 1. Validate & Map Objective
            const metaObjective = strategy.getObjective();

            // 2. Create Campaign on Meta
            const campaignName = `${promotionType} - ${campaignData.name} - ${new Date().toISOString().split('T')[0]}`;
            const metaCampaign = await this.meta.createCampaign(
                campaignData.adAccountId,
                campaignName,
                metaObjective,
                { status: 'PAUSED', special_ad_categories: [] } // Default to PAUSED for safety
            );

            // 3. Create Ad Set (Strategy Specific)
            const adSetPayload = strategy.buildAdSetPayload(campaignData, metaCampaign.id);
            const metaAdSet = await this.meta.createAdSet(campaignData.adAccountId, adSetPayload);

            // 4. Create Ad Creative
            const creativePayload = strategy.buildCreativePayload(campaignData.creative, campaignData.pageId);
            const metaCreative = await this.meta.createAdCreative(campaignData.adAccountId, creativePayload);

            // 5. Create Ad
            const adPayload = {
                name: `Ad - ${campaignData.name}`,
                adset_id: metaAdSet.id,
                creative: { creative_id: metaCreative.id },
                status: 'PAUSED'
            };
            const metaAd = await this.meta.createAd(campaignData.adAccountId, adPayload);

            // 6. Log to Supabase (Single Source of Truth)
            const { data: dbCampaign, error } = await this.supabase
                .from('campaigns')
                .insert({
                    user_id: user.id,
                    meta_campaign_id: metaCampaign.id,
                    meta_adset_id: metaAdSet.id,
                    meta_ad_id: metaAd.id,
                    name: campaignName,
                    type: promotionType,
                    status: 'PAUSED',
                    objective: metaObjective,
                    budget_daily: campaignData.budget.daily_amount,
                    start_time: campaignData.schedule.start_time,
                    end_time: campaignData.schedule.end_time,
                    raw_config: campaignData
                })
                .select()
                .single();

            if (error) throw error;

            return {
                message: 'Campaign Created Successfully',
                campaign: dbCampaign,
                metaIds: {
                    campaign: metaCampaign.id,
                    adSet: metaAdSet.id,
                    ad: metaAd.id
                }
            };

        } catch (error) {
            console.error('[CampaignFactory] Creation Failed:', error);
            // TODO: Implement Rollback logic (delete created Meta objects if partial failure)
            throw error;
        }
    }
}

export default CampaignFactoryService;
