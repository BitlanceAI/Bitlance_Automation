import BaseCampaignStrategy from './BaseCampaignStrategy.js';

class TrafficStrategy extends BaseCampaignStrategy {

    getObjective() {
        return 'OUTCOME_TRAFFIC';
    }

    buildAdSetPayload(config, campaignId) {
        return {
            name: `AdSet - Traffic`,
            campaign_id: campaignId,
            daily_budget: config.budget.daily_amount * 100,
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'LINK_CLICKS', // or LANDING_PAGE_VIEWS if pixel installed
            destination_type: 'WEBSITE',
            start_time: config.schedule.start_time,
            end_time: config.schedule.end_time,
            targeting: config.targeting,
            status: 'PAUSED'
        };
    }

    buildCreativePayload(creative, pageId) {
        return {
            name: `Creative - Traffic`,
            object_story_spec: {
                page_id: pageId,
                link_data: {
                    message: creative.text,
                    link: creative.destination_url,
                    call_to_action: {
                        type: 'LEARN_MORE',
                        value: { link: creative.destination_url }
                    },
                    image_hash: creative.image_hash
                }
            }
        };
    }
}

export default TrafficStrategy;
