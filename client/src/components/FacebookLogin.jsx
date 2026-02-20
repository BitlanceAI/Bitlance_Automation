import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

const FacebookLogin = () => {
    const [loading, setLoading] = useState(false);

    const handleFacebookLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: window.location.origin,
                    scopes: 'email,public_profile'
                }
            });
            if (error) throw error;
            // Supabase will redirect to Facebook — no further action needed here
        } catch (error) {
            console.error('Facebook login error:', error);
            toast.error(error.message || 'Failed to sign in with Facebook');
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center mt-4">
            <button
                onClick={handleFacebookLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium text-sm transition-colors disabled:opacity-50"
            >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                )}
                {loading ? 'Redirecting...' : 'Continue with Facebook'}
            </button>
        </div>
    );
};

export default FacebookLogin;
