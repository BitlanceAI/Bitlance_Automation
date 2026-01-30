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
