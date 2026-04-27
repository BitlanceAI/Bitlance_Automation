import React, { useState } from 'react';
import { X, Key, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
// import { toast } from 'react-hot-toast'; // Assuming it's available globally or passed

import API_BASE_URL from '../../config';

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
                    redirectTo: window.location.origin + '/dashboard/agents/meta', // Redirects back to main agent page usually
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
            const response = await fetch(`${API_BASE_URL}/api/meta/connect-api-key`, {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
            <div className="bg-[#070707] border border-[#333] shadow-[0_4px_24px_0_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#333] bg-[#111111]">
                    <h3 className="text-xl md:text-2xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight border-l-4 border-[#26cece] pl-3">Network Authorization</h3>
                    <button onClick={onClose} className="p-2 border border-transparent hover:border-[#333] hover:text-red-500 hover:bg-red-500/10 text-gray-500 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 bg-[#070707]">
                    {/* Method Selector */}
                    <div className="flex gap-2 mb-8 bg-[#111111] p-1 border border-[#333]">
                        <button
                            onClick={() => setMethod('oauth')}
                            className={`flex-1 py-3 text-[10px] uppercase font-mono tracking-widest transition-all ${method === 'oauth' ? 'bg-[#26cece] text-[#070707] font-bold shadow-[2px_2px_0_0_#333] -translate-y-0.5' : 'bg-transparent text-gray-500 hover:text-white border border-transparent hover:border-[#333]'}`}
                        >
                            OAUTH Handshake
                        </button>
                        <button
                            onClick={() => setMethod('api-key')}
                            className={`flex-1 py-3 text-[10px] uppercase font-mono tracking-widest transition-all ${method === 'api-key' ? 'bg-[#26cece] text-[#070707] font-bold shadow-[2px_2px_0_0_#333] -translate-y-0.5' : 'bg-transparent text-gray-500 hover:text-white border border-transparent hover:border-[#333]'}`}
                        >
                            Manual Token
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 border border-red-500 bg-red-500/10 text-red-500 text-[10px] tracking-widest uppercase font-bold text-center">
                            ! {error}
                        </div>
                    )}

                    {method === 'oauth' ? (
                        <div className="text-center py-10 bg-[#111111] border border-dashed border-[#333]">
                            <div className="w-16 h-16 mx-auto mb-6 bg-[#1877F2]/10 border border-[#1877F2] flex items-center justify-center transform rotate-3">
                                <Globe size={32} className="text-[#1877F2]" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-8 max-w-xs mx-auto">
                                &gt; Secure redirection to Meta infrastructure for token exchange.
                            </p>
                            <button
                                onClick={handleOAuthConnect}
                                disabled={loading}
                                className="w-full py-4 bg-[#1877F2] text-white hover:bg-white hover:text-[#1877F2] border border-[#1877F2] font-bold font-['Space_Grotesk'] uppercase tracking-widest transition-all shadow-[4px_4px_0_0_#1877F2] hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:-translate-y-0"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Initialize OAuth'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleApiKeyConnect} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2">Access Token</label>
                                <input
                                    type="text"
                                    value={formData.accessToken}
                                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#333] bg-[#111111] text-white placeholder-gray-600 focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono"
                                    placeholder="EAAB..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2">App ID (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.appId}
                                    onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#333] bg-[#111111] text-white placeholder-gray-600 focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono"
                                    placeholder="123456..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2">App Secret (Optional)</label>
                                <input
                                    type="password"
                                    value={formData.appSecret}
                                    onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
                                    className="w-full px-4 py-3 border border-[#333] bg-[#111111] text-white placeholder-gray-600 focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-4 bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Execute Upload'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MetaConnectModal;
