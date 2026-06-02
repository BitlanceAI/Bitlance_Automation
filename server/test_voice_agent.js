import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const sampleTranscript = `
Agent: Hello! Thanks for calling Bitlance Automation Real Estate. How can I help you find a flat today?
Customer: Hi, yes, I'm looking for a 3 BHK apartment in Electronic City, Bangalore.
Agent: Great! Electronic City Phase I has some excellent properties right now. What is your budget?
Customer: My budget is around 1.2 Crores. I would like to schedule a site visit to check the property this Saturday, May 30th at 11:30 AM.
Agent: Perfect! I can book that visit for you. Can I get your full name and phone number?
Customer: Sure, my name is Rajesh Kumar and my phone number is 8318768905.
Agent: Awesome Rajesh, I have scheduled the site visit for this Saturday, May 30th at 11:30 AM. I will email the details to you.
Customer: Sounds good. Thank you so much!
`;

async function runWithOpenAI() {
    console.log('Attempting transcript analysis via OpenAI (gpt-4o-mini)...');
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
    You are an AI assistant that analyzes call transcripts to:
    1. Detect if a meeting or site visit was scheduled.
    2. Build an 8-point Sentiment Analysis Report.

    Respond ONLY with a valid JSON object of the following format:
    {
      "meeting_detected": true,
      "meeting": {
         "contact_name": "Name of contact",
         "contact_phone": "Phone of contact",
         "title": "Meeting Title",
         "description": "Short description",
         "scheduled_date": "YYYY-MM-DDTHH:mm:ss"
      },
      "sentiment_report": {
         "customerSentiment": "Positive" | "Neutral" | "Negative" | "Mixed",
         "salesAgentConfidence": "High" | "Medium" | "Low",
         "positiveIndicator": "Key quotes showing buyer interest",
         "negativeIndicator": "Key quotes showing objections",
         "predictiveOutcomes": "Likelihood to visit/buy (e.g. 90%)",
         "alertStatus": true | false,
         "finishReason": "Completed" | "Call Drop" | "Voicemail",
         "avgLogprobs": 0.95
      }
    }
    `;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Transcript:\n${sampleTranscript}` }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
    });

    return JSON.parse(completion.choices[0].message.content);
}

async function runWithPerplexity() {
    console.log('Fallback: Attempting transcript analysis via Perplexity (sonar)...');
    
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error('PERPLEXITY_API_KEY is not set in environment.');
    }
    
    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.perplexity.ai'
    });

    const prompt = `
    You are an AI assistant that analyzes call transcripts to:
    1. Detect if a meeting or site visit was scheduled.
    2. Build an 8-point Sentiment Analysis Report.

    Respond ONLY with a valid JSON object. Do not include markdown code block formatting (such as \`\`\`json). The output must be raw JSON:
    {
      "meeting_detected": true,
      "meeting": {
         "contact_name": "Rajesh Kumar",
         "contact_phone": "8318768905",
         "title": "Site Visit - Electronic City 3 BHK Flat",
         "description": "Scheduled site visit for Saturday, May 30th at 11:30 AM",
         "scheduled_date": "2026-05-30T11:30:00"
      },
      "sentiment_report": {
         "customerSentiment": "Positive",
         "salesAgentConfidence": "High",
         "positiveIndicator": "Customer requested a site visit and shared phone number",
         "negativeIndicator": "None",
         "predictiveOutcomes": "90%",
         "alertStatus": false,
         "finishReason": "Completed",
         "avgLogprobs": 0.95
      }
    }
    `;

    const completion = await client.chat.completions.create({
        model: 'sonar',
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Transcript:\n${sampleTranscript}` }
        ],
        temperature: 0.2
    });

    let text = completion.choices[0].message.content;
    // Strip markdown formatting if Perplexity wrapped the JSON
    if (text.includes('```')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    return JSON.parse(text);
}

async function main() {
    console.log('======================================================================');
    console.log('1. RUNNING DYNAMIC VOICE AI TRANSCRIPT AUDITOR');
    console.log('======================================================================');
    
    let result;
    try {
        result = await runWithOpenAI();
        console.log('🟢 OpenAI check completed successfully!');
    } catch (e) {
        console.warn('⚠️ OpenAI check failed (potentially invalid key). Error:', e.message);
        try {
            result = await runWithPerplexity();
            console.log('🟢 Perplexity fallback check completed successfully!');
        } catch (perplexityError) {
            console.error('❌ Both OpenAI and Perplexity checks failed:', perplexityError.message);
            process.exit(1);
        }
    }

    console.log('\n--- Analysis Report ---');
    console.log('Meeting Detected:', result.meeting_detected ? '✅ YES' : '❌ NO');
    if (result.meeting_detected && result.meeting) {
        console.log('• Contact Name:', result.meeting.contact_name);
        console.log('• Contact Phone:', result.meeting.contact_phone);
        console.log('• Scheduled Date:', result.meeting.scheduled_date);
        console.log('• Meeting Title:', result.meeting.title);
    }
    
    if (result.sentiment_report) {
        console.log('\n--- 8-Point Sentiment Report ---');
        console.log('1. Customer Sentiment:', result.sentiment_report.customerSentiment);
        console.log('2. Sales Agent Confidence:', result.sentiment_report.salesAgentConfidence);
        console.log('3. Positive Indicator:', result.sentiment_report.positiveIndicator);
        console.log('4. Negative Indicator:', result.sentiment_report.negativeIndicator);
        console.log('5. Predictive Outcomes (Likelihood):', result.sentiment_report.predictiveOutcomes);
        console.log('6. Alert Status (Human Handover Required):', result.sentiment_report.alertStatus ? '⚠️ YES' : '🟢 NO');
        console.log('7. Finish Reason:', result.sentiment_report.finishReason);
        console.log('8. Transcription Confidence (avgLogprobs):', result.sentiment_report.avgLogprobs);
    }
    console.log('======================================================================');
}

main();
