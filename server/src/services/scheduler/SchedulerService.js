import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';

let supabase;

function getSupabase() {
    if (!supabase) {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ [SchedulerService] Missing Supabase credentials!');
            return null;
        }
        supabase = createClient(supabaseUrl, supabaseKey);
    }
    return supabase;
}

class SchedulerService {
    constructor(metaService) {
        this.meta = metaService;
    }

    start() {
        console.log('Starting Scheduler Service...');

        // 1. Check for campaigns to Start/Stop every hour
        cron.schedule('0 * * * *', () => {
            this.checkCampaignSchedules();
        });

        // 2. Performance Monitoring every 6 hours
        cron.schedule('0 */6 * * *', () => {
            this.monitorPerformance();
        });
    }

    async checkCampaignSchedules() {
        try {
            const db = getSupabase();
            if (!db) return;

            console.log('[Scheduler] Checking campaign schedules...');
            const now = new Date();

            // Find campaigns that need to START
            const { data: campaignsToStart, error: startError } = await db
                .from('campaigns')
                .select('*')
                .eq('status', 'PAUSED') // Stored locally as PAUSED
                .lte('start_time', now.toISOString())
                .gt('end_time', now.toISOString());

            if (startError) {
                console.error('[Scheduler] Error fetching campaigns to start:', startError.message);
                return;
            }

            if (campaignsToStart) {
                for (const campaign of campaignsToStart) {
                    try {
                        console.log(`[Scheduler] Starting campaign ${campaign.id}`);
                        // await this.meta.updateCampaignStatus(campaign.meta_campaign_id, 'ACTIVE');
                        // Update local status
                        await db
                            .from('campaigns')
                            .update({ status: 'ACTIVE' })
                            .eq('id', campaign.id);
                    } catch (err) {
                        console.error(`[Scheduler] Failed to start campaign ${campaign.id}`, err.message);
                    }
                }
            }

            // Find campaigns that need to STOP
            const { data: campaignsToStop, error: stopError } = await db
                .from('campaigns')
                .select('*')
                .eq('status', 'ACTIVE')
                .lte('end_time', now.toISOString());

            if (stopError) {
                console.error('[Scheduler] Error fetching campaigns to stop:', stopError.message);
                return;
            }

            if (campaignsToStop) {
                for (const campaign of campaignsToStop) {
                    try {
                        console.log(`[Scheduler] Stopping campaign ${campaign.id}`);
                        // await this.meta.updateCampaignStatus(campaign.meta_campaign_id, 'PAUSED');
                        await db
                            .from('campaigns')
                            .update({ status: 'COMPLETED' })
                            .eq('id', campaign.id);
                    } catch (err) {
                        console.error(`[Scheduler] Failed to stop campaign ${campaign.id}`, err.message);
                    }
                }
            }
        } catch (error) {
            console.error('💥 [Scheduler] Critical error in checkCampaignSchedules:', error.message);
        }
    }

    async monitorPerformance() {
        try {
            console.log('[Scheduler] Monitoring performance...');
            // Logic: Fetch insights, check CPL/ROAS, rule-based optimization
        } catch (error) {
            console.error('💥 [Scheduler] Critical error in monitorPerformance:', error.message);
        }
    }
}

export default SchedulerService;
