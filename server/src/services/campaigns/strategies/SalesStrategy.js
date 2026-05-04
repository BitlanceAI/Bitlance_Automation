import BaseCampaignStrategy from './BaseCampaignStrategy.js';

class SalesStrategy extends BaseCampaignStrategy {

    getObjective() {
        return 'OUTCOME_SALES';
    }

    buildAdSetPayload(config, campaignId) {
        if (!config.pixelId) {
            throw new Error('Sales campaigns require a valid Pixel ID');
        }

        return {
            name: `AdSet - Sales`,
            campaign_id: campaignId,
            daily_budget: config.budget.daily_amount * 100,
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'OFFSITE_CONVERSIONS',
            promoted_object: {
                pixel_id: config.pixelId,
                custom_event_type: 'PURCHASE' // or LEAD, ADD_TO_CART
            },
            start_time: config.schedule.start_time,
            end_time: config.schedule.end_time,
            targeting: config.targeting,
            status: 'PAUSED'
        };
    }

    buildCreativePayload(creative, pageId) {
        return {
            name: `Creative - Sales`,
            object_story_spec: {
                page_id: pageId,
                link_data: {
                    message: creative.text,
                    link: creative.destination_url,
                    call_to_action: {
                        type: 'SHOP_NOW',
                        value: { link: creative.destination_url }
                    },
                    image_hash: creative.image_hash
                }
            }
        };
    }
}

export default SalesStrategy;
