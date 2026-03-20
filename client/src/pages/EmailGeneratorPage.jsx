import React, { useState } from 'react';
import { Mail, Sparkles, Send, Loader2, Copy, Check } from 'lucide-react';
import SEOHead from '../components/layout/SEOHead';
import API_BASE_URL from '../config';
import toast from 'react-hot-toast';

const EmailGeneratorPage = () => {
    const [formData, setFormData] = useState({
        purpose: '',
        recipient: '',
        tone: 'Professional',
        details: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [copied, setCopied] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!formData.purpose.trim() || !formData.recipient.trim()) {
            toast.error('Please enter purpose and recipient');
            return;
        }

        setLoading(true);
        setResult('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/gemini/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setResult(data.text);
                toast.success('Email generated successfully!');
            } else {
                toast.error(data.error || 'Failed to generate email');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <SEOHead canonicalUrl="https://www.bitlancetechhub.com/email-generator" title="AI Email Generator" description="Draft professional emails in seconds with our AI Email Generator." />
            
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex justify-center items-center p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 mb-6 mt-4">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                        AI Email Generator
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Draft perfect, professional emails for sales, outreach, or follow-ups in seconds.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-100/20 dark:shadow-none overflow-hidden border border-gray-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Form Section */}
                        <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                            <form onSubmit={handleGenerate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Goal / Purpose <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="purpose"
                                        value={formData.purpose}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Schedule a demo meeting"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            name="recipient"
                                            value={formData.recipient}
                                            onChange={handleInputChange}
                                            placeholder="e.g. A busy CEO"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tone</label>
                                        <select
                                            name="tone"
                                            value={formData.tone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Professional & Polite">Professional & Polite</option>
                                            <option value="Friendly & Casual">Friendly & Casual</option>
                                            <option value="Direct & Urgent">Direct & Urgent</option>
                                            <option value="Persuasive">Persuasive (Sales)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Details (Optional)</label>
                                    <textarea
                                        name="details"
                                        value={formData.details}
                                        onChange={handleInputChange}
                                        placeholder="Specific points to mention, company names, etc..."
                                        className="w-full h-24 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    {loading ? 'Drafting Email...' : 'Generate Email'}
                                </button>
                            </form>
                        </div>

                        {/* Result Section */}
                        <div className="p-8 flex flex-col bg-white dark:bg-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Send className="w-5 h-5 text-blue-500" />
                                    Email Draft
                                </h3>
                                {result && (
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                )}
                            </div>
                            
                            <div className={`flex-1 min-h-[300px] p-5 rounded-2xl border ${result ? 'border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10' : 'border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-center'}`}>
                                {loading ? (
                                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
                                        <p>Writing perfect email...</p>
                                    </div>
                                ) : result ? (
                                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                        {result}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 text-center">
                                        Your crafted email will appear here. Fill out the form to get started!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailGeneratorPage;
