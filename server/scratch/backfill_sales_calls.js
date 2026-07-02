import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
global.WebSocket = ws;

const db = createClient(
    'https://vtnpmdzxifcknrcrdevy.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnBtZHp4aWZja25yY3JkZXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM1NzM1OSwiZXhwIjoyMDk3OTMzMzU5fQ.Zo-Ep_9HLWNeIFdfUNH_d5p7hngP4TU27XvVQNkgLBo'
);

async function backfill() {
    console.log('Backfilling sales_calls for 553067...');
    
    // Org ID for itm.lotlite@gmail.com
    const orgId = 'b78dc4f9-7083-4bac-8ac2-7f318e3c54fd';
    
    const { data, error } = await db
        .from('sales_calls')
        .insert({
            call_id: '553067',
            organization_id: orgId,
            customer_number: '8398792951',
            agent_id: 'lotlite_realestate_outbound_agent',
            agent_name: 'Voice Agent',
            duration: 258,
            credits_used: 10,
            status: 'completed',
            recording_url: 'https://api.dograh.com/api/v1/public/download/workflow/6aaf6130-75b2-49bf-b539-2df496d76d26/recording',
            transcript: JSON.stringify({
                raw: "Ground penny: rent 2 BHK flat in Pune parking budget 20000 move next month",
                summary: "Customer Ground penny wants to rent a 2 BHK flat in Pune with parking, budget INR 20,000/month, and wants to move next month.",
                sentiment: "😊 Positive",
                overall_sentiment: "positive",
                sentiment_score: 80,
                confidence: 90,
                customer_emotion: "Curious",
                interest_level: "high",
                buying_intent: "high",
                customer_satisfaction: "high",
                call_outcome: "Lead Qualified",
                objections: [],
                complaints: [],
                key_topics: ["Rent", "2 BHK", "Pune", "Budget 20k"],
                positive_signals: ["Cooperative", "Gave details"],
                negative_signals: [],
                customer_name: "Ground penny"
            }),
            started_at: '2026-06-25T10:27:38.130208+00:00',
            ended_at: '2026-06-25T10:31:56.130208+00:00',
            created_at: '2026-06-25T10:31:56.130208+00:00'
        })
        .select();

    if (error) {
        console.error('❌ Insert failed:', error.message);
    } else {
        console.log('✅ Backfill successful:', JSON.stringify(data, null, 2));
    }
}

backfill();
