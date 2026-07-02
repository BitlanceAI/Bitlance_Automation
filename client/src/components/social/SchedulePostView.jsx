import React, { useState, useEffect } from 'react';
import {
    Sparkles, TrendingUp, Loader2, CheckCircle2, XCircle,
    Send, Linkedin, Facebook, Instagram, Copy, Check, RefreshCw,
    Zap, Clock, ChevronDown, ChevronUp, ImageIcon, X, MessageSquare, Edit2
} from 'lucide-react';
import API_BASE_URL from '../../config.js';
import { supabase } from '../../services/supabaseClient';
import { useWorkspace } from '../../context/WorkspaceContext';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const PLATFORMS = [
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2', maxChars: 3000 },
    { id: 'twitter', label: 'X (Twitter)', icon: XIcon, color: '#000', maxChars: 280 },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2', maxChars: 500 },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F', maxChars: 2200 },
];

const TONES = [
    { id: 'professional', label: 'Professional', emoji: '💼' },
    { id: 'casual', label: 'Casual', emoji: '😎' },
    { id: 'inspiring', label: 'Inspiring', emoji: '✨' },
    { id: 'witty', label: 'Witty', emoji: '🎯' },
];

const LANGUAGES = [
    { id: 'English', label: 'English' },
    { id: 'Hindi', label: 'Hindi (हिंदी)' },
    { id: 'Bengali', label: 'Bengali (বাংলা)' },
    { id: 'Telugu', label: 'Telugu (తెలుగు)' },
    { id: 'Marathi', label: 'Marathi (मराठी)' },
    { id: 'Tamil', label: 'Tamil (தமிழ்)' },
    { id: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
    { id: 'Urdu', label: 'Urdu (اردو)' },
    { id: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { id: 'Odia', label: 'Odia (ଓଡ଼ିଆ)' },
    { id: 'Malayalam', label: 'Malayalam (മലയാളം)' },
    { id: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { id: 'Assamese', label: 'Assamese (অসমীয়া)' }
];

const STEPS = [
    { id: 1, label: 'Configure', icon: Zap },
    { id: 2, label: 'Generating', icon: Loader2 },
    { id: 3, label: 'Review & Post', icon: Send },
];

const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
};

const SchedulePostView = ({ 
    connectedProfiles = [], 
    setPostText, 
    setMediaAttachment, 
    setIsPreviewOpen, 
    setPostTargets, 
    setPreviewStep,
    postSuccessCount = 0,
    setIsScheduling
}) => {
    const { workspaceHeaders } = useWorkspace();

    // View state: 'pipeline' or 'history'
    const [activeTab, setActiveTab] = useState('create');
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [scheduledPosts, setScheduledPosts] = useState([]);
    const [loadingScheduled, setLoadingScheduled] = useState(false);
    
    // Edit Time State
    const [editingTimeId, setEditingTimeId] = useState(null);
    const [editTimeValue, setEditTimeValue] = useState('');
    const [isUpdatingTime, setIsUpdatingTime] = useState(false);

    // Step 1: Config
    const [category, setCategory] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin']);
    const [tone, setTone] = useState('professional');
    const [language, setLanguage] = useState('English');
    const [extraInstructions, setExtraInstructions] = useState('');

    // Pipeline state
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pipelineStatus, setPipelineStatus] = useState('');

    // Results
    const [result, setResult] = useState(null);
    const [editedCaptions, setEditedCaptions] = useState({});
    const [copiedPlatform, setCopiedPlatform] = useState(null);
    const [expandedCaption, setExpandedCaption] = useState(null);
    const [justPosted, setJustPosted] = useState(false);

    useEffect(() => {
        if (postSuccessCount > 0) {
            setJustPosted(true);
            setTimeout(() => setJustPosted(false), 5000);
            
            // Reset state
            setStep(1);
            setResult(null);
            setPipelineStatus('');
            setCategory('');
            setExtraInstructions('');
            
            // Switch to history to show the new post
            setActiveTab('history');
            fetchHistory();
        }
    }, [postSuccessCount]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/design/jobs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...workspaceHeaders,
                }
            });
            const data = await res.json();
            // Filter only social posts
            const socialPosts = (data.jobs || []).filter(j => j.property_type === 'Social Post');
            setHistory(socialPosts);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchScheduledPosts = async () => {
        setLoadingScheduled(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/social/schedule`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...workspaceHeaders,
                }
            });
            const data = await res.json();
            if (data.success) {
                const posts = (data.data || []).map(p => ({ ...p, id: p._id || p.id }));
                setScheduledPosts(posts);
            }
        } catch (err) {
            console.error("Failed to fetch scheduled posts:", err);
        } finally {
            setLoadingScheduled(false);
        }
    };

    const handleUpdateScheduledTime = async (id) => {
        if (!editTimeValue) return;
        setIsUpdatingTime(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/social/schedule/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json', 
                    ...workspaceHeaders 
                },
                body: JSON.stringify({ 
                    scheduledAt: new Date(editTimeValue).toISOString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                })
            });
            const data = await res.json();
            if (data.success) {
                setEditingTimeId(null);
                fetchScheduledPosts();
            } else {
                alert(data.message || 'Failed to update time');
            }
        } catch (err) {
            console.error('Failed to update scheduled time:', err);
        } finally {
            setIsUpdatingTime(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSelectFromHistory = (item) => {
        setResult({
            category: item.location,
            trending_keywords: item.metadata?.trending_keywords || [],
            captions: item.metadata?.captions || {},
            image_url: item.flyer_url,
            // Since we don't have the original base64 in history (we have URL), 
            // handlePrepareForPost needs to be updated to handle URL too
        });
        setEditedCaptions(item.metadata?.captions || {});
        setStep(3);
        setActiveTab('create');
    };

    // Helper to convert base64 to File
    const base64ToFile = (base64String, fileName) => {
        try {
            const arr = base64String.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], fileName, { type: mime });
        } catch (e) {
            console.error("Base64 conversion error:", e);
            return null;
        }
    };

    // Helper to convert URL to File
    const urlToFile = async (url, fileName) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new File([blob], fileName, { type: blob.type });
        } catch (e) {
            console.error("URL to File conversion error:", e);
            return null;
        }
    };

    const handlePrepareForPost = async () => {
        if (!result) return;

        // 1. Pick the primary caption (first available)
        const firstPlatform = Object.keys(editedCaptions)[0];
        const finalCaption = editedCaptions[firstPlatform] || '';
        setPostText(finalCaption);

        // 2. Handle Image
        if (result.image_base64) {
            const file = base64ToFile(`data:image/png;base64,${result.image_base64}`, `ai_post_${Date.now()}.png`);
            if (file) {
                setMediaAttachment({
                    file,
                    mediaCategory: 'IMAGE',
                    preview: `data:image/png;base64,${result.image_base64}`
                });
            }
        } else if (result.image_url) {
            const file = await urlToFile(result.image_url, `ai_post_${Date.now()}.png`);
            if (file) {
                setMediaAttachment({
                    file,
                    mediaCategory: 'IMAGE',
                    preview: result.image_url
                });
            }
        }

        // 3. Set Targets (find matching profiles for selected platforms)
        const targets = connectedProfiles.filter(p => selectedPlatforms.includes(p.platform));
        setPostTargets(targets);

        // 4. Open Modal & Enable Scheduling
        if (setIsScheduling) setIsScheduling(true);
        setPreviewStep(1);
        setIsPreviewOpen(true);
    };

    const togglePlatform = (id) => {
        setSelectedPlatforms(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleGenerate = async () => {
        if (!category.trim() || selectedPlatforms.length === 0) return;
        setStep(2);
        setLoading(true);
        setError(null);
        setPipelineStatus('Fetching trending keywords...');

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            setPipelineStatus('Generating captions & graphic...');

            const res = await fetch(`${API_BASE_URL}/api/design/generate-social-post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...workspaceHeaders,
                },
                body: JSON.stringify({
                    category: category.trim(),
                    platforms: selectedPlatforms,
                    tone,
                    language,
                    extra_instructions: extraInstructions.trim(),
                    image_quality: 'low',
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Server error ${res.status}`);
            }

            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Generation failed');

            setResult(data);
            setEditedCaptions(data.captions || {});
            setStep(3);
        } catch (err) {
            setError(err.message);
            setStep(1);
        } finally {
            setLoading(false);
            setPipelineStatus('');
        }
    };

    const handleCopy = async (platform) => {
        const text = editedCaptions[platform] || '';
        await navigator.clipboard.writeText(text);
        setCopiedPlatform(platform);
        setTimeout(() => setCopiedPlatform(null), 2000);
    };

    const handleReset = () => {
        setStep(1);
        setResult(null);
        setEditedCaptions({});
        setError(null);
    };

    const renderConfig = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50 mb-2">
                    Content Category / Niche *
                </label>
                <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. AI in Healthcare, SaaS Growth, Web3 Marketing..."
                    className="w-full bg-white/5 border border-white/10 rounded-[2px] px-4 py-3 text-[15px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#26cece] transition-colors"
                />
                <p className="mt-1.5 text-[11px] text-white/40 font-mono">
                    We'll find trending keywords in this niche via Google Trends
                </p>
            </div>

            <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50 mb-2">
                    Target Platforms *
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map(p => {
                        const Icon = p.icon;
                        const selected = selectedPlatforms.includes(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => togglePlatform(p.id)}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-[2px] border text-[13px] font-mono transition-all cursor-pointer ${
                                    selected
                                        ? 'bg-[#26cece]/10 border-[#26cece] text-[#26cece]'
                                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                                }`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span>{p.label}</span>
                                <span className="ml-auto text-[10px] text-white/40">{p.maxChars}ch</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Language & Tone Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#f0f0f0]">
                <div>
                    <h3 className="text-[13px] font-bold text-white font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-500" /> Language
                    </h3>
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 text-white/80 text-[13px] font-sans rounded-[4px] px-4 py-3 focus:outline-none focus:border-purple-500 hover:border-gray-400 transition-colors"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.label}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <h3 className="text-[13px] font-bold text-white font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-orange-500" /> Tone of Voice
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {TONES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTone(t.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-[4px] border transition-all ${
                                    tone === t.id 
                                        ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold' 
                                        : 'bg-white/5 border-white/10 text-white/70 hover:border-orange-200 hover:bg-orange-50/50'
                                }`}
                            >
                                <span className="text-lg">{t.emoji}</span>
                                <span className="text-[13px] font-sans">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-white/50 mb-2">
                    Extra Instructions (optional)
                </label>
                <textarea
                    value={extraInstructions}
                    onChange={e => setExtraInstructions(e.target.value)}
                    placeholder="Any specific angle, CTA, or context you want included..."
                    className="w-full bg-white/5 border border-white/10 rounded-[2px] px-4 py-3 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-[#26cece] transition-colors resize-none min-h-[80px]"
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={!category.trim() || selectedPlatforms.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#26cece] hover:bg-[#1fb8b8] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-mono text-[13px] uppercase tracking-widest py-3.5 rounded-[2px] transition-colors cursor-pointer"
            >
                <Sparkles className="w-4 h-4" />
                Generate Smart Post
            </button>

            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-[2px]">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[13px] text-red-600">{error}</p>
                </div>
            )}
        </div>
    );

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-[#26cece]/20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#26cece] animate-spin" />
                </div>
                <div className="absolute -inset-2 rounded-full border-2 border-[#26cece]/10 animate-ping" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-[16px] font-bold font-['Space_Grotesk'] text-white">
                    AI Pipeline Running
                </h3>
                <p className="text-[13px] text-white/50 font-mono animate-pulse">
                    {pipelineStatus}
                </p>
            </div>
            <div className="w-64 space-y-2 text-[11px] font-mono text-white/40">
                {['Fetching Google Trends', 'Writing platform captions', 'Generating graphic'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#26cece] animate-pulse' : 'bg-gray-200'}`} />
                        {s}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderReview = () => {
        if (!result) return null;
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[16px] font-bold font-['Space_Grotesk'] text-white flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            Posts Generated
                        </h3>
                        <p className="text-[12px] text-white/50 font-mono mt-0.5">
                            Category: {result.category}
                        </p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-white/50 hover:text-[#26cece] border border-white/10 hover:border-[#26cece]/30 rounded-[2px] transition-colors cursor-pointer"
                    >
                        <RefreshCw className="w-3 h-3" /> New Post
                    </button>
                </div>

                {result.trending_keywords?.length > 0 && (
                    <div className="p-3 bg-[#26cece]/5 border border-[#26cece]/15 rounded-[2px]">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#26cece] mb-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Trending Keywords Used
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {result.trending_keywords.map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white/5 border border-[#26cece]/20 rounded-[2px] text-[11px] text-white/80 font-mono">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {result.image_base64 && (
                    <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-white/50 mb-2">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Generated Graphic
                        </div>
                        <div className="border border-white/10 rounded-[2px] overflow-hidden bg-white/5">
                            <img
                                src={`data:image/png;base64,${result.image_base64}`}
                                alt="Generated social post graphic"
                                className="w-full max-h-[400px] object-contain"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <div className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                        Platform Captions
                    </div>
                    {Object.entries(editedCaptions).map(([platform, caption]) => {
                        const spec = PLATFORMS.find(p => p.id === platform);
                        if (!spec) return null;
                        const Icon = spec.icon;
                        const isExpanded = expandedCaption === platform;
                        const charCount = caption.length;
                        const isOverLimit = charCount > spec.maxChars;

                        return (
                            <div key={platform} className="border border-white/10 rounded-[2px] overflow-hidden">
                                <button
                                    onClick={() => setExpandedCaption(isExpanded ? null : platform)}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-black/20 transition-colors cursor-pointer"
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: spec.color }} />
                                    <span className="text-[13px] font-mono font-medium text-white">{spec.label}</span>
                                    <span className={`ml-auto text-[11px] font-mono ${isOverLimit ? 'text-red-500' : 'text-white/40'}`}>
                                        {charCount}/{spec.maxChars}
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                                </button>
                                {isExpanded && (
                                    <div className="p-4 space-y-3">
                                        <textarea
                                            value={caption}
                                            onChange={e => setEditedCaptions(prev => ({ ...prev, [platform]: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-[2px] p-3 text-[14px] text-white focus:outline-none focus:border-[#26cece] transition-colors resize-none min-h-[120px]"
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleCopy(platform)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest bg-black/20 hover:bg-white/10 text-white/80 rounded-[2px] transition-colors cursor-pointer"
                                            >
                                                {copiedPlatform === platform ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                {copiedPlatform === platform ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={handlePrepareForPost}
                        className="w-full flex items-center justify-center gap-2 bg-[#26cece] hover:bg-white/5 text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest py-4 rounded-[2px] shadow-none hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333] transition-all duration-200 cursor-pointer"
                    >
                        <Clock className="w-5 h-5" />
                        Preview & Schedule Post
                    </button>
                    <p className="mt-3 text-center text-[11px] font-mono text-white/40 uppercase tracking-widest">
                        This will open the preview & scheduling modal
                    </p>
                </div>
            </div>
        );
    };

    const renderHistory = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mx-auto">
                            <Clock className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-[13px] font-mono text-white/50 uppercase tracking-widest">
                            No history found yet
                        </p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => handleSelectFromHistory(item)}
                            className="group bg-white/5 border border-white/10 rounded-[2px] overflow-hidden hover:border-[#26cece]/50 transition-all cursor-pointer"
                        >
                            <div className="aspect-video bg-white/5 relative overflow-hidden">
                                {item.flyer_url ? (
                                    <img src={item.flyer_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-slate-200" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 bg-white/5 text-white px-4 py-2 text-[11px] font-mono uppercase tracking-widest transition-opacity">
                                        Use This Post
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-bold font-['Space_Grotesk'] text-white truncate uppercase">
                                        {item.location}
                                    </span>
                                    <span className="text-[10px] font-mono text-white/40">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-[11px] font-mono text-white/50 line-clamp-2 italic">
                                    {Object.values(item.metadata?.captions || {})[0] || 'No caption'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderScheduledPosts = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {loadingScheduled ? (
                    <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-[#26cece] animate-spin mx-auto" /></div>
                ) : scheduledPosts.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mx-auto">
                            <Clock className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-[13px] font-mono text-white/50 uppercase tracking-widest">
                            No scheduled posts found
                        </p>
                    </div>
                ) : (
                    scheduledPosts.map((item) => (
                        <div 
                            key={item.id}
                            className="bg-white/5 border border-white/10 rounded-[2px] overflow-hidden"
                        >
                            <div className="p-4 flex gap-4">
                                {item.media_url && (
                                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                        <img src={item.media_url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {item.platforms?.map(p => (
                                                <span key={p} className="text-[10px] font-mono uppercase bg-white/10 px-2 py-1 rounded-full text-white/80">{p}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-[2px] border ${
                                                item.status === 'approved' || item.status === 'scheduled' ? 'bg-[#26cece]/10 border-[#26cece] text-[#26cece]' :
                                                item.status === 'rejected' ? 'bg-red-500/10 border-red-500 text-red-500' :
                                                'bg-[#FFCA4A]/10 border-[#FFCA4A] text-[#FFCA4A]'
                                            }`}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                            {editingTimeId === item.id ? (
                                                <div className="flex items-center gap-2 ml-2">
                                                    <input 
                                                        type="datetime-local" 
                                                        value={editTimeValue}
                                                        onChange={e => setEditTimeValue(e.target.value)}
                                                        className="bg-white/5 border border-white/10 text-white px-2 py-1 rounded-sm font-mono text-[11px] outline-none"
                                                    />
                                                    <button onClick={() => handleUpdateScheduledTime(item.id)} disabled={isUpdatingTime} className="text-[#25D366] hover:text-white transition-colors cursor-pointer">
                                                        {isUpdatingTime ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => setEditingTimeId(null)} className="text-red-400 hover:text-white transition-colors cursor-pointer">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-mono text-white/60">
                                                        {new Date(item.scheduled_at).toLocaleString()}
                                                    </span>
                                                    {(item.status === 'pending_approval' || item.status === 'scheduled' || item.status === 'approved') && (
                                                        <button 
                                                            onClick={() => {
                                                                setEditingTimeId(item.id);
                                                                // Convert ISO string back to local datetime-local format
                                                                const localDate = new Date(item.scheduled_at);
                                                                const tzOffset = localDate.getTimezoneOffset() * 60000;
                                                                const localISOTime = (new Date(localDate - tzOffset)).toISOString().slice(0,16);
                                                                setEditTimeValue(localISOTime);
                                                            }}
                                                            className="text-[#26cece]/60 hover:text-[#26cece] transition-colors cursor-pointer"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-white/80 font-sans line-clamp-2">
                                        {item.text}
                                    </p>
                                    <div className="text-[10px] font-mono text-white/40 pt-2 flex justify-between">
                                        <span>Approver: {item.approver_phone || 'None'}</span>
                                        {item.status === 'pending_approval' && (
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const token = await getToken();
                                                        const res = await fetch(`${API_BASE_URL}/api/social/schedule/${item.id}/resend-approval`, {
                                                            method: 'POST',
                                                            headers: { 
                                                                'Authorization': `Bearer ${token}`, 
                                                                ...workspaceHeaders 
                                                            }
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            alert('Approval request sent via WhatsApp!');
                                                        } else {
                                                            alert(data.message || 'Failed to resend approval');
                                                        }
                                                    } catch (err) {
                                                        console.error('Failed to resend approval:', err);
                                                        alert('An error occurred');
                                                    }
                                                }}
                                                className="text-[#26cece] hover:underline cursor-pointer transition-all"
                                            >
                                                Resend Approval Request
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="flex-1 p-8 bg-white/5 overflow-y-auto w-full">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#26cece]" />
                            Smart Post Scheduler
                        </h2>
                        <p className="text-[13px] text-white/50 font-mono mt-1">
                            {activeTab === 'create' ? 'Category → Google Trends → AI Captions → Graphic → Publish' : activeTab === 'scheduled' ? 'Manage your upcoming AI-generated posts' : 'Access your past AI-generated social content'}
                        </p>
                    </div>

                    <div className="flex items-center bg-black/20 p-1 rounded-[2px] border border-white/10">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded-[1px] transition-all cursor-pointer ${
                                activeTab === 'create' ? 'bg-white/5 text-[#26cece] shadow-sm font-bold' : 'text-white/50 hover:text-white'
                            }`}
                        >
                            Create
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('history');
                                fetchHistory();
                            }}
                            className={`px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded-[1px] transition-all cursor-pointer ${
                                activeTab === 'history' ? 'bg-white/5 text-[#26cece] shadow-sm font-bold' : 'text-white/50 hover:text-white'
                            }`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('scheduled');
                                fetchScheduledPosts();
                            }}
                            className={`px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded-[1px] transition-all cursor-pointer ${
                                activeTab === 'scheduled' ? 'bg-white/5 text-[#26cece] shadow-sm font-bold' : 'text-white/50 hover:text-white'
                            }`}
                        >
                            Scheduled
                        </button>
                    </div>
                </div>
                
                {justPosted && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-[2px] p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="w-8 h-8 rounded-[2px] bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[13px] font-bold text-emerald-900 uppercase tracking-tight font-['Space_Grotesk']">Post Published Successfully!</p>
                            <p className="text-[11px] text-emerald-700 font-mono uppercase tracking-widest mt-0.5">Your content is now live. Check your history below.</p>
                        </div>
                        <button onClick={() => setJustPosted(false)} className="text-emerald-400 hover:text-emerald-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {activeTab === 'create' ? (
                    <>
                        <div className="flex items-center gap-2">
                            {STEPS.map((s, i) => {
                                const Icon = s.icon;
                                const isActive = step === s.id;
                                const isDone = step > s.id;
                                return (
                                    <React.Fragment key={s.id}>
                                        {i > 0 && <div className={`flex-1 h-px ${isDone ? 'bg-[#26cece]' : 'bg-white/10'}`} />}
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-[11px] font-mono uppercase tracking-widest transition-colors ${
                                            isActive ? 'bg-[#26cece]/10 text-[#26cece] border border-[#26cece]/30' :
                                            isDone ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                            'text-white/40 border border-white/10'
                                        }`}>
                                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className={`w-3.5 h-3.5 ${isActive && s.id === 2 ? 'animate-spin' : ''}`} />}
                                            {s.label}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[2px] p-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.08)]">
                            {step === 1 && renderConfig()}
                            {step === 2 && renderLoading()}
                            {step === 3 && renderReview()}
                        </div>
                    </>
                ) : activeTab === 'scheduled' ? (
                    <div className="bg-white/5 border border-white/10 rounded-[2px] p-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.08)]">
                        {loadingScheduled ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-8 h-8 text-[#26cece] animate-spin" />
                                <p className="text-[12px] font-mono text-white/50 uppercase tracking-widest">Loading Scheduled Posts...</p>
                            </div>
                        ) : renderScheduledPosts()}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-[2px] p-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.08)]">
                        {loadingHistory ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-8 h-8 text-[#26cece] animate-spin" />
                                <p className="text-[12px] font-mono text-white/50 uppercase tracking-widest">Loading History...</p>
                            </div>
                        ) : renderHistory()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulePostView;
