import { supabaseAdmin } from '../config/supabaseClient.js';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import CreditLedgerService from '../services/creditLedgerService.js';
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
        const {
            property_type,
            bhk = '2 & 3 BHK',
            location,
            price,
            builder,
            phone,
            email,
            address,
            amenities = [],
            template_id = 'classic' // Default to classic
        } = req.body;

        const userId = req.user.id; // From Auth Middleware
        const token = req.token;

        // Validation
        if (!property_type || !location || !price || !builder || !phone || !email || !address) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
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

        // 1. Pre-flight Credit Check (Admin bypasses)
        const isAdmin = userId === ADMIN_ID;

        if (isAdmin) {
            console.log('👑 Admin access: Bypassing credit check');
        } else {
            const creditCheck = await CreditLedgerService.validateCreditsAvailable(
                userId,
                'design',
                1 // 1 image
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
        }

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
                credits_used: COST_PER_FLYER
            })
            .select()
            .single();

        if (saveError) {
            console.error('Save design job error:', saveError);
            throw saveError;
        }

        console.log(`✅ Design job created: ${designJob.id}`);

        // 3. Deduct Credits via Ledger (Admin bypasses)
        let ledgerResult;
        if (isAdmin) {
            console.log('👑 Admin access: Skipping credit deduction');
        } else {
            try {
                ledgerResult = await CreditLedgerService.deductCreditsWithLedger({
                    userId,
                    agentType: 'design',
                    referenceId: designJob.id,
                    referenceTable: 'design_jobs',
                    usageQuantity: 1, // 1 image
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
        }



        // 4. Execute Python Generation Script (via External Microservice)
        let generatedResult;
        try {
            console.log('🚀 Starting business logic generation...');

            const GRAPHIC_API = process.env.GRAPHIC_GENERATOR_URL;
            if (!GRAPHIC_API) {
                throw new Error("GRAPHIC_GENERATOR_URL env var not set");
            }

            console.log(`📡 Calling Graphic Service: ${GRAPHIC_API}/api/generate`);

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
                template_id
            };

            const response = await axios.post(`${GRAPHIC_API}/api/generate`, inputData);
            generatedResult = response.data;

            console.log('✅ Graphic Service response received');

            if (!generatedResult.success) {
                throw new Error(generatedResult.error || 'External service reported failure');
            }

            // 5. Upload Generated Image to Supabase
            // Service returns base64
            const base64Data = generatedResult.image_base64;
            if (!base64Data) {
                throw new Error('Service did not return image_base64');
            }

            const fileContent = Buffer.from(base64Data, 'base64');
            const fileName = `flyer_${designJob.id}_${Date.now()}.png`;

            // Create a public URL for the uploaded file
            // Note: Ensure 'designs' bucket exists and is public
            const { data: uploadData, error: uploadError } = await supabaseAdmin
                .storage
                .from('designs')
                .upload(fileName, fileContent, {
                    contentType: 'image/png',
                    upsert: false
                });

            if (uploadError) {
                // Try creating bucket if it doesn't exist (this usually fails if not admin, but we use supabaseAdmin)
                console.error('Upload failed, possible bucket issue:', uploadError);
                throw uploadError;
            }

            const { data: publicUrlData } = supabaseAdmin
                .storage
                .from('designs')
                .getPublicUrl(fileName);

            const flyerUrl = publicUrlData.publicUrl;

            // 6. Update Job Status (use admin client to avoid RLS issues)
            await supabaseAdmin
                .from('design_jobs')
                .update({
                    status: 'completed',
                    flyer_url: flyerUrl
                })
                .eq('id', designJob.id);

            // Return success with URL
            res.json({
                success: true,
                message: 'Flyer generated successfully',
                jobId: designJob.id,
                creditsUsed: ledgerResult?.credits_deducted || COST_PER_FLYER,
                newBalance: ledgerResult?.new_balance,
                flyerUrl: flyerUrl,
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
    getJobs,
    getJobById
};
