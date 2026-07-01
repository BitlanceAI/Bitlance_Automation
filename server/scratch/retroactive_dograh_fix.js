import { newSupabaseAdmin } from '../src/config/supabaseClient.js';
import { fetchDograhRun, analyzeCallTranscript, formatTranscript } from '../src/controllers/billing/dograhController.js';
import dotenv from 'dotenv';
dotenv.config();

async function fixCalls() {
    console.log('🔄 Querying sales_calls with empty/missing transcripts from new DB...');
    const { data: calls, error } = await newSupabaseAdmin
        .from('sales_calls')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching calls:', error);
        return;
    }

    for (const call of calls) {
        let isMissing = false;
        try {
            const parsed = JSON.parse(call.transcript);
            if (!parsed.raw || parsed.raw.trim() === '' || parsed.summary === 'No transcript available.') {
                isMissing = true;
            }
        } catch (e) {
            isMissing = true;
        }

        if (isMissing) {
            console.log(`\n👉 Found call with empty transcript: ID=${call.id}, Call ID=${call.call_id}, Customer=${call.customer_number}`);
            try {
                console.log(`Fetching run data from Dograh for Call ID: ${call.call_id}...`);
                const runData = await fetchDograhRun(call.call_id);
                
                const timeline = (runData?.events_timeline && Array.isArray(runData.events_timeline))
                    ? runData.events_timeline
                    : (runData?.logs?.realtime_feedback_events && Array.isArray(runData.logs.realtime_feedback_events))
                        ? runData.logs.realtime_feedback_events
                        : null;

                let transcriptRaw = '';
                if (timeline) {
                    transcriptRaw = timeline
                        .filter(ev => ev.type === 'rtf-user-transcription' || ev.type === 'rtf-bot-text')
                        .map(ev => {
                            const role = ev.type === 'rtf-bot-text' ? 'AI' : 'Customer';
                            const text = ev.payload?.text || '';
                            if (!text || (ev.type === 'rtf-user-transcription' && !ev.payload.final)) return null;
                            return `[${ev.timestamp || new Date().toISOString()}] ${role}: ${text}`;
                        })
                        .filter(Boolean)
                        .join('\n');
                }

                if (!transcriptRaw) {
                    const inline = runData?.transcript || runData?.transcript_object;
                    if (inline) {
                        transcriptRaw = formatTranscript(inline);
                    }
                }

                if (!transcriptRaw) {
                    console.log(`⚠️ Dograh still returned no events/transcripts for call ${call.call_id}. Skipping.`);
                    continue;
                }

                console.log(`Fetched transcript (${transcriptRaw.length} chars). Generating AI Analysis...`);
                const aiAnalysis = await analyzeCallTranscript(transcriptRaw);

                const transcriptJsonBundle = JSON.stringify({
                    raw: transcriptRaw,
                    summary: aiAnalysis.summary,
                    sentiment: aiAnalysis.sentiment,
                    overall_sentiment: aiAnalysis.overall_sentiment,
                    sentiment_score: aiAnalysis.sentiment_score,
                    confidence: aiAnalysis.confidence,
                    customer_emotion: aiAnalysis.customer_emotion,
                    interest_level: aiAnalysis.interest_level,
                    buying_intent: aiAnalysis.buying_intent,
                    call_outcome: aiAnalysis.call_outcome,
                    customer_satisfaction: aiAnalysis.customer_satisfaction,
                    objections: aiAnalysis.objections,
                    complaints: aiAnalysis.complaints,
                    key_topics: aiAnalysis.key_topics,
                    positive_signals: aiAnalysis.positive_signals,
                    negative_signals: aiAnalysis.negative_signals,
                    customer_name: aiAnalysis.customer_name
                });

                // Update sales_calls
                console.log('Updating sales_calls table...');
                await newSupabaseAdmin
                    .from('sales_calls')
                    .update({ transcript: transcriptJsonBundle })
                    .eq('id', call.id);

                // Update/Insert call_analytics
                console.log('Updating call_analytics table...');
                const targetCustomerPhone = call.customer_number || runData?.initial_context?.phone_number || 'Unknown';
                const { error: analErr } = await newSupabaseAdmin
                    .from('call_analytics')
                    .upsert({
                        call_id: call.call_id,
                        overall_sentiment: aiAnalysis.overall_sentiment || 'neutral',
                        sentiment_score: aiAnalysis.sentiment_score || 50,
                        confidence: aiAnalysis.confidence || 80,
                        customer_emotion: aiAnalysis.customer_emotion || 'Neutral',
                        customer_name: aiAnalysis.customer_name || null,
                        customer_phone: targetCustomerPhone,
                        interest_level: aiAnalysis.interest_level || 'medium',
                        buying_intent: aiAnalysis.buying_intent || 'medium',
                        call_outcome: aiAnalysis.call_outcome || 'Completed',
                        customer_satisfaction: aiAnalysis.customer_satisfaction || 'medium',
                        objections: aiAnalysis.objections || [],
                        complaints: aiAnalysis.complaints || [],
                        key_topics: aiAnalysis.key_topics || [],
                        positive_signals: aiAnalysis.positive_signals || [],
                        negative_signals: aiAnalysis.negative_signals || [],
                        summary: aiAnalysis.summary || '',
                        created_at: call.started_at || new Date().toISOString()
                    }, { onConflict: 'call_id' });

                if (analErr) {
                    console.error('❌ Failed to update call_analytics:', analErr.message);
                } else {
                    console.log('✅ Successfully backfilled call analytics & transcript!');
                }
            } catch (err) {
                console.error(`❌ Failed to fix call ${call.call_id}:`, err.message);
            }
        }
    }
    console.log('\n🎉 Backfill job completed!');
}

fixCalls();
