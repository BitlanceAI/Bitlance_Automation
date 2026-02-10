import BaseCampaignStrategy from './BaseCampaignStrategy.js';

class LeadGenStrategy extends BaseCampaignStrategy {

    getObjective() {
        return 'OUTCOME_LEADS';
    }

    buildAdSetPayload(config, campaignId) {
        return {
            name: `AdSet - Lead Gen`,
            campaign_id: campaignId,
            daily_budget: config.budget.daily_amount * 100,
            billing_event: 'IMPRESSIONS',
            optimization_goal: 'LEADS',
            destination_type: 'ON_AD', // For Instant Forms
            start_time: config.schedule.start_time,
            end_time: config.schedule.end_time,
            targeting: config.targeting,
            status: 'PAUSED'
        };
    }

    buildCreativePayload(creative, pageId) {
        // NOTE: Lead Ads often require a Lead Form ID
        if (!creative.lead_form_id) {
            throw new Error('Lead Generation ads require a valid lead_form_id');
        }

        return {
            name: `Creative - Lead Gen`,
            object_story_spec: {
                page_id: pageId,
                link_data: {
                    message: creative.text,
                    link: 'http://fb.me/', // Required placeholder for Lead Ads
                    call_to_action: {
                        type: 'SIGN_UP',
                        value: { lead_gen_form_id: creative.lead_form_id }
                    },
                    image_hash: creative.image_hash
                }
            }
        };
    }
}

export default LeadGenStrategy;
