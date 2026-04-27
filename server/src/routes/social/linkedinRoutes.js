import express from 'express';
import multer from 'multer';
import axios from 'axios';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import LinkedinService from '../../services/social/linkedinService.js';
import { encryptData, decryptData } from '../../../utils/encryption.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg',
            'application/pdf',
        ];
        cb(null, allowed.includes(file.mimetype));
    }
});

const router = express.Router();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
// The redirect URI must precisely match what you configure in the LinkedIn App portal.
// Best approach: redirect to the frontend directly, so the frontend can read the 'code' parameter, and pass it securely to the api.
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5173/dashboard';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = user;
        req.workspaceId = req.headers['x-workspace-id'] || null;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

router.use(authMiddleware);

/**
 * Get OAuth authorization URL
 * GET /api/linkedin/oauth/url
 */
router.get('/oauth/url', (req, res) => {
    if (!LINKEDIN_CLIENT_ID) {
        return res.status(500).json({ error: 'LinkedIn Client ID not configured' });
    }
    const authUrl = LinkedinService.getOAuthUrl(LINKEDIN_CLIENT_ID, LINKEDIN_REDIRECT_URI);
    res.json({ success: true, url: authUrl });
});

/**
 * Exchange code for token and save profile
 * POST /api/linkedin/connect
 */
