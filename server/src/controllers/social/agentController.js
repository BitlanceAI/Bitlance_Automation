import axios from 'axios';
import { uploadBuffer } from '../../utils/bunnyStorage.js';
import BrandConfig from '../../models/social/BrandConfig.js';
import ContentCalendar from '../../models/social/ContentCalendar.js';
import PostBundle from '../../models/social/PostBundle.js';
import { getAgenda } from '../../config/agenda.js';
import { JOB_NAME as PUBLISH_BUNDLE_JOB } from '../../jobs/social/publishBundle.js';

const scheduleBundle = async (bundle) => {
    try {
        const ag = getAgenda();
        if (bundle.scheduled_for) {
            await ag.schedule(bundle.scheduled_for, PUBLISH_BUNDLE_JOB, {
                bundleId:  bundle._id.toString(),
                userId:    bundle.userId,
                platform:  bundle.platforms?.[0] || 'instagram',
                profileId: bundle.platforms?.[0] || null,
            });
        }
    } catch { /* Agenda may not be ready yet — job can be scheduled manually */ }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const userCtx = (req) => ({
    userId:      req.user.id,
    workspaceId: req.workspaceId || 'default_workspace',
});

// ── Post Bundles ─────────────────────────────────────────────────────────────

export const getPendingBundles = async (req, res) => {
    try {
        const { workspaceId } = userCtx(req);

        const bundles = await PostBundle.find({ workspaceId, status: 'pending_review' })
            .sort({ createdAt: -1 })
            .lean();

        const formatted = bundles.map(b => ({
            id:                 b._id,
            status:             b.status,
            strategy_used:      b.strategy_used || { topic: 'General', angle: 'Awareness' },
            generated_caption:  b.generated_caption,
            generated_hashtags: b.generated_hashtags || [],
            graphic_asset:      { file_url: b.graphic_url || null },
            scheduled_for:      b.scheduled_for || b.createdAt,
            platforms:          b.platforms || [],
        }));

        res.json({ success: true, data: formatted });
    } catch (err) {
        console.error('[AgentController] getPendingBundles:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateBundleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) return res.status(400).json({ success: false, message: 'status is required' });

        const bundle = await PostBundle.findByIdAndUpdate(id, { status }, { new: true });
        if (!bundle) return res.status(404).json({ success: false, message: 'Bundle not found' });

        // When approved, schedule Agenda to publish at the bundle's scheduled_for time
        if (status === 'approved') await scheduleBundle(bundle);

        res.json({ success: true, data: bundle });
    } catch (err) {
        console.error('[AgentController] updateBundleStatus:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Shared helper: persist Python/Bloom bundles to MongoDB ───────────────────

async function _saveBundles(res, bundles, { userId, workspaceId, pythonApiUrl, req }) {
    const now = new Date();
    const inserted = [];

    for (const b of bundles) {
        const scheduledDate = new Date(now);
        scheduledDate.setDate(now.getDate() + (b.day_offset || 0));

        let graphicUrl = null;

        if (b.graphic_asset?.file_url) {
            try {
                let fetchUrl = b.graphic_asset.file_url;
                if (!fetchUrl.startsWith('http')) fetchUrl = `${pythonApiUrl}/${fetchUrl.replace(/\\/g, '/')}`;
                const imgRes = await axios.get(fetchUrl, {
                    responseType: 'arraybuffer',
                    headers: { 'Authorization': `Bearer ${req.token}` }
                });
                const filename = `ai-social-graphics/${workspaceId}/${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
                graphicUrl = await uploadBuffer(Buffer.from(imgRes.data), filename, 'image/png');
            } catch (uploadErr) {
                console.warn('[AgentController] Graphic upload failed:', uploadErr.message);
                graphicUrl = b.graphic_asset.file_url;
            }
        }

        const bundle = await PostBundle.create({
            userId,
            workspaceId,
            generated_caption:  b.generated_caption,
            generated_hashtags: b.generated_hashtags || [],
            strategy_used:      b.strategy_used || {},
            graphic_url:        graphicUrl,
            scheduled_for:      scheduledDate,
            day_offset:         b.day_offset || 0,
            platforms:          b.platforms || ['instagram'],
            status:             'pending_review',
        });

        inserted.push(bundle);
    }

    return res.json({ success: true, message: `Generated ${inserted.length} posts`, data: inserted });
}

export const generateCalendar = async (req, res) => {
    try {
        const { workspaceId, userId } = userCtx(req);
        const { brand_config, calendar, days = 3, generate_graphics = false, use_bloom = true } = req.body;

        if (!brand_config || !calendar) {
            return res.status(400).json({ success: false, message: 'Missing brand_config or calendar' });
        }

        // ── Primary: Python Social-Agent MCP → Bloom image generation ────────
        if (use_bloom && process.env.BLOOM_API_KEY) {
            try {
                const {
                    generateBundlesViaMCP,
                    generateAndWait,
                } = await import('../../services/social/bloomMCPService.js');

                // 1. Get captions + hashtags + Bloom-ready image prompts from Python MCP
                const mcpBundles = await generateBundlesViaMCP({
                    brandConfig: brand_config,
                    calendar,
                    days,
                    language: brand_config.language || 'English',
                });

                if (mcpBundles?.length) {
                    console.log(`[AgentController] Social MCP returned ${mcpBundles.length} bundles`);

                    // 2. Get the brand's Bloom session ID
                    const BrandConfig = (await import('../../models/social/BrandConfig.js')).default;
                    const brandDoc = brand_config._id 
                        ? await BrandConfig.findById(brand_config._id) 
                        : null;
                    const bloomBrandId = brandDoc?.bloom_brand_status === 'ready' ? brandDoc.bloom_brand_id : null;

                    if (generate_graphics && !bloomBrandId) {
                        console.log('[AgentController] Bloom not onboarded — falling back to OpenAI image generation via Python REST');
                    }

                    const now = new Date();
                    const inserted = [];

                    for (const b of mcpBundles) {
                        const scheduledDate = new Date(now);
                        scheduledDate.setDate(now.getDate() + (b.day_offset || 0));

                        let graphicUrl = null;

                        if (generate_graphics) {
                            if (bloomBrandId && b.bloom_image_prompt) {
                                // Path A: TryBloom on-brand graphic
                                try {
                                    const { imageUrl } = await generateAndWait(bloomBrandId, b.bloom_image_prompt, {
                                        aspectRatio: '4:5',
                                        model: 'standard',
                                    });
                                    // Re-upload from TryBloom CDN to our Bunny storage
                                    if (imageUrl) {
                                        try {
                                            const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                                            const filename = `ai-social-graphics/${workspaceId}/${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
                                            graphicUrl = await uploadBuffer(Buffer.from(imgRes.data), filename, 'image/png');
                                        } catch (uploadErr) {
                                            console.warn('[AgentController] Bunny upload failed, using Bloom URL:', uploadErr.message);
                                            graphicUrl = imageUrl;
                                        }
                                    }
                                } catch (imgErr) {
                                    console.warn('[AgentController] Bloom image failed:', imgErr.message);
                                }
                            }

                            // Path B: Fallback to OpenAI if Bloom didn't produce an image
                            if (!graphicUrl) {
                                try {
                                    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8001';
                                    const imgPrompt = b.bloom_image_prompt || b.generated_caption;
                                    const imgRes = await axios.post(
                                        `${pythonApiUrl}/api/social/generate-image`,
                                        { prompt: imgPrompt, caption: b.generated_caption, strategy: JSON.stringify(b.strategy_used) },
                                        { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${req.token}` }, timeout: 120000 }
                                    );
                                    const imgData = imgRes.data;
                                    if (imgData.success && imgData.file_url) {
                                        let fetchUrl = imgData.file_url;
                                        if (!fetchUrl.startsWith('http')) fetchUrl = `${pythonApiUrl}/${fetchUrl.replace(/\\/g, '/')}`;
                                        const dlRes = await axios.get(fetchUrl, { 
                                            responseType: 'arraybuffer',
                                            headers: { 'Authorization': `Bearer ${req.token}` }
                                        });
                                        const filename = `ai-social-graphics/${workspaceId}/${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
                                        graphicUrl = await uploadBuffer(Buffer.from(dlRes.data), filename, 'image/png');
                                    }
                                } catch (fallbackErr) {
                                    console.warn('[AgentController] OpenAI image fallback failed:', fallbackErr.message);
                                }
                            }
                        }

                        const bundle = await PostBundle.create({
                            userId,
                            workspaceId,
                            generated_caption:  b.generated_caption,
                            generated_hashtags: b.generated_hashtags || [],
                            strategy_used:      b.strategy_used || {},
                            graphic_url:        graphicUrl,
                            scheduled_for:      scheduledDate,
                            day_offset:         b.day_offset || 0,
                            platforms:          b.platforms || ['instagram'],
                            status:             'pending_review',
                        });
                        inserted.push(bundle);
                    }

                    return res.json({ success: true, message: `Generated ${inserted.length} posts`, data: inserted });
                }
            } catch (mcpErr) {
                console.warn('[AgentController] Social MCP failed, falling back to Python REST:', mcpErr.message);
            }
        }

        // ── Fallback: Perplexity via Python REST API ──────────────────────────
        const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8001';

        const response = await axios.post(
            `${pythonApiUrl}/api/social/generate-calendar`,
            { brand_config, calendar, days, generate_graphics },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.token}`
                },
                timeout: 600000
            }
        );

        const result = response.data;
        if (!result.success) throw new Error('Python API failed: ' + JSON.stringify(result));

        return await _saveBundles(res, result.bundles, { userId, workspaceId, pythonApiUrl, req });
    } catch (err) {
        console.error('[AgentController] generateCalendar:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Bloom Brand Onboarding ────────────────────────────────────────────────────

export const onboardBloomBrand = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const { id } = req.params;
        const { website_url, logo_url } = req.body;

        if (!website_url) return res.status(400).json({ success: false, message: 'website_url is required' });

        const brand = await BrandConfig.findOne({ _id: id, userId, workspaceId });
        if (!brand) return res.status(404).json({ success: false, message: 'Brand config not found' });

        const { onboardBrand } = await import('../../services/social/bloomMCPService.js');
        const result = await onboardBrand(website_url, logo_url || null);

        brand.website_url        = website_url;
        brand.bloom_brand_id     = result.id;
        brand.bloom_brand_status = result.status;
        await brand.save();

        res.json({ success: true, data: { bloom_brand_id: result.id, status: result.status } });
    } catch (err) {
        console.error('[AgentController] onboardBloomBrand:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getBloomBrandStatus = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const { id } = req.params;

        const brand = await BrandConfig.findOne({ _id: id, userId, workspaceId });
        if (!brand) return res.status(404).json({ success: false, message: 'Brand config not found' });
        if (!brand.bloom_brand_id) return res.status(400).json({ success: false, message: 'Brand not onboarded to Bloom yet' });

        const { waitForBrand } = await import('../../services/social/bloomMCPService.js');
        const result = await waitForBrand(brand.bloom_brand_id, 10);   // short poll — 10s

        if (result.status !== brand.bloom_brand_status) {
            brand.bloom_brand_status = result.status;
            await brand.save();
        }

        res.json({
            success: true,
            data: {
                bloom_brand_id:  brand.bloom_brand_id,
                status:          result.status,
                name:            result.name,
                colors:          result.colors,
                fonts:           result.fonts,
                logo_url:        result.logo_url,
                aesthetic:       result.aesthetic,
            },
        });
    } catch (err) {
        console.error('[AgentController] getBloomBrandStatus:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Brand Configs ─────────────────────────────────────────────────────────────

export const getBrandConfigs = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const data = await BrandConfig.find({ userId, workspaceId }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const createBrandConfig = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const { brand_name, brand_tone, brand_niche, brand_website_url } = req.body;

        let bloom_brand_id = null;
        let bloom_brand_status = null;

        if (brand_website_url && process.env.BLOOM_API_KEY) {
            try {
                const { onboardBrand } = await import('../../services/social/bloomMCPService.js');
                const result = await onboardBrand(brand_website_url, null);
                bloom_brand_id = result.id;
                bloom_brand_status = result.status;
            } catch (err) {
                console.warn('[createBrandConfig] Auto-onboard Bloom failed:', err.message);
            }
        }

        const doc = await BrandConfig.create({ 
            userId, workspaceId, brand_name, brand_tone, brand_niche, 
            website_url: brand_website_url, bloom_brand_id, bloom_brand_status 
        });
        res.status(201).json({ success: true, data: doc });
    } catch (err) {
        console.error('[createBrandConfig]:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateBrandConfig = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const { id } = req.params;
        const { brand_name, brand_tone, brand_niche, brand_website_url } = req.body;

        const updateData = { brand_name, brand_tone, brand_niche, website_url: brand_website_url };

        const existingDoc = await BrandConfig.findOne({ _id: id, userId, workspaceId });
        if (!existingDoc) return res.status(404).json({ success: false, message: 'Not found' });

        if (brand_website_url && process.env.BLOOM_API_KEY && !existingDoc.bloom_brand_id) {
            try {
                const { onboardBrand } = await import('../../services/social/bloomMCPService.js');
                const result = await onboardBrand(brand_website_url, null);
                updateData.bloom_brand_id = result.id;
                updateData.bloom_brand_status = result.status;
            } catch (err) {
                console.warn('[updateBrandConfig] Auto-onboard Bloom failed:', err.message);
            }
        }

        const doc = await BrandConfig.findOneAndUpdate(
            { _id: id, userId, workspaceId },
            updateData,
            { new: true }
        );

        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: doc });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteBrandConfig = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const { id } = req.params;

        await BrandConfig.findOneAndDelete({ _id: id, userId, workspaceId });
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Content Calendars ─────────────────────────────────────────────────────────

export const getCalendars = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const data = await ContentCalendar.find({ userId, workspaceId }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const createCalendar = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const { month, year, themes, festivals } = req.body;

        const doc = await ContentCalendar.create({ userId, workspaceId, month, year, themes, festivals });
        res.status(201).json({ success: true, data: doc });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateCalendar = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const { id } = req.params;
        const { month, year, themes, festivals } = req.body;

        const doc = await ContentCalendar.findOneAndUpdate(
            { _id: id, userId, workspaceId },
            { month, year, themes, festivals },
            { new: true }
        );

        if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: doc });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteCalendar = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const { id } = req.params;

        await ContentCalendar.findOneAndDelete({ _id: id, userId, workspaceId });
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── Ads Library ───────────────────────────────────────────────────────────────

export const listAdsBrands = async (req, res) => {
    try {
        const { userId, workspaceId } = userCtx(req);
        const { listBrands } = await import('../../services/social/bloomMCPService.js');
        let brands = await listBrands();

        // Fallback: use local BrandConfigs that have a bloom_brand_id
        if (!brands.length) {
            const locals = await BrandConfig.find({ userId, workspaceId, bloom_brand_id: { $ne: null } }).lean();
            brands = locals.map(b => ({ id: b.bloom_brand_id, name: b.brand_name || b.name }));
        }

        res.json({ success: true, brands });
    } catch (err) {
        console.error('[AgentController] listAdsBrands:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const findBloomReferenceAds = async (req, res) => {
    try {
        const { brand_id, query, top_k = 6 } = req.body;

        if (!brand_id) return res.status(400).json({ success: false, message: 'brand_id is required' });
        if (!query || !query.trim()) return res.status(400).json({ success: false, message: 'query is required' });

        const { findReferenceAds } = await import('../../services/social/bloomMCPService.js');
        const ads = await findReferenceAds(brand_id, query.trim(), Number(top_k));

        res.json({ success: true, ads });
    } catch (err) {
        console.error('[AgentController] findBloomReferenceAds:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
