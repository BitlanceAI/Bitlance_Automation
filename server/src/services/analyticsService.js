import { supabase } from '../config/supabaseClient.js';

class AnalyticsService {
    /**
     * Track a user event
     * @param {string} eventName - Name of the event (e.g., 'campaign_impression', 'click')
     * @param {Object} properties - Additional data for the event
     * @param {string} [userId] - User ID if authenticated
     * @param {string} [sessionId] - Session ID for anonymous tracking
     */
    async trackEvent(eventName, properties = {}, userId = null, sessionId = null) {
        try {
            const eventData = {
                event_name: eventName,
                properties: properties,
                user_id: userId,
                session_id: sessionId,
                event_type: this.categorizeEvent(eventName),
                source: 'web',
                timestamp: new Date().toISOString()
            };

            // If it's a campaign event, extract campaign_id to top level
            if (properties.campaignId) {
                eventData.campaign_id = properties.campaignId;
            }

            const { error } = await supabase
                .from('events')
                .insert(eventData);

            if (error) {
                console.error('Error tracking event:', error);
            }
        } catch (err) {
            console.error('Analytics Service Error:', err);
        }
    }

    categorizeEvent(eventName) {
        if (eventName.includes('impression')) return 'impression';
        if (eventName.includes('click')) return 'click';
        if (eventName.includes('submit')) return 'submission';
        if (eventName.includes('view')) return 'view';
        return 'other';
    }

    async getCampaignStats(campaignId) {
        try {
            const { data, error } = await supabase
                .rpc('get_campaign_stats', { campaign_id: campaignId }); // Assuming a Postgres function or separate queries

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching campaign stats:', error);
            return null;
        }
    }
}

export default new AnalyticsService();
