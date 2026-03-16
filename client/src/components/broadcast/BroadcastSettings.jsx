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
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Config Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <Save className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">WhatsApp Configuration</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Configure your Meta WhatsApp Business API credentials.
                        </p>
                    </div>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 text-sm text-blue-700 dark:text-blue-300">
                    <p className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>
                            You need to provide your <strong>Phone Number ID</strong> and <strong>WhatsApp Business Account (WABA) ID</strong>.
                            These can be found in your <a href="https://business.facebook.com/wa/manage/home/" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-blue-800">Meta Business Suite</a> under WhatsApp &gt; API Setup.
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number ID
                        </label>
                        <input
                            type="text"
                            value={config.whatsappPhoneId}
                            onChange={(e) => setConfig({ ...config, whatsappPhoneId: e.target.value })}
                            placeholder="e.g. 744188362103708"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-400">The ID of the phone number sending messages (e.g. 744188362103708).</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            WhatsApp Business Account (WABA) ID
                        </label>
                        <input
                            type="text"
                            value={config.wabaId}
                            onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
                            placeholder="e.g. 1448154649644918"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-400">The ID of your WhatsApp Business Account (e.g. 1448154649644918).</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Configuration
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Test Send */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Message</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Send a test message and see the exact Meta API response.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleTestSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Recipient Phone (with country code)
                        </label>
                        <input
                            type="text"
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value)}
                            placeholder="e.g. +916398792951"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-green-500 transition-all font-mono text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Message
                        </label>
                        <input
                            type="text"
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            placeholder="Test message text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-green-500 transition-all text-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={testing || !config.whatsappPhoneId}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {testing ? <><Loader2 className="w-5 h-5 animate-spin" />Sending...</> : <><Send className="w-5 h-5" />Send Test</>}
                    </button>
                    {!config.whatsappPhoneId && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">Save your Phone Number ID above before testing.</p>
                    )}
                </form>

                {/* Test Result */}
                {testResult && (
                    <div className={`mt-4 p-4 rounded-xl border text-sm font-mono whitespace-pre-wrap break-all ${testResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                        }`}>
                        <div className="flex items-center gap-2 mb-2 font-sans font-semibold">
                            {testResult.success
                                ? <><CheckCircle2 className="w-4 h-4" /> Message sent successfully!</>
                                : <><XCircle className="w-4 h-4" /> Failed to send</>
                            }
                        </div>
                        {testResult.data?.hint && (
                            <p className="font-sans text-sm mb-2 font-medium">{testResult.data.hint}</p>
                        )}
                        {JSON.stringify(testResult.data, null, 2)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BroadcastSettings;


