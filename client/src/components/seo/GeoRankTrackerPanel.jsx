import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw, Search, CheckCircle, XCircle, BarChart2, Globe } from 'lucide-react';
import API_BASE_URL from '../../config.js';

export default function GeoRankTrackerPanel() {
    const { token } = useAuth();
    
    const [query, setQuery] = useState('');
    const [targetUrl, setTargetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleTrack = async () => {
        if (!query.trim() || !targetUrl.trim()) {
            setError('Please enter both a search query and a target URL');
            return;
        }
        
        setLoading(true);
        setError('');
        setResult(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/seo/geo-track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: query.trim(), target_url: targetUrl.trim() })
            });
            
            const data = await response.json();
            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Failed to track GEO rank');
            }
        } catch (err) {
            setError(err.message || 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 font-mono tracking-tight uppercase">
                        AI Engine GEO Tracker (Beta)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                        Powered by Perplexity · Checks if AI models cite your website as an authoritative source
                    </p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Target Keyword / Question</label>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="e.g. Best real estate CRMs in 2026"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#26cece] outline-none rounded-[2px] text-slate-900 font-mono text-[13px] placeholder-slate-400 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono tracking-widest uppercase text-slate-400">Your Domain / URL</label>
                        <input
                            type="text"
                            value={targetUrl}
                            onChange={e => setTargetUrl(e.target.value)}
                            placeholder="e.g. example.com"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-[#26cece] outline-none rounded-[2px] text-slate-900 font-mono text-[13px] placeholder-slate-400 transition-colors"
                        />
                    </div>
                </div>

                <button
                    onClick={handleTrack}
                    disabled={loading || !query.trim() || !targetUrl.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#26cece] hover:bg-[#1fb8b8] disabled:opacity-50 text-white text-xs font-bold font-mono tracking-widest uppercase rounded-[2px] transition-all hover:shadow-[4px_4px_0_0_#e2e8f0] disabled:hover:shadow-none disabled:hover:translate-y-0"
                >
                    <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Querying AI Engine...' : 'Check Share of Voice'}
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-600 font-mono">
                    ⚠️ {error}
                </div>
            )}

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-5 rounded-lg border flex flex-col items-center justify-center text-center shadow-sm ${result.is_cited ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                            <div className="p-3 bg-white rounded-full border shadow-sm mb-3">
                                {result.is_cited ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <XCircle className="w-8 h-8 text-slate-300" />}
                            </div>
                            <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Status</p>
                            <p className={`text-xl font-bold font-['Space_Grotesk'] mt-1 ${result.is_cited ? 'text-emerald-700' : 'text-slate-700'}`}>
                                {result.is_cited ? 'Cited!' : 'Not Cited'}
                            </p>
                        </div>

                        <div className="p-5 rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="p-3 bg-slate-50 rounded-full border border-slate-100 mb-3">
                                <BarChart2 className="w-8 h-8 text-[#26cece]" />
                            </div>
                            <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Share of Voice</p>
                            <p className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mt-1">
                                {result.share_of_voice_percent}%
                            </p>
                        </div>
                        
                        <div className="p-5 rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="p-3 bg-slate-50 rounded-full border border-slate-100 mb-3">
                                <Globe className="w-8 h-8 text-indigo-500" />
                            </div>
                            <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Total Competitor Citations</p>
                            <p className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 mt-1">
                                {result.citations?.length || 0}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-bold text-slate-900 font-['Space_Grotesk'] text-sm flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-[#26cece]" /> AI Engine Output Preview
                            </h3>
                        </div>
                        <div className="p-5 prose prose-sm max-w-none font-mono text-slate-600 prose-a:text-[#26cece]">
                            <p>{result.answer_preview}</p>
                        </div>
                    </div>

                    {result.citations && result.citations.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="p-4 bg-slate-50 border-b border-slate-200">
                                <h3 className="font-bold text-slate-900 font-['Space_Grotesk'] text-sm">All Citations Retrieved</h3>
                            </div>
                            <ul className="divide-y divide-slate-100 font-mono text-xs">
                                {result.citations.map((cit, idx) => {
                                    const isTarget = cit.toLowerCase().includes(result.target_url.toLowerCase().replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]);
                                    return (
                                        <li key={idx} className={`p-4 flex items-center gap-3 ${isTarget ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}`}>
                                            <span className="text-slate-400 font-bold">[{idx + 1}]</span>
                                            <a href={cit} target="_blank" rel="noopener noreferrer" className={`truncate transition-colors ${isTarget ? 'text-emerald-600 font-bold' : 'text-slate-600 hover:text-[#26cece]'}`}>
                                                {cit}
                                            </a>
                                            {isTarget && <span className="ml-auto bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Your Site</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
