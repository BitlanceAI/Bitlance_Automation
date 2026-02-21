import { supabase, supabaseAdmin } from '../config/supabaseClient.js';

export const getAllUsers = async (req, res) => {
    try {
        if (!supabaseAdmin) {
            return res.status(500).json({
                success: false,
                error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing. Please add it to your .env file.'
            });
        }

        // 1. Get all users from Auth (requires Service Role Key)
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

        if (authError) throw authError;

        // 2. Get all credit balances
        const { data: credits, error: creditError } = await supabaseAdmin
            .from('user_credits')
            .select('user_id, balance');

        if (creditError) throw creditError;

        // Create a map of user_id -> balance
        const creditMap = {};
        if (credits) {
            credits.forEach(c => {
                creditMap[c.user_id] = c.balance;
            });
        }

        // 3. Merge data
        const combinedUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at,
            credits: creditMap[u.id] || 0
        }));

        res.json({ success: true, users: combinedUsers });

    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const addUser = async (req, res) => {
    try {
        const { email, password, credits } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        // 1. Create user in Supabase Auth
        const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (createError) throw createError;

        const userId = data.user.id;

        // 2. Give initial credits if specified
        if (credits && parseInt(credits) > 0) {
            const { error: creditError } = await supabaseAdmin
                .from('user_credits')
                .upsert({
                    user_id: userId,
                    balance: parseInt(credits),
                    updated_at: new Date().toISOString()
                });

            if (creditError) throw creditError;

            // Log the transaction
            await supabaseAdmin.from('credit_transactions').insert({
                user_id: userId,
                amount: parseInt(credits),
                transaction_type: 'grant',
                description: 'Initial admin grant'
            });
        }

        res.json({ success: true, user: data.user });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const addUserCredits = async (req, res) => {
    try {
        const { id } = req.params;
        const { credits } = req.body;

        if (!credits || isNaN(parseInt(credits))) {
            return res.status(400).json({ success: false, error: 'Valid credits amount is required' });
        }

        const addAmount = parseInt(credits);

        // Fetch current credits
        const { data: currentData, error: fetchError } = await supabaseAdmin
            .from('user_credits')
            .select('balance')
            .eq('user_id', id)
            .single();

        // If they don't have a record yet, create one
        let newBalance = addAmount;
        if (!fetchError && currentData) {
            newBalance = (currentData.balance || 0) + addAmount;
        }

        const { error: updateError } = await supabaseAdmin
            .from('user_credits')
            .upsert({
                user_id: id,
                balance: newBalance,
                updated_at: new Date().toISOString()
            });

        if (updateError) throw updateError;

        // Log the transaction
        await supabaseAdmin.from('credit_transactions').insert({
            user_id: id,
            amount: addAmount,
            transaction_type: 'grant',
            description: 'Admin credit adjustment'
        });

        res.json({ success: true, newBalance });
    } catch (error) {
        console.error('Error adding user credits:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

import { sendRemarketingEmail } from '../services/onesignalService.js';

export const sendRemarketingEmails = async (req, res) => {
    try {
        const { userEmails, subject, body } = req.body;

        if (!userEmails || !Array.isArray(userEmails) || userEmails.length === 0) {
            return res.status(400).json({ success: false, error: 'An array of user emails is required' });
        }

        if (!subject || !body) {
            return res.status(400).json({ success: false, error: 'Email subject and body are required' });
        }

        const result = await sendRemarketingEmail(userEmails, subject, body);

        if (result.success) {
            res.json({ success: true, message: `Remarketing email sent to ${userEmails.length} users.` });
        } else {
            res.status(500).json({ success: false, error: result.error || 'Failed to send remarketing emails' });
        }
    } catch (error) {
        console.error('Error in sendRemarketingEmails controller:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getRenderLogs = async (req, res) => {
    try {
        const renderApiKey = process.env.RENDER_API_KEY;
        const renderServiceId = process.env.RENDER_SERVICE_ID;
        const renderOwnerId = process.env.RENDER_OWNER_ID;

        if (!renderApiKey || !renderServiceId || !renderOwnerId) {
            return res.status(500).json({
                success: false,
                error: 'Render API configuration missing. Add RENDER_API_KEY, RENDER_SERVICE_ID, and RENDER_OWNER_ID to your .env file.'
            });
        }

        const { limit = 100 } = req.query;

        // Render API endpoint: /v1/logs with required ownerId and resource filter
        const params = new URLSearchParams({
            ownerId: renderOwnerId,
            resource: renderServiceId,
            limit: String(limit),
            direction: 'backward'
        });

        const url = `https://api.render.com/v1/logs?${params.toString()}`;

        // Use https module directly to avoid NODE_TLS_REJECT_UNAUTHORIZED interference
        const https = await import('https');
        const result = await new Promise((resolve, reject) => {
            const options = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${renderApiKey}`
                },
                rejectUnauthorized: true, // Force proper TLS for Render API
                timeout: 15000
            };

            const request = https.get(url, options, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    if (response.statusCode >= 400) {
                        console.error('Render API error:', response.statusCode, data);
                        reject(new Error(`Render API returned ${response.statusCode}: ${data}`));
                    } else {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            reject(new Error('Failed to parse Render API response'));
                        }
                    }
                });
            });

            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Render API request timed out'));
            });
        });

        res.json({ success: true, logs: result.logs || result });

    } catch (error) {
        console.error('Error fetching Render logs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


