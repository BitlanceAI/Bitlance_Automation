import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { Save, AlertCircle, Loader2, Send, CheckCircle2, XCircle } from 'lucide-react';
import toast from "react-hot-toast";
import axios from "axios";
import API_BASE_URL from '../../config';

const BroadcastSettings = () => {
    const { session } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        whatsappPhoneId: '',
        wabaId: ''
    });
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('Hello from Bitlance! 👋');
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        if (session) {
            fetchConfig();
        }
    }, [session]);

    const fetchConfig = async () => {
        try {
            const token = session?.access_token;
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/meta/connection`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.connected) {
                setConfig({
                    whatsappPhoneId: response.data.whatsappPhoneId || '',
                    wabaId: response.data.wabaId || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = session?.access_token;
            if (!token) {
                toast.error('You must be logged in to save settings');
                return;
            }

            await axios.post(`${API_BASE_URL}/api/whatsapp/config`, config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Configuration saved successfully!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleTestSend = async (e) => {
        e.preventDefault();
        setTesting(true);
        setTestResult(null);
        try {
            const token = session?.access_token;
            const response = await axios.post(`${API_BASE_URL}/api/whatsapp/test-send`,
                { to: testPhone, message: testMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTestResult({ success: true, data: response.data });
        } catch (error) {
            const errData = error.response?.data;
            setTestResult({ success: false, data: errData || { error: error.message } });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12 font-mono text-[#26cece] text-[10px] uppercase tracking-widest gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> LOADING CONFIG...
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Config Form */}
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] shadow-[0_2px_16px_0_rgba(0,0,0,0.4)] p-8">
                <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-[#333] pb-6">
                    <div className="p-3 bg-gray-100 dark:bg-[#070707] border border-[#26cece]">
                        <Save className="w-6 h-6 text-[#26cece]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-gray-900 dark:text-white uppercase tracking-widest">WhatsApp Configuration</h2>
                        <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mt-1">&gt; Configure Meta WhatsApp Business API credentials</p>
                    </div>
                </div>

                <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500 shadow-[2px_2px_0_0_#3b82f6] text-[10px] font-mono uppercase tracking-widest text-blue-500 dark:text-blue-400">
                    <p className="flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                        <span>
                            Provide your <strong className="text-blue-600 dark:text-blue-300">Phone Number ID</strong> and <strong className="text-blue-600 dark:text-blue-300">WhatsApp Business Account (WABA) ID</strong>.
                            Locate in{' '}
                            <a href="https://business.facebook.com/wa/manage/home/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#26cece] hover:text-gray-900 dark:hover:text-white transition-colors">Meta Business Suite &gt; WhatsApp &gt; API Setup</a>.
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2">
                            Phone Number ID
                        </label>
                        <input
                            type="text"
                            value={config.whatsappPhoneId}
                            onChange={(e) => setConfig({ ...config, whatsappPhoneId: e.target.value })}
                            placeholder="> e.g. 744188362103708"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none"
                            required
                        />
                        <p className="mt-2 text-[10px] font-mono tracking-widest uppercase text-gray-500">&gt; The ID of the registered phone number used for transmissions.</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2">
                            WABA ID (WhatsApp Business Account)
                        </label>
                        <input
                            type="text"
                            value={config.wabaId}
                            onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
                            placeholder="> e.g. 1448154649644918"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none"
                            required
                        />
                        <p className="mt-2 text-[10px] font-mono tracking-widest uppercase text-gray-500">&gt; The root ID of your WhatsApp Business Account.</p>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-[#333] flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-3 px-8 py-4 bg-[#26cece] text-[#070707] border border-[#070707] font-bold font-mono uppercase tracking-widest text-[10px] hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                        >
                            {saving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />WRITING CONFIG...</>
                            ) : (
                                <><Save className="w-4 h-4" />COMMIT CONFIG</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Test Send */}
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] shadow-[0_2px_16px_0_rgba(0,0,0,0.4)] p-8">
                <div className="flex items-center gap-4 mb-8 border-b border-gray-200 dark:border-[#333] pb-6">
                    <div className="p-3 bg-gray-100 dark:bg-[#070707] border border-[#26cece]">
                        <Send className="w-6 h-6 text-[#26cece]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-gray-900 dark:text-white uppercase tracking-widest">Transmission Test</h2>
                        <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mt-1">&gt; Fire a test signal and inspect Meta API response</p>
                    </div>
                </div>

                <form onSubmit={handleTestSend} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2">
                            Target Endpoint (with country code)
                        </label>
                        <input
                            type="text"
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value)}
                            placeholder="> e.g. +916398792951"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2">
                            Test Signal Payload
                        </label>
                        <input
                            type="text"
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            placeholder="> Test message text"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={testing || !config.whatsappPhoneId}
                        className="flex items-center gap-3 px-8 py-4 bg-gray-100 dark:bg-[#070707] text-[#26cece] border border-[#26cece] font-bold font-mono uppercase tracking-widest text-[10px] hover:bg-[#26cece] hover:text-[#070707] hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-[#070707] disabled:hover:text-[#26cece] disabled:hover:shadow-none disabled:hover:translate-y-0"
                    >
                        {testing ? <><Loader2 className="w-4 h-4 animate-spin" />TRANSMITTING...</> : <><Send className="w-4 h-4" />FIRE TEST SIGNAL</>}
                    </button>
                    {!config.whatsappPhoneId && (
                        <p className="text-[10px] font-mono tracking-widest uppercase text-yellow-600 dark:text-yellow-500">&gt; WARNING: COMMIT Phone Number ID CONFIG BEFORE TESTING.</p>
                    )}
                </form>

                {/* Test Result */}
                {testResult && (
                    <div className={`mt-6 p-5 border text-[10px] font-mono uppercase tracking-widest whitespace-pre-wrap break-all ${
                        testResult.success
                            ? 'bg-[#26cece]/10 border-[#26cece] shadow-[0_2px_16px_0_rgba(0,0,0,0.4)] text-[#26cece]'
                            : 'bg-red-500/10 border-red-500 shadow-[4px_4px_0_0_#ef4444] text-red-500 dark:text-red-400'
                    }`}>
                        <div className="flex items-center gap-3 mb-4 text-sm font-bold">
                            {testResult.success
                                ? <><CheckCircle2 className="w-5 h-5" /> TRANSMISSION SUCCESSFUL</>  
                                : <><XCircle className="w-5 h-5" /> SIGNAL FAILED</>  
                            }
                        </div>
                        {testResult.data?.hint && (
                            <p className="text-xs mb-4 font-bold normal-case tracking-normal text-gray-700 dark:text-gray-300">{testResult.data.hint}</p>
                        )}
                        {JSON.stringify(testResult.data, null, 2)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BroadcastSettings;


