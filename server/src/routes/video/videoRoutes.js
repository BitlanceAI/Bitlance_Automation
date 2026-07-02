import express from 'express';
import axios from 'axios';
import OpenAI from 'openai';
import crypto from 'crypto';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Helper to generate JWT token for Kling AI API
function generateKlingToken(ak, sk) {
    const header = {
        alg: "HS256",
        typ: "JWT"
    };
    const payload = {
        iss: ak,
        exp: Math.floor(Date.now() / 1000) + 1800,
        nbf: Math.floor(Date.now() / 1000) - 5
    };
    
    const base64UrlEncode = (obj) => {
        return Buffer.from(JSON.stringify(obj))
            .toString('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    };
    
    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    
    const signature = crypto
        .createHmac('sha256', sk)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
        
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

router.use(authenticateUser);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_placeholder_for_startup'
});

// POST /api/video/analyze-style
router.post('/analyze-style', async (req, res) => {
    try {
        const { youtube_url } = req.body;
        if (!youtube_url) {
            return res.status(400).json({ error: 'youtube_url is required' });
        }

        // Try calling Python agent first if configured
        const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
        try {
            console.log(`[Video Agent] Forwarding style analysis to Python agent...`);
            const pyRes = await axios.post(`${PYTHON_API_URL}/api/video/analyze-style`, { youtube_url });
            return res.json(pyRes.data);
        } catch (pyErr) {
            console.warn(`[Video Agent] Python agent analysis failed or unreachable: ${pyErr.message}. Falling back to Node.js implementation.`);
        }

        // Fallback: direct implementation in Node.js
        console.log(`[Video Agent] Executing style analysis locally in Node.js...`);
        let title = 'Stunning Video Showcase';
        let description = 'Welcome to this exclusive presentation. In this video we highlight the key features, design elements, and core benefits.';
        let channel = 'Premium Showcase Channel';

        try {
            const ytResponse = await axios.get(youtube_url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                timeout: 8000
            });
            const html = ytResponse.data;
            const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
            if (titleMatch) title = titleMatch[1].replace(' - YouTube', '');
            const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/) || html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
            if (descMatch) description = descMatch[1];
            const channelMatch = html.match(/<link\s+itemprop="name"\s+content="([^"]+)"/);
            if (channelMatch) channel = channelMatch[1];
        } catch (scrapeErr) {
            console.warn(`[Video Agent] Failed to scrape YouTube page directly: ${scrapeErr.message}`);
        }

        // Call OpenAI to perform the style analysis
        const prompt = `You are an AI video producer and style analyzer.
Analyze the following YouTube video details and dissect its video marketing style, hook technique, pacing, narration tone, and scene structure.

VIDEO TITLE: ${title}
VIDEO CHANNEL: ${channel}
VIDEO DESCRIPTION: ${description}

Please analyze this style thoroughly and return a valid JSON object matching this exact structure:
{
    "hook_style": "Describe the hook category (e.g. curiosity-driven question, brand promise, immediate benefit reveal) and how it starts.",
    "pacing": "Explain the pacing (e.g. Fast cuts, Slow cinematic, Upbeat, Steady) and visual editing rhythm.",
    "tone": "Describe the vocal narration tone (e.g. Professional, Energetic, Informative, Warm, Aspirational).",
    "transitions": "Detail the video transitions detected (e.g. Speed ramp, Zoom-ins, Smooth cuts, Text overlays).",
    "script_structure": [
        "Section 1: Hook / Attention Grabber",
        "Section 2: Introduction of Topic/Product",
        "Section 3: Key Features / Content Body",
        "Section 4: Core Value / Demonstration",
        "Section 5: Summary / Proof",
        "Section 6: Call-to-action"
    ],
    "engagement_techniques": [
        "Highlighting key metrics or features",
        "Bold text overlays",
        "Direct address to target audience"
    ],
    "summary": "Summarize the style profile in 2 sentences."
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a professional video media analyst. Return only raw JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(completion.choices[0].message.content);
        analysis.meta = { title, description, channel, url: youtube_url };
        res.json(analysis);

    } catch (error) {
        console.error('Error in analyze-style endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/video/generate-reel
router.post('/generate-reel', async (req, res) => {
    try {
        const { style_analysis, property_details, topic_details, avatar, voice } = req.body;
        if (!style_analysis || (!property_details && !topic_details)) {
            return res.status(400).json({ error: 'style_analysis and details are required' });
        }

        // Try calling Python agent first if configured
        const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';
        try {
            console.log(`[Video Agent] Forwarding reel script generation to Python agent...`);
            const pyRes = await axios.post(`${PYTHON_API_URL}/api/video/generate-reel`, {
                style_analysis,
                property_details,
                topic_details,
                avatar,
                voice
            });
            return res.json(pyRes.data);
        } catch (pyErr) {
            console.warn(`[Video Agent] Python agent reel generation failed: ${pyErr.message}. Falling back to Node.js implementation.`);
        }

        // Fallback: direct implementation in Node.js
        console.log(`[Video Agent] Generating reel script locally in Node.js...`);
        
        let topic_info = "";
        if (topic_details && topic_details.topic) {
            topic_info += `Subject/Title: ${topic_details.topic}\n`;
            if (topic_details.category) topic_info += `Category: ${topic_details.category}\n`;
            if (topic_details.details) topic_info += `Specifications/Description: ${topic_details.details}\n`;
            if (topic_details.cta) topic_info += `Call to Action: ${topic_details.cta}\n`;
            if (topic_details.price) topic_info += `Pricing/Offer: ${topic_details.price}\n`;
        } else if (property_details) {
            const { title, location, price, bhk, amenities = [], extra_details = '' } = property_details;
            const amenities_str = amenities.join(', ');
            if (title) topic_info += `Subject/Title: ${title}\n`;
            if (bhk) topic_info += `Type/Configuration: ${bhk}\n`;
            if (location) topic_info += `Location/Context: ${location}\n`;
            if (price) topic_info += `Pricing/Offer: ${price}\n`;
            if (amenities_str) topic_info += `Key Features/Amenities: ${amenities_str}\n`;
            if (extra_details) topic_info += `Specifications/Description: ${extra_details}\n`;
        }

        const prompt = `Create an engaging narration script for a short video reel (under 60 seconds).
You must adopt the pacing, tone, and script structure determined by the style analysis profile.

STYLE ANALYSIS PROFILE:
- Narration Tone: ${style_analysis.tone || 'Professional'}
- Pacing: ${style_analysis.pacing || 'Cinematic'}
- Hook Style: ${style_analysis.hook_style || 'Curiosity-driven'}
- Visual Transitions: ${style_analysis.transitions || 'Smooth'}
- Script Structure: ${(style_analysis.script_structure || []).join(', ')}

TOPIC DETAILS:
${topic_info}

Break down the final script into 5-6 scenes. Each scene should represent a specific visual cut.
Return a valid JSON object matching this exact structure:
{
    "total_estimated_duration": 45,
    "background_music_vibe": "Upbeat, energetic and modern background track with clean transitions matching the video style",
    "scenes": [
        {
            "scene_id": 1,
            "narration": "Exact text that the presenter avatar will speak out loud. Make it highly engaging, matching the Hook Style and Narration Tone.",
            "visual_cue": "Specific description of the video clip (e.g. Drone sweep shot zooming towards a modern skyscraper exterior, or close up of the product)",
            "overlay_text": "Bold capitalization text to overlay on the screen (e.g. UP TO 10X FASTER)",
            "duration": 7,
            "transition": "Transition style name (e.g. Zoom Rush)"
        }
    ]
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an expert video copywriter. Return only raw JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const script_data = JSON.parse(completion.choices[0].message.content);
        res.json({
            success: true,
            script: script_data,
            avatar: avatar || 'luxury_sophia',
            voice: voice || 'en-US-Neural-Sophisticated'
        });
    } catch (error) {
        console.error('Error in generate-reel endpoint:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/video/generate-kling-video
router.post('/generate-kling-video', async (req, res) => {
    try {
        const { prompt, aspect_ratio = '9:16' } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'prompt is required' });
        }

        const ak = process.env.KLING_ACCESS_KEY;
        const sk = process.env.KLING_SECRET_KEY;

        if (!ak || !sk) {
            return res.status(500).json({ error: 'Kling AI credentials are not configured on the server' });
        }

        const token = generateKlingToken(ak, sk);
        
        console.log('[Kling AI] Initiating text2video task...');
        const apiResponse = await axios.post('https://api-singapore.klingai.com/v1/videos/text2video', {
            model_name: 'kling-v1',
            prompt: prompt,
            aspect_ratio: aspect_ratio,
            duration: '5'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (apiResponse.data && apiResponse.data.code === 0) {
            return res.json({
                success: true,
                taskId: apiResponse.data.data.task_id,
                status: apiResponse.data.data.task_status
            });
        } else {
            console.error('[Kling AI] Error response:', apiResponse.data);
            return res.status(400).json({
                error: apiResponse.data?.message || 'Failed to initiate video generation'
            });
        }
    } catch (error) {
        console.error('Error in Kling video generation:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data?.message || error.message });
    }
});

// GET /api/video/kling-status/:taskId
router.get('/kling-status/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const ak = process.env.KLING_ACCESS_KEY;
        const sk = process.env.KLING_SECRET_KEY;

        if (!ak || !sk) {
            return res.status(500).json({ error: 'Kling AI credentials are not configured on the server' });
        }

        const token = generateKlingToken(ak, sk);
        
        const apiResponse = await axios.get(`https://api-singapore.klingai.com/v1/videos/text2video/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (apiResponse.data && apiResponse.data.code === 0) {
            const taskData = apiResponse.data.data;
            const responseData = {
                success: true,
                taskId: taskData.task_id,
                status: taskData.task_status,
            };

            if (taskData.task_status === 'succeed' && taskData.task_result) {
                responseData.videoUrl = taskData.task_result.video_url;
                responseData.coverUrl = taskData.task_result.video_cover_url;
            }

            return res.json(responseData);
        } else {
            return res.status(400).json({
                error: apiResponse.data?.message || 'Failed to query task status'
            });
        }
    } catch (error) {
        console.error('Error querying Kling status:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data?.message || error.message });
    }
});

export default router;
