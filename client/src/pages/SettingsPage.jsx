import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Settings as SettingsIcon,
    CheckCircle,
    ArrowLeft,
    Chrome,
    Unlink,
} from 'lucide-react';
import API_BASE_URL from '../config.js';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.id;

    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        checkConnection();
    }, [userId]);

    const checkConnection = async () => {
        try {
            // Check if the user has google_oauth_tokens (i.e. connected via Google)
            const res = await fetch(`${API_BASE_URL}/api/google-sheets/status`, {
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            });
            const json = await res.json();
            setConnected(json.connected === true);
        } catch {
            setConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/google-sheets/auth-url?userId=${userId}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server error ${res.status}: ${text}`);
            }
            const json = await res.json();
            if (json.url) {
                window.location.href = json.url;
            } else {
                throw new Error('No URL returned from server');
            }
        } catch (e) {
            console.error('Google sign-in error:', e);
            alert(`Failed to start Google sign-in: ${e.message}`);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Disconnect your Google account? The Rank Tracker and Google Sheets features will stop working.')) return;
        try {
            await fetch(`${API_BASE_URL}/api/google-sheets/disconnect`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user?.access_token}` }
            });
            setConnected(false);
        } catch {
            alert('Failed to disconnect. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="flex items-center gap-2">
                        <SettingsIcon className="text-indigo-600 dark:text-indigo-400" size={22} />
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Chrome size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Google Account</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Required for Rank Tracker &amp; Google Sheets
                                </p>
                            </div>
                        </div>
                        {!loading && connected && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 px-2.5 py-1 rounded-full">
                                <CheckCircle size={12} /> Connected
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
                            Checking connection...
                        </div>
                    ) : connected ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your Google account is connected. The Rank Tracker and Google Sheets integration are active.
                            </p>
                            <button
                                onClick={handleDisconnect}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                                <Unlink size={14} />
                                Disconnect Google Account
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Connect your Google account to enable the Rank Tracker (Google Search Console) and Google Sheets integration.
                            </p>
                            <button
                                onClick={handleConnect}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
                            >
                                <img
                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    className="w-4 h-4"
                                    alt="Google"
                                />
                                Connect with Google
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
