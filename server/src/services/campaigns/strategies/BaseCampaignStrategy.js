/**
 * Base abstract class for Campaign Strategies
 * All promotion types must extend this
 */
class BaseCampaignStrategy {
    constructor(metaService, supabase) {
        this.meta = metaService;
        this.supabase = supabase;
    }

    /**
     * @param {string} objective - Meta Objective (e.g., OUTCOME_TRAFFIC)
     * @returns {string} - Mapping verification
     */
    validateObjective(objective) {
        throw new Error('Method not implemented');
    }

    /**
     * Build the Ad Set payload specific to the promotion type
     * @param {object} config - User configuration
     */
    buildAdSetPayload(config) {
        throw new Error('Method not implemented');
    }

    /**
     * Build the Creative payload
     * @param {object} creative - Creative assets
     */
    buildCreativePayload(creative) {
        throw new Error('Method not implemented');
    }
}

export default BaseCampaignStrategy;
