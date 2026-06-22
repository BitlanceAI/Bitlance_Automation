import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config.js';
import { toast } from 'react-hot-toast';
import { Key, Copy, Check, Eye, EyeOff, ArrowLeft, Zap, Clock, ShieldCheck } from 'lucide-react';

const UserApiKeys = () => {
    const navigate = useNavigate();
    const { user, credits, token } = useAuth();
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);
    const [visibleKeys, setVisibleKeys] = useState({});

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            // Use token from useAuth
            const response = await fetch(`${API_BASE_URL}/api/user/api-keys`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch keys');
            const data = await response.json();
            setKeys(data.keys);
        } catch (error) {
            console.error(error);
            toast.error('Could not load API keys.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success("API Key copied to clipboard!");
        setTimeout(() => setCopied(null), 2000);
    };

    const toggleVisibility = (id) => {
        setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <Key className="text-indigo-600 dark:text-indigo-400" size={22} />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">API Keys & Integration</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-6 space-y-6">
                
                {/* Credits Overview Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Your Integration Hub</h2>
                        <p className="text-indigo-100 text-sm">
                            Use these keys to authenticate with the Bitlance AI API.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[200px]">
                        <div className="flex items-center gap-2 text-indigo-100 mb-1">
                            <Zap size={16} />
                            <span className="text-sm font-medium">Live Credit Balance</span>
                        </div>
                        <div className="text-3xl font-extrabold tracking-tight">
                            {credits !== null ? credits.toLocaleString() : '...'} <span className="text-lg font-medium opacity-80">CR</span>
                        </div>
                    </div>
                </div>

                {/* API Keys Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
                        <ShieldCheck className="text-teal-500" size={24} />
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active API Keys</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Keys currently provisioned for your account by administrators.</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Secret Key</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan Tier</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Used</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex justify-center mb-2">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
                                            </div>
                                            Loading keys...
                                        </td>
                                    </tr>
                                ) : keys.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                            No API keys have been assigned to your account yet. <br />
                                            Please contact support or your administrator to provision a key.
                                        </td>
                                    </tr>
                                ) : (
                                    keys.map((k) => (
                                        <tr key={k.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="font-mono text-sm bg-gray-100 dark:bg-slate-900 px-3 py-1.5 rounded-md border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 flex-1 min-w-[280px]">
                                                        {visibleKeys[k.id] ? k.api_key : `sk_live_...${k.api_key.slice(-6)}`}
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleVisibility(k.id)}
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
                                                        title="Toggle visibility"
                                                    >
                                                        {visibleKeys[k.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => copyToClipboard(k.api_key, k.id)}
                                                        className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md"
                                                        title="Copy full key"
                                                    >
                                                        {copied === k.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="capitalize font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-full text-xs">
                                                    {k.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    k.status === 'active' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${k.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {k.status.charAt(0).toUpperCase() + k.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                {k.last_used_at ? (
                                                    <>
                                                        <Clock size={14} />
                                                        {new Date(k.last_used_at).toLocaleDateString()}
                                                    </>
                                                ) : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(k.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default UserApiKeys;
