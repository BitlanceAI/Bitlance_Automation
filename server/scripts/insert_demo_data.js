import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function insertDemoData() {
    try {
        console.log("Fetching a workspace_id to use...");
        let workspaceId = 'default_workspace';
        
        // Try to find a real workspace ID from brand_configs
        const { data: workspaces, error: wsError } = await supabase.from('brand_configs').select('workspace_id').limit(1);
        if (!wsError && workspaces && workspaces.length > 0) {
            workspaceId = workspaces[0].workspace_id;
        }
        
        console.log("Using workspace_id:", workspaceId);

        // 1. Insert graphic asset
        const { data: asset, error: assetError } = await supabase.from('graphic_assets').insert({
            workspace_id: workspaceId,
            file_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
            asset_type: 'image'
        }).select().single();

        if (assetError) throw assetError;
        console.log("Inserted demo graphic asset:", asset.id);

        // 2. Insert post bundles
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        const bundles = [
            {
                workspace_id: workspaceId,
                status: 'pending_review',
                generated_caption: "🚀 Big news! We're thrilled to announce the launch of our new AI-powered platform. Say goodbye to manual processes and hello to automation! #AI #Innovation #TechStartup",
                generated_hashtags: ["#AI", "#Innovation", "#TechStartup", "#Automation"],
                strategy_used: { topic: "Product Launch", angle: "Excitement & Awareness" },
                graphic_asset_id: asset.id,
                scheduled_for: tomorrow.toISOString()
            },
            {
                workspace_id: workspaceId,
                status: 'pending_review',
                generated_caption: "Did you know that teams using our platform save an average of 15 hours a week? 🕒 Stop doing busywork and start doing impactful work.\n\nLink in bio to see the case study! 👇",
                generated_hashtags: ["#Productivity", "#TimeManagement", "#SaaS", "#Growth"],
                strategy_used: { topic: "Customer Success", angle: "Value & ROI" },
                graphic_asset_id: asset.id,
                scheduled_for: nextWeek.toISOString()
            }
        ];

        const { data: insertedBundles, error: bundleError } = await supabase.from('post_bundles').insert(bundles).select();
        
        if (bundleError) throw bundleError;
        console.log("Inserted", insertedBundles.length, "demo post bundles successfully!");

    } catch (e) {
        console.error("Error inserting demo data:", e.message);
    }
}

insertDemoData();