router.post('/connect', async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        // Exchange code for token
        const tokenResult = await LinkedinService.exchangeCodeForToken(
            code,
            LINKEDIN_CLIENT_ID,
            LINKEDIN_CLIENT_SECRET,
            LINKEDIN_REDIRECT_URI
        );

        if (!tokenResult.success) {
            return res.status(400).json({ error: tokenResult.error });
        }

        // Fetch user profile
        const linkedinService = new LinkedinService(tokenResult.accessToken);
        const profileResult = await linkedinService.getProfile();

        if (!profileResult.success) {
            return res.status(400).json({ error: 'Failed to fetch LinkedIn profile' });
        }

        const profile = profileResult.data;

        // Encrypt token
        let encryptedToken;
        try {
            encryptedToken = encryptData(tokenResult.accessToken);
        } catch (encError) {
            console.error('LinkedIn encryption error:', encError);
            return res.status(500).json({ error: 'Encryption configuration error' });
        }

        // Store in database
        const { data: connection, error } = await supabase
            .from('linkedin_connections')
            .upsert({
                user_id: userId,
                profile_id: profile.profileId,
                profile_name: profile.name,
                profile_picture: profile.profilePicture,
                email: profile.email,
                access_token: encryptedToken,
                token_expires_at: tokenResult.expiresAt,
                is_active: true,
                workspace_id: req.workspaceId || null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id, profile_id'
            })
            .select()
            .single();

        if (error) {
            console.error('LinkedIn database error:', error);
            throw error;
        }

        res.json({
            success: true,
            message: 'LinkedIn account connected successfully',
            profile: profile
        });

    } catch (error) {
        console.error('LinkedIn connect error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get current active LinkedIn connection
 * GET /api/linkedin/connection
 */
router.get('/connection', async (req, res) => {
    try {
        const userId = req.user.id;

        let query = supabase
            .from('linkedin_connections')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        // Strict workspace filter — only show profiles connected under this workspace
        if (req.workspaceId) {
            query = query.eq('workspace_id', req.workspaceId);
        }

        const { data: connections, error } = await query;

        if (error) throw error;

        if (!connections || connections.length === 0) {
            return res.json({ connected: false, profiles: [] });
        }

        // Format to exclude token and return safe profile info
        const safeProfiles = connections.map(conn => ({
            id: conn.id,
            profileId: conn.profile_id,
            name: conn.profile_name,
            profilePicture: conn.profile_picture,
            email: conn.email,
            expiresAt: conn.token_expires_at,
            workspaceId: conn.workspace_id,
        }));

        res.json({
            connected: true,
            profiles: safeProfiles
        });
    } catch (error) {
        console.error('Get LinkedIn connection error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Share post text to a WhatsApp number via global Business API credentials
 * POST /api/linkedin/whatsapp-share
 * Body: { phone, text }
 */
const WA_ERROR_HINTS = {
    133010: 'The WhatsApp Business sender number is not fully registered with Meta. Go to Meta Business Manager → WhatsApp → Phone Numbers and complete the registration.',
    131030: 'Recipient number is not registered on WhatsApp. Check the number and country code.',
    131021: 'Recipient phone number is invalid or not on WhatsApp.',
    131047: 'More than 24 hours have passed since the user last messaged you. Use a pre-approved template.',
    131026: 'Message undeliverable — recipient may have blocked the sender.',
    190:    'Access token is expired or invalid. Update WHATSAPP_GLOBAL_TOKEN in server .env.',
    100:    'Invalid Phone Number ID. Check WHATSAPP_PHONE_ID in server .env.',
};

router.post('/whatsapp-share', async (req, res) => {
    try {
        const { phone, name, text, title = 'New Post', niche = 'General', profileId, visibility = 'PUBLIC', assetUrn, mediaCategory } = req.body;
        const userId = req.user.id;

        if (!phone || !text) {
            return res.status(400).json({ error: 'phone and text are required' });
        }

        const phoneId = process.env.WHATSAPP_PHONE_ID;
        const token = process.env.WHATSAPP_GLOBAL_TOKEN;

        if (!phoneId || !token) {
            return res.status(500).json({ error: 'WhatsApp global credentials not configured on server.' });
        }

        // Strip non-digits; auto-prepend India country code for 10-digit numbers
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 10 && /^[6-9]/.test(formattedPhone)) {
            formattedPhone = '91' + formattedPhone;
        }

        // Save pending approval to DB so the webhook can auto-post when approved
        const { data: pending, error: dbError } = await supabase
            .from('linkedin_pending_approvals')
            .insert({
                user_id: userId,
                profile_id: profileId || null,
                text,
                visibility,
                asset_urn: assetUrn || null,
                media_category: mediaCategory || null,
                approver_phone: formattedPhone,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (dbError) {
            console.error('[LinkedIn Approval] DB save error:', dbError.message);
            // Non-fatal — still send the WhatsApp message
        }

        // Send template — aprroval_of_post_posting has no body/header variables,
        // only two quick-reply buttons with custom payloads.
        const response = await axios.post(
            `https://graph.facebook.com/v19.0/${phoneId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: formattedPhone,
                type: 'template',
                template: {
                    name: 'approval_of_post_posting',
                    language: { code: 'en_US' },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                { type: 'text', text: title },
                                { type: 'text', text: niche }
                            ]
                        },
                        {
                            type: 'button',
                            sub_type: 'quick_reply',
                            index: '0',
                            parameters: [{ type: 'payload', payload: 'APPROVED' }]
                        },
                        {
                            type: 'button',
                            sub_type: 'quick_reply',
                            index: '1',
                            parameters: [{ type: 'payload', payload: 'DISAPPROVED' }]
                        }
                    ]
                }
            },
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        res.json({ success: true, messageId: response.data.messages?.[0]?.id, pendingId: pending?.id });
    } catch (error) {
        const metaError = error.response?.data?.error;
        const code = metaError?.code;
        const hint = WA_ERROR_HINTS[code];
        const message = hint || metaError?.message || error.message;
        console.error(`WhatsApp share error [${code}]:`, metaError || error.message);
        res.status(400).json({ error: message, code });
    }
});

/**
 * AI Write / Rewrite for LinkedIn posts
 * POST /api/linkedin/ai-write
 * Body: { prompt?, existingText?, tone? }
 *   - prompt:       generate a fresh post from a topic/idea
 *   - existingText: rewrite / improve existing draft
 *   - tone:         professional | casual | inspiring | witty (default: professional)
 */
router.post('/ai-write', async (req, res) => {
    try {
        const { prompt, existingText, tone = 'professional' } = req.body;

        if (!prompt && !existingText) {
            return res.status(400).json({ error: 'Provide either prompt or existingText' });
        }

        const toneGuide = {
            professional: 'authoritative, clear, and professional',
            casual:       'friendly, conversational, and approachable',
            inspiring:    'motivational, uplifting, and thought-provoking',
            witty:        'clever, light-hearted, and engaging',
        }[tone] || 'professional';

        const systemPrompt = `You are an expert LinkedIn content writer.
Write posts that feel authentic, get high engagement, and match the requested tone.
Rules:
- Max 3000 characters
- Use line breaks for readability
- Add 3-5 relevant hashtags at the end
- No generic filler phrases like "In today's world" or "I'm excited to share"
- Sound like a real person, not a corporate bot
- Tone: ${toneGuide}
- Formatting: LinkedIn supports a subset of markdown. Use *asterisks* around words for bold emphasis (e.g. *key point*). Use bullet points with the • character for lists. You MAY use emojis sparingly for visual structure.
- IMPORTANT: Output the post text exactly as it should appear — do NOT strip asterisks. Asterisks around words will render as bold on LinkedIn and must be preserved in the output.`;

        const userMessage = existingText
            ? `Rewrite and improve this LinkedIn post. Keep the core message but make it more engaging:\n\n${existingText}`
            : `Write a LinkedIn post about: ${prompt}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.75,
            max_tokens: 800,
        });

        const text = completion.choices[0]?.message?.content?.trim();
        if (!text) return res.status(500).json({ error: 'No response from AI' });

        res.json({ success: true, text });
    } catch (error) {
        console.error('LinkedIn AI write error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Find trending keywords/topics using SerpAPI and AI
 * POST /api/linkedin/trending-keywords
 * Body: { niche?, location? }
 */
router.post('/trending-keywords', async (req, res) => {
    try {
        const { niche = 'technology', location = 'United States' } = req.body;
        const serpApiKey = process.env.SERPAPI_API_KEY;

        if (!serpApiKey) {
            return res.status(500).json({ error: 'SerpAPI key not configured' });
        }

        // 1. Fetch trending data from SerpAPI (Google Trends)
        // We'll use the 'google_trends_trending_searches' engine or similar
        // For a more specific niche, we might use 'google_search' with 'trending [niche]'
        let trendingData = [];
        try {
            const serpResponse = await axios.get('https://serpapi.com/search.json', {
                params: {
                    engine: 'google_trends_trending_searches',
                    geo: 'US', // default to US for trends
                    api_key: serpApiKey
                }
            });

            // Extract trending searches from the response
            // The structure varies, but usually it's in trending_searches
            const trends = serpResponse.data.trending_searches || [];
            trendingData = trends.map(t => t.query).slice(0, 15);
        } catch (serpError) {
            console.error('SerpAPI error:', serpError.message);
            // Fallback: If trends fail, try a search for 'trending topics in [niche]'
            const searchResponse = await axios.get('https://serpapi.com/search.json', {
                params: {
                    q: `trending topics in ${niche}`,
                    location: location,
                    api_key: serpApiKey
                }
            });
            const results = searchResponse.data.organic_results || [];
            trendingData = results.map(r => r.title).slice(0, 10);
        }

        // 2. Use AI to process these into LinkedIn post ideas
        const systemPrompt = `You are a social media strategist.
Given a list of trending topics or search queries, identify the top 5 most relevant and engaging topics for a LinkedIn professional audience interested in ${niche}.
For each topic, provide:
1. A catchy Keyword/Topic Name
2. A brief "Angle" or "Hook" for a post
3. 2-3 targeted hashtags

Format the output as a JSON array of objects: [{ "keyword": "...", "hook": "...", "hashtags": ["...", "..."] }]`;

        const userMessage = `Trending data: ${trendingData.join(', ')}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const aiResult = JSON.parse(completion.choices[0]?.message?.content || '{}');
        const topics = aiResult.topics || aiResult.suggestions || aiResult.results || Object.values(aiResult)[0] || [];

        res.json({ success: true, topics });
    } catch (error) {
        console.error('Trending keywords error:', error.message);
        res.status(500).json({ error: error.message });
    }
});


/**
 * Upload media (image / video / PDF) to LinkedIn, returns assetUrn
 * POST /api/linkedin/upload-media
 * Form-data: file (binary), profileId, mediaCategory (IMAGE|VIDEO|DOCUMENT)
 */
router.post('/upload-media', upload.single('file'), async (req, res) => {
    try {
        const { profileId, mediaCategory } = req.body;
        const file = req.file;

        if (!profileId || !file) {
            return res.status(400).json({ error: 'profileId and file are required' });
        }

        const userId = req.user.id;

        const { data: connection, error: dbError } = await supabase
            .from('linkedin_connections')
            .select('access_token')
            .eq('user_id', userId)
            .eq('profile_id', profileId)
            .eq('is_active', true)
            .single();

        if (dbError || !connection) {
            return res.status(404).json({ error: 'LinkedIn connection not found' });
        }

        let accessToken;
        try {
            accessToken = decryptData(connection.access_token);
        } catch {
            return res.status(500).json({ error: 'Failed to decrypt access token' });
        }

        const linkedinService = new LinkedinService(accessToken);
        let result;

        if (mediaCategory === 'DOCUMENT' || file.mimetype === 'application/pdf') {
            result = await linkedinService.uploadDocument(profileId, file.buffer);
        } else {
            const category = mediaCategory || (file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE');
            result = await linkedinService.uploadAsset(profileId, file.buffer, file.mimetype, category);
        }

        res.json({ success: true, assetUrn: result.assetUrn, mediaCategory: result.mediaCategory, title: file.originalname });
    } catch (error) {
        console.error('LinkedIn upload-media error:', error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data?.message || error.message });
    }
});

/**
 * Create a LinkedIn post
 * POST /api/linkedin/post
 * Body: { profileId, text, visibility?, assetUrn?, mediaCategory? }
 */
router.post('/post', async (req, res) => {
    try {
        const { profileId, text, visibility = 'PUBLIC', assetUrn, mediaCategory, title } = req.body;
        const userId = req.user.id;

        if (!profileId || !text) {
            return res.status(400).json({ error: 'profileId and text are required' });
        }

        // Fetch connection and decrypt token
        const { data: connection, error: dbError } = await supabase
            .from('linkedin_connections')
            .select('access_token, profile_id')
            .eq('user_id', userId)
            .eq('profile_id', profileId)
            .eq('is_active', true)
            .single();

        if (dbError || !connection) {
            return res.status(404).json({ error: 'LinkedIn connection not found' });
        }

        let accessToken;
        try {
            accessToken = decryptData(connection.access_token);
        } catch (e) {
            return res.status(500).json({ error: 'Failed to decrypt access token' });
        }

        const linkedinService = new LinkedinService(accessToken);
        const media = assetUrn && mediaCategory ? { assetUrn, mediaCategory, title } : null;
        const result = await linkedinService.createPost(profileId, text, visibility, media);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        // Persist post history (non-blocking)
        supabase.from('linkedin_posts').insert({
            user_id: userId,
            profile_id: profileId,
            post_id: result.postId,
            text,
            media_category: mediaCategory || null,
            visibility,
            created_at: new Date().toISOString()
        }).then(() => {}).catch(() => {});

        res.json({
            success: true,
            message: 'Post published successfully',
            postId: result.postId
        });

    } catch (error) {
        console.error('LinkedIn post error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Performance stats from stored post history
 * GET /api/linkedin/stats?days=7
 */
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 7;

        const now = new Date();
        const periodStart = new Date(now - days * 86400000).toISOString();
        const prevStart  = new Date(now - days * 2 * 86400000).toISOString();

        const { data: allPosts } = await supabase
            .from('linkedin_posts')
            .select('created_at, visibility, media_category')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        const posts = allPosts || [];

        const inPeriod = posts.filter(p => p.created_at >= periodStart);
        const inPrev   = posts.filter(p => p.created_at >= prevStart && p.created_at < periodStart);

        const pct = (curr, prev) => prev === 0
            ? (curr > 0 ? 100 : null)
            : Math.round(((curr - prev) / prev) * 100);

        // Posts by day for spark chart (last `days` days)
        const byDay = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
            byDay[d] = 0;
        }
        inPeriod.forEach(p => {
            const d = p.created_at.slice(0, 10);
            if (d in byDay) byDay[d]++;
        });

        res.json({
            success: true,
            stats: {
                totalPosts:      posts.length,
                periodPosts:     inPeriod.length,
                prevPosts:       inPrev.length,
                periodPct:       pct(inPeriod.length, inPrev.length),
                publicPosts:     inPeriod.filter(p => p.visibility === 'PUBLIC').length,
                connectionPosts: inPeriod.filter(p => p.visibility === 'CONNECTIONS').length,
                withMedia:       inPeriod.filter(p => p.media_category).length,
                textOnly:        inPeriod.filter(p => !p.media_category).length,
                byDay:           Object.entries(byDay).map(([date, count]) => ({ date, count })).reverse(),
            }
        });
    } catch (error) {
        console.error('LinkedIn stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get recent posts for the current user
 * GET /api/linkedin/posts?limit=10
 */
router.get('/posts', async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);

        const { data: posts, error } = await supabase
            .from('linkedin_posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        res.json({ success: true, posts: posts || [] });
    } catch (error) {
        console.error('LinkedIn get posts error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Disconnect a LinkedIn account
 * DELETE /api/linkedin/disconnect/:profileId
 */
router.delete('/disconnect/:profileId', async (req, res) => {
    try {
        const userId = req.user.id;
        const profileId = req.params.profileId;

        const { error } = await supabase
            .from('linkedin_connections')
            .delete()
            .eq('user_id', userId)
            .eq('profile_id', profileId);

        if (error) throw error;

        res.json({ success: true, message: 'LinkedIn account disconnected' });
    } catch (error) {
        console.error('LinkedIn disconnect error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
