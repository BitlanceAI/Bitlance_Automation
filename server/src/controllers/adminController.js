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
        const { data: credits, error: creditError } = await supabase
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
