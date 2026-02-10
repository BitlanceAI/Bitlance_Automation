import BaseCampaignStrategy from './BaseCampaignStrategy.js';

class AwarenessStrategy extends BaseCampaignStrategy {

    getObjective() {
        return 'OUTCOME_AWARENESS'; // Modern Meta Objective
    }

    buildAdSetPayload(config, campaignId) {
        return {
            name: `AdSet - Awareness`,
            campaign_id: campaignId,
            daily_budget: config.budget.daily_amount * 100, // Cents
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'REACH',
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
            start_time: config.schedule.start_time,
            end_time: config.schedule.end_time,
            targeting: {
                geo_locations: { countries: ['US'] }, // Default, should come from config
                ...config.targeting
            },
            status: 'PAUSED'
        };
    }

    buildCreativePayload(creative, pageId) {
        return {
            name: `Creative - ${creative.name}`,
            object_story_spec: {
                page_id: pageId,
                link_data: {
                    message: creative.text,
                    link: creative.destination_url,
                    image_hash: creative.image_hash, // Assume uploaded & hashed
                    // or image_url: creative.image_url
                    call_to_action: {
                        type: 'LEARN_MORE',
                        value: { link: creative.destination_url }
                    }
                }
            }
        };
    }
}

export default AwarenessStrategy;
