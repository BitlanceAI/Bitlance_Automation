import React, { useState } from 'react';
import { X, Key, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
// import { toast } from 'react-hot-toast'; // Assuming it's available globally or passed

const API_BASE = import.meta.env.VITE_API_URL || '';

const MetaConnectModal = ({ isOpen, onClose, onSuccess, userToken }) => {
    const [method, setMethod] = useState('oauth'); // oauth, api-key
    const [formData, setFormData] = useState({ accessToken: '', appId: '', appSecret: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleOAuthConnect = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: window.location.origin + '/meta-ads-agent', // Redirects back to main agent page usually
                    scopes: 'pages_manage_posts,pages_read_engagement,pages_show_list,ads_management,ads_read,business_management,instagram_basic,instagram_content_publish'
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error('OAuth Error:', err);
            setError('Failed to start Facebook login');
            setLoading(false);
        }
    };

    const handleApiKeyConnect = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.accessToken) {
            setError('Access Token is required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/meta/connect-api-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                if (onSuccess) onSuccess(data);
                onClose();
            } else {
                setError(data.error || 'Connection failed');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-slate-700">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Connect Meta Account</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Method Selector */}
                    <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-lg mb-6">
                        <button
                            onClick={() => setMethod('oauth')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === 'oauth' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Facebook Login
                        </button>
                        <button
                            onClick={() => setMethod('api-key')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === 'api-key' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Manual API Key
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {method === 'oauth' ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe size={32} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 px-4">
                                Connect securely using your Facebook account. We'll request permission to manage pages and ads.
                            </p>
                            <button
                                onClick={handleOAuthConnect}
                                disabled={loading}
                                className="w-full py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Continue with Facebook'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleApiKeyConnect} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Token</label>
                                <input
                                    type="text"
                                    value={formData.accessToken}
                                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="EAAB..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App ID (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.appId}
                                    onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="123456..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App Secret (Optional)</label>
                                <input
                                    type="password"
                                    value={formData.appSecret}
                                    onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Connect Manually'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MetaConnectModal;
