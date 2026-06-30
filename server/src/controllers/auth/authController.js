import { supabase, supabaseAdmin, oldSupabaseAdmin } from '../../config/supabaseClient.js';
import { sendSignupWelcomeEmail } from '../../services/email/welcomeEmailService.js';



/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error);
            let errorMessage = error.message || 'Invalid credentials';
            
            if (errorMessage.toLowerCase().includes('invalid login credentials') || errorMessage.toLowerCase().includes('invalid credentials')) {
                try {
                    if (supabaseAdmin) {
                        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
                            page: 1,
                            perPage: 1000
                        });
                        if (!listError && listData?.users) {
                            const userExists = listData.users.some(u => u.email?.toLowerCase() === email.toLowerCase());
                            if (!userExists) {
                                errorMessage = "User does not exist. Please sign up.";
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error checking user existence:', err);
                }
            }

            return res.status(401).json({
                success: false,
                error: errorMessage
            });
        }

        res.json({
            success: true,
            token: data.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                role: data.user.user_metadata?.role || 'user'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
};

/**
 * Signup new user
 * POST /api/auth/signup
 */
export const signup = async (req, res) => {
    try {
        const { email, password, name, mobile } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Generate the signup verification link using supabaseAdmin (points to NEW DB for Voice Dashboard)
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email,
            password,
            options: {
                data: {
                    name: name || email.split('@')[0],
                    phone: mobile,
                    role: 'user'
                },
                redirectTo: 'https://lotlite.bitlancetechhub.com/'
            }
        });

        if (error) {
            console.error('Signup error:', error);
            return res.status(400).json({
                success: false,
                error: error.message || 'Signup failed'
            });
        }

        // Create corresponding user and credits record in the OLD database
        if (data.user) {
            try {
                // 1. Create user in the OLD database's auth.users
                const { data: oldUser, error: oldUserError } = await oldSupabaseAdmin.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true,
                    user_metadata: {
                        name: name || email.split('@')[0],
                        phone: mobile,
                        role: 'user'
                    }
                });

                let oldUserId = oldUser?.user?.id;
                if (!oldUserId) {
                    // Fetch existing user in old database by email if they already existed
                    const { data: listData } = await oldSupabaseAdmin.auth.admin.listUsers({
                        page: 1,
                        perPage: 1000
                    });
                    const existingOldUser = listData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
                    if (existingOldUser) {
                        oldUserId = existingOldUser.id;
                    }
                }

                if (oldUserId) {
                    // 2. Create user credits record in the OLD database
                    const { error: creditsError } = await oldSupabaseAdmin
                        .from('user_credits')
                        .upsert({
                            user_id: oldUserId,
                            balance: 10, // Initial credits
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id' });

                    if (creditsError) {
                        console.error('Failed to create credits record in old DB:', creditsError);
                    }
                }
            } catch (err) {
                console.error('Old DB user/credits sync error:', err);
            }

            // Send styled welcome verification email asynchronously with the dynamic verification link
            const verificationLink = data.properties?.action_link;
            sendSignupWelcomeEmail(data.user, name, verificationLink).catch(err => {
                console.error('[WelcomeEmail] Error calling sendSignupWelcomeEmail:', err.message);
            });
        }

        res.json({
            success: true,
            message: 'Signup successful. Please check your email to verify your account.',
            token: data.session?.access_token,
            user: {
                id: data.user.id,
                email: data.user.email
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Signup failed'
        });
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
    try {
        // User is already attached by authMiddleware
        const userId = req.user.id;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user'
        });
    }
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid refresh token'
            });
        }

        res.json({
            success: true,
            token: data.session.access_token,
            refresh_token: data.session.refresh_token
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh token'
        });
    }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Verify if user exists in Supabase to prevent resends for non-existent users
        let targetUser = null;
        try {
            if (supabaseAdmin) {
                const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
                    page: 1,
                    perPage: 1000
                });
                if (!listError && listData?.users) {
                    targetUser = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
                    if (!targetUser) {
                        return res.status(404).json({
                            success: false,
                            error: 'cant resend .. please sign up first'
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error checking user existence before resend:', err);
        }

        // Generate verification link using magiclink type on new DB (doesn't throw email_exists)
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
                redirectTo: 'https://lotlite.bitlancetechhub.com/'
            }
        });

        if (error || !data) {
            console.error('Resend verification error:', error);
            return res.status(400).json({
                success: false,
                error: error?.message || 'Failed to resend verification email'
            });
        }

        // Send styled welcome verification email asynchronously with the dynamic verification link
        const verificationLink = data.properties?.action_link;
        const name = targetUser?.user_metadata?.name || email.split('@')[0];
        
        sendSignupWelcomeEmail(targetUser || { email }, name, verificationLink).catch(err => {
            console.error('[WelcomeEmail] Error calling sendSignupWelcomeEmail during resend:', err.message);
        });

        res.json({
            success: true,
            message: 'Verification email resent successfully. Please check your inbox.'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resend verification email'
        });
    }
};
