import React, { useState, useEffect } from 'react';
import { Sparkles, Palette, Zap, Clock, Loader2, CheckCircle2, XCircle, ImageIcon, Eye, Download, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config';
import { supabase } from '../../services/supabaseClient';

const GraphicsAIView = () => {
    const { user, credits, isAdmin, refreshCredits } = useAuth();
    const [promptText, setPromptText] = useState('');
    const [imageSize, setImageSize] = useState('1024x1024');
    const [imageQuality, setImageQuality] = useState('low');
    const [language, setLanguage] = useState('english');
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [previewJob, setPreviewJob] = useState(null);
    const [activeTab, setActiveTab] = useState('create');
    const [filter, setFilter] = useState('all');
    const COST = 5;

    const getToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    };

    const fetchJobs = async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/design/jobs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data.jobs || []);
            }
        } catch { /* non-critical */ }
    };

    useEffect(() => {
        fetchJobs();
        const iv = setInterval(fetchJobs, 30000);
        return () => clearInterval(iv);
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchJobs();
        await refreshCredits();
        setTimeout(() => setRefreshing(false), 600);
    };

    const forceDownload = async (url, filename) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl; a.download = filename || 'design.png';
            document.body.appendChild(a); a.click();
            document.body.removeChild(a); window.URL.revokeObjectURL(blobUrl);
        } catch { window.open(url, '_blank'); }
    };

    const handleGenerate = async () => {
        if (!promptText.trim()) return;
        if (credits < COST && !isAdmin) {
            alert(`You need ${COST} credits to generate an image.`);
            return;
        }
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/design/generate-from-prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ prompt: promptText, image_size: imageSize, image_quality: imageQuality, language })
            });
            const data = await res.json();
            if (res.ok) {
                setPromptText('');
                setActiveTab('history');
                refreshCredits();
                fetchJobs();
            } else {
                alert(data.error || 'Failed to generate image');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => ({
        pending:    { icon: Clock,         color: 'text-amber-500',   bg: 'bg-amber-500/10',   label: 'Pending' },
        processing: { icon: Loader2,       color: 'text-blue-500',    bg: 'bg-blue-500/10',    label: 'Processing', animate: true },
        completed:  { icon: CheckCircle2,  color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Completed' },
        failed:     { icon: XCircle,       color: 'text-red-500',     bg: 'bg-red-500/10',     label: 'Failed' },
    }[status] || { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10', label: status });

    const filtered = jobs.filter(j => filter === 'all' || j.status === filter);

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden" style={{ color: 'black' }}>
            {/* Header */}
            <div className="shrink-0 px-8 pt-8 pb-4 border-b border-slate-200 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#26cece]/10 border border-[#26cece]/30">
                    <Palette className="w-6 h-6 text-[#26cece]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-['Space_Grotesk'] text-slate-900 uppercase tracking-tight">Graphics AI Agent</h2>
                    <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Generate hyper-realistic visuals from a prompt</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-[2px]">
                    <Zap className="w-3.5 h-3.5 text-[#26cece]" />
                    <span className="font-mono text-[12px] text-slate-900">{credits?.toLocaleString() || 0} <span className="text-gray-500">cr</span></span>
                </div>
            </div>

            {/* Tabs */}
            <div className="shrink-0 flex gap-0 border-b border-slate-200 px-8">
                {['create', 'history'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        className={`px-5 py-3 font-mono text-[12px] uppercase tracking-widest border-b-2 transition-colors ${
                            activeTab === t
                                ? 'border-[#26cece] text-[#26cece]'
                                : 'border-transparent text-gray-500 hover:text-slate-900'
                        }`}>
                        {t === 'create' ? 'Create' : `Gallery (${jobs.length})`}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {activeTab === 'create' ? (
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Prompt */}
                        <div className="bg-slate-50 border border-slate-200 rounded-[2px] p-6 space-y-4 shadow-[0_2px_16px_0_rgba(0,0,0,0.4)]">
                            <h3 className="text-[13px] font-mono uppercase tracking-widest text-[#26cece] flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Custom Design Prompt
                            </h3>
                            <textarea
                                value={promptText}
                                onChange={e => setPromptText(e.target.value)}
                                placeholder="Describe your concept in detail — e.g. A hyper-realistic 8K luxury beachfront villa at sunset with infinity pool..."
                                rows={7}
                                className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-gray-600 rounded-[2px] p-4 text-[14px] font-sans focus:outline-none focus:border-[#26cece] transition-colors resize-none"
                            />
                            {/* Settings row */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Dimensions</label>
                                    <select value={imageSize} onChange={e => setImageSize(e.target.value)}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-[2px] px-3 py-2.5 text-[13px] font-mono focus:outline-none focus:border-[#26cece] transition-colors">
                                        <option value="512x512">512 × 512</option>
                                        <option value="1024x1024">1024 × 1024</option>
                                        <option value="1536x1024">1536 × 1024</option>
                                        <option value="1024x1536">1024 × 1536</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Quality</label>
                                    <select value={imageQuality} onChange={e => setImageQuality(e.target.value)}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-[2px] px-3 py-2.5 text-[13px] font-mono focus:outline-none focus:border-[#26cece] transition-colors">
                                        <option value="low">Low (Fast)</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High (Detailed)</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Language</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-[2px] px-3 py-2.5 text-[13px] font-mono focus:outline-none focus:border-[#26cece] transition-colors">
                                        <option value="english">English</option>
                                        <option value="hindi_marathi">Hindi + Marathi</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !promptText.trim() || (credits < COST && !isAdmin)}
                                className="w-full flex items-center justify-center gap-2 bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest py-3.5 rounded-[2px] hover:bg-white hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#333] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Generate Image ({COST} cr)</>
                                )}
                            </button>
                        </div>
                        <p className="text-[11px] font-mono text-gray-600 text-center">Image generation is processed asynchronously. Check the Gallery tab for results.</p>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Filters + refresh */}
                        <div className="flex flex-wrap items-center gap-3">
                            {['all', 'completed', 'processing', 'pending', 'failed'].map(s => (
                                <button key={s} onClick={() => setFilter(s)}
                                    className={`px-4 py-2 rounded-[2px] font-mono text-[11px] uppercase tracking-widest border transition-all ${
                                        filter === s
                                            ? 'bg-[#26cece] text-[#070707] border-[#26cece]'
                                            : 'bg-slate-50 border-slate-200 text-gray-400 hover:text-slate-900 hover:border-[#555]'
                                    }`}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                            <button onClick={handleRefresh} className="ml-auto p-2.5 bg-slate-50 border border-slate-200 rounded-[2px] text-gray-400 hover:text-[#26cece] hover:border-[#26cece] transition-colors">
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#26cece]' : ''}`} />
                            </button>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-slate-50 border border-slate-200 rounded-[2px]">
                                <ImageIcon className="w-12 h-12 text-[#26cece]/30 mb-4" />
                                <p className="font-mono text-gray-500 uppercase tracking-widest text-[12px]">No images yet. Create one above.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filtered.flatMap(job => {
                                    const cfg = getStatusConfig(job.status);
                                    const StatusIcon = cfg.icon;
                                    if (job.status !== 'completed' || (!job.flyer_url && !job.metadata?.flyer_urls)) {
                                        return [(
                                            <div key={job.id} className="bg-slate-50 border border-slate-200 rounded-[2px] overflow-hidden">
                                                <div className="aspect-[4/3] flex flex-col items-center justify-center bg-white">
                                                    <StatusIcon className={`w-10 h-10 mb-2 ${cfg.color} ${cfg.animate ? 'animate-spin' : ''}`} />
                                                    <span className={`font-mono text-[11px] uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                                                </div>
                                                <div className="p-4 border-t border-slate-200">
                                                    <p className="font-mono text-[12px] text-gray-400 line-clamp-2">{job.prompt || job.property_type || 'Custom Design'}</p>
                                                    <p className="font-mono text-[10px] text-gray-600 mt-1 uppercase tracking-widest">{new Date(job.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        )];
                                    }
                                    const urls = job.metadata?.flyer_urls || [job.flyer_url];
                                    return urls.map((url, idx) => (
                                        <div key={`${job.id}-${idx}`} className="group bg-slate-50 border border-slate-200 rounded-[2px] overflow-hidden hover:border-[#26cece] hover:shadow-[0_2px_16px_0_rgba(0,0,0,0.4)] transition-all duration-300">
                                            <div className="relative aspect-[4/3] bg-white overflow-hidden">
                                                <img src={url} alt="Generated" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                    <button onClick={() => setPreviewJob({ ...job, _previewUrl: url })}
                                                        className="flex-1 bg-white/20 backdrop-blur-md text-slate-900 py-2 rounded-[2px] text-[11px] font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-white/30 transition-colors">
                                                        <Eye className="w-3.5 h-3.5" /> View
                                                    </button>
                                                    <button onClick={() => forceDownload(url, `design_${idx + 1}.png`)}
                                                        className="flex-1 bg-[#26cece] text-[#070707] py-2 rounded-[2px] text-[11px] font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-white transition-colors">
                                                        <Download className="w-3.5 h-3.5" /> Save
                                                    </button>
                                                </div>
                                                {urls.length > 1 && (
                                                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-[2px] font-mono text-[10px] text-slate-900 uppercase tracking-widest">Var {idx + 1}</div>
                                                )}
                                            </div>
                                            <div className="p-4 border-t border-slate-200">
                                                <p className="font-mono text-[12px] text-gray-300 line-clamp-2">{job.prompt || job.property_type || 'Custom Design'}</p>
                                                <p className="font-mono text-[10px] text-gray-600 mt-1 uppercase tracking-widest">{new Date(job.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ));
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewJob && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4" onClick={() => setPreviewJob(null)}>
                    <div className="relative max-w-4xl w-full bg-slate-50 border border-slate-200 rounded-[2px] shadow-[0_4px_24px_0_rgba(0,0,0,0.5)] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h3 className="font-bold font-['Space_Grotesk'] text-slate-900 uppercase tracking-tight">Preview</h3>
                            <button onClick={() => setPreviewJob(null)} className="p-2 text-gray-400 hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-[2px] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 bg-black/40 flex flex-col items-center gap-5">
                            <img src={previewJob._previewUrl} alt="Preview" className="max-h-[65vh] w-full object-contain rounded-[2px] ring-1 ring-white/10" />
                            <button onClick={() => forceDownload(previewJob._previewUrl, 'design.png')}
                                className="flex items-center gap-2 bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest px-8 py-3 rounded-[2px] hover:bg-white transition-colors">
                                <Download className="w-4 h-4" /> Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GraphicsAIView;
