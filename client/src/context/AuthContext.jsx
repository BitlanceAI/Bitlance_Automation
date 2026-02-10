import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [credits, setCredits] = useState(0);

    useEffect(() => {
        // Get session on mount
        const getSession = async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            if (currentSession?.user) {
                fetchCredits(currentSession.user.id);
            }
            setLoading(false);
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            if (currentSession?.user) {
                fetchCredits(currentSession.user.id);
            } else {
                setCredits(0);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchCredits = async (userId) => {
        try {
            // First try to fetch from our API (which might have stricter logic)
            // But since cookies/auth might not be perfectly set up for backend yet, 
            // we can fetch directly from Supabase for display purposes if RLS allows
            const { data, error } = await supabase
                .from('user_credits')
                .select('balance')
                .eq('user_id', userId)
                .single();

            if (data) {
                setCredits(data.balance);
            }
        } catch (error) {
            console.error('Error fetching credits:', error);
        }
    };

    // Helper to refresh credits manually (after spending)
    const refreshCredits = async () => {
        if (user) {
            await fetchCredits(user.id);
        }
    };

    const value = {
        user,
        session,
        loading,
        credits,
        refreshCredits,
        signUp: (data) => supabase.auth.signUp(data),
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
