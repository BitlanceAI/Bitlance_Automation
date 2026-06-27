import { supabase } from '../../config/supabaseClient.js';
import axios from 'axios';
import { uploadBuffer } from '../../utils/bunnyStorage.js';

export const getPendingBundles = async (req, res) => {
    try {
        const { workspace_id } = req.query; // Or extract from user session token
        if (!workspace_id) {
            return res.status(400).json({ success: false, message: 'workspace_id is required' });
        }

        const { data, error } = await supabase
            .from('post_bundles')
            .select(`
                *,
                graphic_assets!post_bundles_graphic_asset_id_fkey(file_url, asset_type)
            `)
            .eq('workspace_id', workspace_id)
            .eq('status', 'pending_review')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map the data to match frontend expectations
        const formattedData = data.map(bundle => ({
            id: bundle.id,
            status: bundle.status,
            strategy_used: { topic: 'General', angle: 'Awareness' }, // Strategy could be saved as a separate JSON column later
            generated_caption: bundle.generated_caption,
            generated_hashtags: bundle.generated_hashtags || [],
            graphic_asset: { file_url: bundle.graphic_assets?.file_url || null },
            scheduled_for: bundle.scheduled_for || new Date().toISOString()
        }));

        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        console.error('[AgentController] Error fetching pending bundles:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBundleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!status) {
            return res.status(400).json({ success: false, message: 'status is required' });
        }

        const { data, error } = await supabase
            .from('post_bundles')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('[AgentController] Error updating bundle status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const generateCalendar = async (req, res) => {
    try {
        const { workspace_id, brand_config, calendar, days } = req.body;

        if (!workspace_id || !brand_config || !calendar) {
            return res.status(400).json({ success: false, message: 'Missing required parameters' });
        }

        // Call Python API
        const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8001';
        
        const response = await axios.post(`${pythonApiUrl}/api/social/generate-calendar`, 
            { brand_config, calendar, days: days || 3 },
            {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.token}`
                },
                timeout: 600000 // 10 minutes
            }
        );

        const result = response.data;

        if (!result.success) {
            throw new Error('Python API generation failed: ' + JSON.stringify(result));
        }

        const now = new Date();
        const bundlesToInsert = result.bundles.map(b => {
            const scheduledDate = new Date(now);
            scheduledDate.setDate(now.getDate() + b.day_offset); // Schedule them a day apart
            
            // Note: graphic_asset from python has 'file_url'. We can save it as JSON in a new column 
            // or simply insert it in graphic_assets table and link it. For simplicity, we can store 
            // graphic_assets inline as JSON for now, or just extract the URL.
            // Wait, we can just save it into graphic_assets and get the id.
            
            return {
                workspace_id,
                status: b.status,
                generated_caption: b.generated_caption,
                generated_hashtags: b.generated_hashtags,
                strategy_used: b.strategy_used,
                scheduled_for: scheduledDate.toISOString(),
                temp_graphic_url: b.graphic_asset?.file_url // Hack for now to save URL directly
            };
        });

        // Insert into Supabase
        // We will just insert the post bundles.
        // We can create graphic_assets later or update the schema to accept temp_graphic_url.
        // For now, let's just create graphic_assets records for them first.
        for (const bundle of bundlesToInsert) {
            let assetId = null;
            let finalImageUrl = bundle.temp_graphic_url;

            if (bundle.temp_graphic_url) {
                try {
                    // Fetch the image from the temporary local Python server
                    let fetchUrl = bundle.temp_graphic_url;
                    if (!fetchUrl.startsWith('http')) {
                        // Ensure it is a valid absolute URL for axios
                        fetchUrl = `${pythonApiUrl}/${fetchUrl.replace(/\\/g, '/')}`;
                    }
                    const imageRes = await axios.get(fetchUrl, { 
                        responseType: 'arraybuffer',
                        headers: { 'Authorization': `Bearer ${req.token}` }
                    });
                    const buffer = Buffer.from(imageRes.data);
                    
                    // Upload to Bunny.net CDN
                    const filename = `ai-social-graphics/${workspace_id}/${Date.now()}_${Math.floor(Math.random()*1000)}.png`;
                    finalImageUrl = await uploadBuffer(buffer, filename, 'image/png');
                } catch (uploadErr) {
                    console.error('[AgentController] Failed to upload graphic to Bunny:', uploadErr);
                    // Fallback to local url if upload fails
                }

                const { data: assetData, error: assetError } = await supabase
                    .from('graphic_assets')
                    .insert({ 
                        workspace_id, 
                        file_url: finalImageUrl, 
                        asset_type: 'image' 
                    })
                    .select()
                    .single();
                
                if (!assetError && assetData) {
                    assetId = assetData.id;
                }
            }

            delete bundle.temp_graphic_url;

            await supabase.from('post_bundles').insert({
                ...bundle,
                graphic_asset_id: assetId
            });
        }

        res.status(200).json({ success: true, message: `Generated ${bundlesToInsert.length} posts` });
    } catch (error) {
        console.error('[AgentController] Error generating calendar:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------------------
// Brand Configs CRUD
// ---------------------------------------------------------

export const getBrandConfigs = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { data, error } = await supabase
            .from('brand_configs')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createBrandConfig = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { brand_name, brand_tone, brand_niche } = req.body;
        
        console.log('[createBrandConfig] workspaceId:', workspaceId, 'body:', req.body);
        
        const { data, error } = await supabase
            .from('brand_configs')
            .insert({ workspace_id: workspaceId, brand_name, brand_tone, brand_niche })
            .select()
            .single();
            
        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('[createBrandConfig] ERROR:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateBrandConfig = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { id } = req.params;
        const { brand_name, brand_tone, brand_niche } = req.body;
        
        const { data, error } = await supabase
            .from('brand_configs')
            .update({ brand_name, brand_tone, brand_niche, updated_at: new Date() })
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select()
            .single();
            
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteBrandConfig = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { id } = req.params;
        
        const { error } = await supabase
            .from('brand_configs')
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);
            
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ---------------------------------------------------------
// Content Calendars CRUD
// ---------------------------------------------------------

export const getCalendars = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { data, error } = await supabase
            .from('content_calendars')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createCalendar = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { month, year, themes, festivals } = req.body;
        
        const { data, error } = await supabase
            .from('content_calendars')
            .insert({ workspace_id: workspaceId, month, year, themes, festivals })
            .select()
            .single();
            
        if (error) throw error;
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCalendar = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { id } = req.params;
        const { month, year, themes, festivals } = req.body;
        
        const { data, error } = await supabase
            .from('content_calendars')
            .update({ month, year, themes, festivals })
            .eq('id', id)
            .eq('workspace_id', workspaceId)
            .select()
            .single();
            
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCalendar = async (req, res) => {
    try {
        const workspaceId = req.workspaceId;
        const { id } = req.params;
        
        const { error } = await supabase
            .from('content_calendars')
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);
            
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
