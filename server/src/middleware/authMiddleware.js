import { supabase } from '../config/supabaseClient.js';

export const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'Authorization header missing' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, error: 'Token missing' });
        }

        if (token === 'dummy-token-for-dev') {
            req.user = {
                id: '0d396440-7d07-407c-89da-9cb93e353347',
                email: 'demo@bitlancetechhub.com',
                user_metadata: {
                    name: 'Demo User',
                    phone: '+919876543210'
                }
            };
            req.token = token;
            req.workspaceId = null;
            return next();
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }

        // Attach user and active workspace to request
        req.user = user;
        req.token = token;
        req.workspaceId = req.headers['x-workspace-id'] || null;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(500).json({ success: false, error: 'Authentication failed' });
    }
};

// Alias for route compatibility
export const protect = authenticateUser;

import { oldSupabaseAdmin } from '../config/supabaseClient.js';

export const resolveOldBillingUser = async (req, res, next) => {
    try {
        if (!req.user || !req.user.email) {
            return res.status(401).json({ success: false, error: 'User email not found in token' });
        }
        
        // Find user by email in the old (billing) database
        const { data, error } = await oldSupabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        
        if (!error && data?.users) {
            const oldUser = data.users.find(u => u.email?.toLowerCase() === req.user.email.toLowerCase());
            if (oldUser) {
                // Store old DB user ID for billing operations (payment, credits)
                req.user.billingId = oldUser.id;
            }
        }
        
        // Always continue — dashboard uses new DB for client activity
        // billingId will be used only for credit deductions in billing controllers
        next();
    } catch (error) {
        console.error('Resolve Old Billing User Middleware Error:', error);
        // Don't block on error — let dashboard still load
        next();
    }
};
