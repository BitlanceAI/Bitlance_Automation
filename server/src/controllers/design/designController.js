import { supabaseAdmin } from '../../config/supabaseClient.js';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import CreditLedgerService from '../../services/credits/creditLedgerService.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Design Controller
 * Handles flyer generation and design job management
 */

const COST_PER_FLYER = 5; // Credits per image
const ADMIN_ID = '0d396440-7d07-407c-89da-9cb93e353347';

/**
 * POST /api/design/generate-flyer
 * Generate a real estate flyer
 */
export const generateFlyer = async (req, res) => {
    try {
        let {
            property_type,
            bhk,
            location,
            price,
            builder,
            phone,
            email,
            address,
            amenities = [],
            extra_details,
            niche,
            image_size,
            image_quality,
            template_id = 'random', // Default to random for variety
            num_variants = 1,
            theme_color
        } = req.body;

        num_variants = parseInt(num_variants, 10);
        if (isNaN(num_variants) || num_variants < 1) num_variants = 1;
        if (num_variants > 4) num_variants = 4; // limit to max 4 to avoid huge costs

        // Apply defaults for fields that might be empty or null
        bhk = bhk || '2 & 3 BHK';
        price = price || 'Contact for Price';
        builder = builder || 'Unknown Builder';
        phone = phone || 'N/A';
        email = email || 'N/A';
        address = address || 'N/A';

        const userId = req.user.id; // From Auth Middleware
        const token = req.token;

        // Validation
        if (!property_type || !location) {
            return res.status(400).json({
                success: false,
                error: 'Property type and location are required'
            });
        }

        // Create scoped Supabase client for RLS
        const scopedSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        // 1. Pre-flight Credit Check
        const isAdmin = userId === ADMIN_ID;

        const creditCheck = await CreditLedgerService.validateCreditsAvailable(
            userId,
            'design',
            num_variants // 1 image per variant
        );

        if (!creditCheck.hasEnough) {
            return res.status(402).json({
                success: false,
                error: 'Insufficient credits',
                required: creditCheck.creditsNeeded,
                balance: creditCheck.currentBalance,
                deficit: creditCheck.deficit
            });
        }

        console.log(`✅ Credit pre-check passed: ${creditCheck.creditsNeeded} credits available`);

        // 2. Create Design Job Entry (PENDING status)
        const { data: designJob, error: saveError } = await supabaseAdmin
            .from('design_jobs')
            .insert({
                user_id: userId,
                property_type,
                location,
                price,
                builder,
                phone,
                email,
                address,
                status: 'pending',
                credits_used: COST_PER_FLYER * num_variants,
                metadata: { image_size, image_quality, niche, template_id, num_variants, theme_color }
            })
            .select()
            .single();

        if (saveError) {
            console.error('Save design job error:', saveError);
            throw saveError;
        }

        console.log(`✅ Design job created: ${designJob.id}`);

        // 3. Deduct Credits via Ledger
        let ledgerResult;
        try {
            ledgerResult = await CreditLedgerService.deductCreditsWithLedger({
                userId,
                agentType: 'design',
                referenceId: designJob.id,
                referenceTable: 'design_jobs',
                usageQuantity: num_variants, // number of variants
                metadata: {
                    property_type,
                    location,
                    price,
                    builder
                }
            });

            console.log(`💰 Ledger entry created: ${ledgerResult.ledger_id}`);
            console.log(`📊 Credits deducted: ${ledgerResult.credits_deducted} (Balance: ${ledgerResult.new_balance})`);

        } catch (ledgerError) {
            console.error('⚠️ CRITICAL: Design job saved but credits not deducted!', ledgerError);

            // Mark job as failed due to credit deduction failure
            await supabaseAdmin
                .from('design_jobs')
                .update({
                    status: 'failed',
                    error_message: 'Credit deduction failed'
                })
                .eq('id', designJob.id);

            return res.status(500).json({
                success: false,
                error: 'Failed to process payment'
            });
        }



        // 4. Execute Python Generation Script (via External Microservice)
        let generatedResult;
        try {
            console.log('🚀 Starting business logic generation...');

            const GRAPHIC_API = process.env.GRAPHIC_GENERATOR_URL;
            if (!GRAPHIC_API) {
                throw new Error("GRAPHIC_GENERATOR_URL env var not set");
            }

            console.log(`📡 Calling Graphic Service: ${GRAPHIC_API}/api/generate_from_details`);

            // Define input data for External API
            const inputData = {
                property_type,
                bhk,
                location,
                price,
                builder,
                phone,
                email,
                address,
                amenities,
                extra_details,
                niche,
                image_size,
                image_quality,
                template_id,
                num_variants,
                theme_color
            };

            const response = await axios.post(`${GRAPHIC_API}/api/generate_from_details`, inputData);
            generatedResult = response.data;

            console.log('✅ Graphic Service response received');

            if (!generatedResult.success) {
                throw new Error(generatedResult.error || 'External service reported failure');
            }

            // 5. Upload Generated Image(s) to Supabase
            const b64_list = generatedResult.images_base64 || (generatedResult.image_base64 ? [generatedResult.image_base64] : []);
            if (!b64_list.length) {
                throw new Error('Service did not return any images');
            }

            const uploadedUrls = [];
            for (let i = 0; i < b64_list.length; i++) {
                const base64Data = b64_list[i];
                if (!base64Data) continue;

                const fileContent = Buffer.from(base64Data, 'base64');
                const fileName = `flyer_${designJob.id}_var${i}_${Date.now()}.png`;

                const { data: uploadData, error: uploadError } = await supabaseAdmin
                    .storage
                    .from('designs')
                    .upload(fileName, fileContent, {
                        contentType: 'image/png',
                        upsert: false
                    });

                if (uploadError) {
                    console.error(`Upload failed for variant ${i}:`, uploadError);
                    throw uploadError;
                }

                const { data: publicUrlData } = supabaseAdmin
                    .storage
                    .from('designs')
                    .getPublicUrl(fileName);

                uploadedUrls.push(publicUrlData.publicUrl);
            }

            const flyerUrl = uploadedUrls[0];

            // 6. Update Job Status
            await supabaseAdmin
                .from('design_jobs')
                .update({
                    status: 'completed',
                    flyer_url: flyerUrl,
                    metadata: {
                        ...designJob.metadata,
                        flyer_urls: uploadedUrls
                    }
                })
                .eq('id', designJob.id);

            // Return success with URL
            res.json({
                success: true,
                message: 'Flyer(s) generated successfully',
                jobId: designJob.id,
                creditsUsed: ledgerResult?.credits_deducted || (COST_PER_FLYER * num_variants),
                newBalance: ledgerResult?.new_balance,
                flyerUrl: flyerUrl,
                flyerUrls: uploadedUrls,
                status: 'completed'
            });

        } catch (genError) {
            console.error('❌ Generation/Upload failed:', genError);

            // Refund credits or just mark failed?
            // For now mark failed. Ideally should refund.
            await supabaseAdmin
                .from('design_jobs')
                .update({
                    status: 'failed',
                    error_message: genError.message
                })
                .eq('id', designJob.id);

            // Refund logic could go here
            return res.status(500).json({
                success: false,
                error: 'Generation failed: ' + genError.message
            });
        }

        // Remove the default response that was here
        return;

    } catch (error) {
        console.error('Design Generation Error:', error);

        // Handle insufficient credits error
        if (error.code === 'INSUFFICIENT_CREDITS') {
            return res.status(402).json({
                success: false,
                error: 'Insufficient credits to generate flyer'
            });
        }

        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * GET /api/design/jobs
 * Get all design jobs for the authenticated user
 */
export const getJobs = async (req, res) => {
    try {
        const userId = req.user.id;

        // Use supabaseAdmin to avoid RLS permission issues
        const { data: jobs, error } = await supabaseAdmin
            .from('design_jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch jobs error:', error);
            throw error;
        }

        res.json({
            success: true,
            jobs: jobs || []
        });

    } catch (error) {
        console.error('Get Jobs Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * GET /api/design/jobs/:id
 * Get a specific design job by ID
 */
export const getJobById = async (req, res) => {
    try {
        const userId = req.user.id;
        const token = req.token;
        const { id } = req.params;

        const scopedSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        const { data: job, error } = await scopedSupabase
            .from('design_jobs')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Fetch job error:', error);
            throw error;
        }

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        res.json({
            success: true,
            job
        });

    } catch (error) {
        console.error('Get Job By ID Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/design/generate-from-prompt
 * Generate a real estate flyer from custom prompt
 */
export const generateFromPrompt = async (req, res) => {
    try {
        const {
            prompt,
            image_size = '1024x1024',
            image_quality = 'low'
        } = req.body;

        const userId = req.user.id;
        const token = req.token;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required'
            });
        }

        const creditCheck = await CreditLedgerService.validateCreditsAvailable(userId, 'design', 1);
        if (!creditCheck.hasEnough) {
            return res.status(402).json({
                success: false,
                error: 'Insufficient credits',
                required: creditCheck.creditsNeeded,
                balance: creditCheck.currentBalance,
                deficit: creditCheck.deficit
            });
        }

        // Create Design Job Entry
        const { data: designJob, error: saveError } = await supabaseAdmin
            .from('design_jobs')
            .insert({
                user_id: userId,
                property_type: 'Custom Design',
                location: 'Custom Prompt',
                price: 'N/A',
                builder: 'N/A',
                phone: 'N/A',
                email: 'N/A',
                address: 'N/A',
                status: 'pending',
                credits_used: COST_PER_FLYER,
                metadata: { prompt, image_size, image_quality }
            })
            .select()
            .single();

        if (saveError) throw saveError;

        let ledgerResult;
        try {
            ledgerResult = await CreditLedgerService.deductCreditsWithLedger({
                userId,
                agentType: 'design',
                referenceId: designJob.id,
                referenceTable: 'design_jobs',
                usageQuantity: 1,
                metadata: { prompt }
            });
        } catch (ledgerError) {
            await supabaseAdmin
                .from('design_jobs')
                .update({ status: 'failed', error_message: 'Credit deduction failed' })
                .eq('id', designJob.id);
            return res.status(500).json({ success: false, error: 'Failed to process payment' });
        }

        const GRAPHIC_API = process.env.GRAPHIC_GENERATOR_URL;
        if (!GRAPHIC_API) throw new Error("GRAPHIC_GENERATOR_URL env var not set");

        const response = await axios.post(`${GRAPHIC_API}/api/generate_from_prompt`, {
            prompt,
            image_size,
            image_quality
        });

        const generatedResult = response.data;
        if (!generatedResult.success) throw new Error(generatedResult.error || 'External service reported failure');

        const base64Data = generatedResult.image_base64;
        if (!base64Data) throw new Error('Service did not return image_base64');

        const fileContent = Buffer.from(base64Data, 'base64');
        const fileName = `flyer_${designJob.id}_${Date.now()}.png`;

        const { error: uploadError } = await supabaseAdmin
            .storage
            .from('designs')
            .upload(fileName, fileContent, { contentType: 'image/png', upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabaseAdmin.storage.from('designs').getPublicUrl(fileName);
        const flyerUrl = publicUrlData.publicUrl;

        await supabaseAdmin
            .from('design_jobs')
            .update({ status: 'completed', flyer_url: flyerUrl })
            .eq('id', designJob.id);

        res.json({
            success: true,
            message: 'Flyer generated successfully',
            jobId: designJob.id,
            creditsUsed: ledgerResult?.credits_deducted || COST_PER_FLYER,
            newBalance: ledgerResult?.new_balance,
            flyerUrl: flyerUrl,
            status: 'completed'
        });

    } catch (error) {
        console.error('Design Generation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Helper to run Python script
 */
function runPythonGenerator(scriptPath, inputData) {
    const scriptDir = path.dirname(scriptPath);
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [scriptPath, JSON.stringify(inputData)], {
            cwd: scriptDir
        });

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    // Try to parse JSON lines
                    const json = JSON.parse(line);
                    if (json.status) {
                        console.log(`[Python Status] ${json.status}`);
                    }
                    if (json.success !== undefined) {
                        outputData = json;
                    }
                } catch (e) {
                    console.log(`[Python Log] ${line}`);
                }
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
            console.error(`[Python Stderr] ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python script exited with code ${code}: ${errorData}`));
            } else {
                if (outputData && outputData.success) {
                    resolve(outputData);
                } else if (outputData && !outputData.success) {
                    reject(new Error(outputData.error || 'Python script returned failure'));
                } else {
                    reject(new Error('No valid JSON output from python script'));
                }
            }
        });
    });
}

export default {
    generateFlyer,
    generateFromPrompt,
    getJobs,
    getJobById
};
