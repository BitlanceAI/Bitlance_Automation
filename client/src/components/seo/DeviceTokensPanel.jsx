import React, { useState, useEffect } from 'react';
import { Trash2, Copy, Smartphone, RefreshCw, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const DeviceTokensPanel = () => {
    const { token } = useAuth();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quickToken, setQuickToken] = useState('');

    const fetchTokens = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/push/tokens`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setTokens(res.data.tokens);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load tokens');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTokens(); }, []);

    const handleToggle = async (id, currentStatus) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/push/tokens/${id}`,
                { isActive: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Status updated');
            fetchTokens();
        } catch (error) { toast.error('Failed to update status'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/push/tokens/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Token deleted');
            fetchTokens();
        } catch (error) { toast.error('Failed to delete token'); }
    };

    const handleQuickRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/push/tokens/register`, {
                token: quickToken, platform: 'manual', deviceId: 'manual-entry'
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Token added successfully');
            setQuickToken('');
            fetchTokens();
        } catch (error) { toast.error('Failed to register token'); }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="space-y-6">
            {/* Quick Register */}
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" /> Quick Add Token
                </h2>
                <form onSubmit={handleQuickRegister} className="flex gap-4">
                    <input type="text" className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        placeholder="Paste FCM Token here..." value={quickToken} onChange={(e) => setQuickToken(e.target.value)} required />
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Add</button>
                </form>
            </div>

            {/* Tokens List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-gray-500" /> Registered Devices ({tokens.length})
                    </h2>
                    <button onClick={fetchTokens} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                        <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Token</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Platform</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {tokens.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500">No tokens found. Register one from the mobile app or use Quick Add.</td></tr>
                            ) : (
                                tokens.map((t) => (
                                    <tr key={t.id || t.token} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="font-mono text-xs text-gray-600 dark:text-gray-300 max-w-[200px] truncate" title={t.token}>{t.token}</div>
                                                <button onClick={() => copyToClipboard(t.token)} className="text-gray-400 hover:text-indigo-600"><Copy className="w-3 h-3" /></button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.platform === 'ios' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' : t.platform === 'android' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>{t.platform}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleToggle(t.id || t.token, t.isActive)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${t.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'}`}>
                                                {t.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(t.id || t.token)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DeviceTokensPanel;
