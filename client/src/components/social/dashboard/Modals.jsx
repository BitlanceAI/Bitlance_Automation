import React from 'react'; // Force save to clear lock 3
import {
    X,
    Facebook,
    Instagram,
    Linkedin,
    Plus,
    Check,
    Send,
    Loader2,
    CheckCircle2,
    Copy,
    Link2,
    MessageCircle,
    TrendingUp,
    Clock,
    Sparkles,
    Download,
    Eye,
    ImageIcon,
    Film,
    FileText
} from 'lucide-react';
import API_BASE_URL from '../../../config.js';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export const AddProfileModal = ({ isAddProfileModalOpen, setIsAddProfileModalOpen, authToken }) => {
    if (!isAddProfileModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#115e59]/90 backdrop-blur-sm"
                onClick={() => setIsAddProfileModalOpen(false)}
            />
            <div className="relative bg-white/10 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] w-full max-w-sm overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/10">
                    <h3 className="text-[14px] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[#26cece]">Connect Profile</h3>
                    <button
                        onClick={() => setIsAddProfileModalOpen(false)}
                        className="text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 space-y-3">
                    {/* Facebook */}
                    <button
                        onClick={async () => {
                            try {
                                const currentUrl = window.location.origin + window.location.pathname;
                                const response = await fetch(`${API_BASE_URL}/api/meta/oauth/url?redirect_uri=${encodeURIComponent(currentUrl)}`, {
                                    headers: { 'Authorization': `Bearer ${authToken}` }
                                });
                                const data = await response.json();
                                if (data.success && data.url) {
                                    window.location.href = data.url;
                                } else {
                                    alert(data.error || 'Failed to get Meta auth URL');
                                }
                            } catch (err) {
                                console.error('Meta connect init error:', err);
                                alert('Failed to initiate Meta connection');
                            }
                        }}
                        className="w-full flex items-center gap-4 p-4 -[2px] border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#444] transition-all group cursor-pointer text-left rounded-2xl"
                    >
                        <div className="w-10 h-10 rounded-full border border-white/10 bg-[#26cece]/10 flex items-center justify-center text-[#26cece] shrink-0">
                            <Facebook className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[13px] font-mono tracking-widest text-white uppercase group-hover:text-[#26cece]">Facebook</div>
                            <div className="text-[10px] font-mono tracking-widest text-white/60 uppercase mt-1">Connect page or group</div>
                        </div>
                        <Plus className="w-5 h-5 text-white/60 group-hover:text-white" />
                    </button>

                    {/* Instagram */}
                    <button
                        onClick={async () => {
                            try {
                                const currentUrl = window.location.origin + window.location.pathname;
                                const response = await fetch(`${API_BASE_URL}/api/meta/oauth/url?redirect_uri=${encodeURIComponent(currentUrl)}`, {
                                    headers: { 'Authorization': `Bearer ${authToken}` }
                                });
                                const data = await response.json();
                                if (data.success && data.url) {
                                    window.location.href = data.url;
                                } else {
                                    alert(data.error || 'Failed to get Meta auth URL');
                                }
                            } catch (err) {
                                console.error('Meta connect init error:', err);
                                alert('Failed to initiate Meta connection');
                            }
                        }}
                        className="w-full flex items-center gap-4 p-4 -[2px] border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#444] transition-all group cursor-pointer text-left rounded-2xl"
                    >
                        <div className="w-10 h-10 rounded-full border border-white/10 bg-[#26cece]/10 flex items-center justify-center text-[#26cece] shrink-0">
                            <Instagram className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[13px] font-mono tracking-widest text-white uppercase group-hover:text-[#26cece]">Instagram</div>
                            <div className="text-[10px] font-mono tracking-widest text-white/60 uppercase mt-1">Connect Instagram Business</div>
                        </div>
                        <Plus className="w-5 h-5 text-white/60 group-hover:text-white" />
                    </button>

                    {/* LinkedIn */}
                    <button
                        onClick={async () => {
                            try {
                                const response = await fetch(`${API_BASE_URL}/api/linkedin/oauth/url`, {
                                    headers: { 'Authorization': `Bearer ${authToken}` }
                                });
                                const data = await response.json();
                                if (data.success && data.url) {
                                    window.location.href = data.url;
                                } else {
                                    alert(data.error || 'Failed to get LinkedIn auth URL');
                                }
                            } catch (err) {
                                console.error('LinkedIn connect init error:', err);
                                alert('Failed to initiate LinkedIn connection');
                            }
                        }}
                        className="w-full flex items-center gap-4 p-4 -[2px] border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#444] transition-all group cursor-pointer text-left rounded-2xl"
                    >
                        <div className="w-10 h-10 rounded-full border border-white/10 bg-[#26cece]/10 flex items-center justify-center text-[#26cece] shrink-0">
                            <Linkedin className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[13px] font-mono tracking-widest text-white uppercase group-hover:text-[#26cece]">LinkedIn</div>
                            <div className="text-[10px] font-mono tracking-widest text-white/60 uppercase mt-1">Connect profile or page</div>
                        </div>
                        <Plus className="w-5 h-5 text-white/60 group-hover:text-white" />
                    </button>

                    {/* X (Twitter) */}
                    <button
                        onClick={async () => {
                            try {
                                const response = await fetch(`${API_BASE_URL}/api/twitter/oauth/url`, {
                                    headers: { 'Authorization': `Bearer ${authToken}` }
                                });
                                const data = await response.json();
                                if (data.success && data.url) {
                                    window.location.href = data.url;
                                } else {
                                    alert(data.error || 'Failed to get Twitter auth URL');
                                }
                            } catch (err) {
                                console.error('Twitter connect init error:', err);
                                alert('Failed to initiate Twitter/X connection');
                            }
                        }}
                        className="w-full flex items-center gap-4 p-4 -[2px] border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#444] transition-all group cursor-pointer text-left rounded-2xl"
                    >
                        <div className="w-10 h-10 rounded-full border border-white/10 bg-[#26cece]/10 flex items-center justify-center text-[#26cece] shrink-0">
                            <XIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-[13px] font-mono tracking-widest text-white uppercase group-hover:text-[#26cece]">X (Twitter)</div>
                            <div className="text-[10px] font-mono tracking-widest text-white/60 uppercase mt-1">Connect X profile</div>
                        </div>
                        <Plus className="w-5 h-5 text-white/60 group-hover:text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PostPreviewModal = ({
    isPreviewOpen,
    setIsPreviewOpen,
    previewStep,
    setPreviewStep,
    postTargets,
    setPostTargets,
    connectedProfiles,
    postText,
    mediaAttachment,
    postVisibility,
    isPosting,
    handlePost,
    postSuccessCount,
    waShare,
    setWaShare,
    handleSendWhatsAppPreview
}) => {
    if (!isPreviewOpen) return null;

    const togglePostTarget = (profile) => {
        const key = profile.profileId || profile.name;
        setPostTargets(prev => {
            const exists = prev.find(p => (p.profileId || p.name) === key);
            return exists ? prev.filter(p => (p.profileId || p.name) !== key) : [...prev, profile];
        });
    };

    const isPostTarget = (profile) => {
        const key = profile.profileId || profile.name;
        return postTargets.some(p => (p.profileId || p.name) === key);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#115e59]/90 backdrop-blur-sm" onClick={() => !isPosting && setIsPreviewOpen(false)} />
            <div className="relative bg-white/10 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] w-full max-w-4xl max-h-[90vh] flex flex-col z-10">

                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/10 shrink-0">
                    <h2 className="text-[16px] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[#26cece] flex items-center gap-2">
                        {previewStep === 1 ? 'Step 1: Select Platforms' : 'Step 2: Preview & Publish'}
                    </h2>
                    <button onClick={() => !isPosting && setIsPreviewOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white/5 backdrop-blur-md rounded-2xl">
                    {previewStep === 1 && (
                        <div className="p-8 max-w-2xl mx-auto space-y-8">
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-[14px] font-bold font-['Space_Grotesk'] text-white uppercase tracking-widest mb-4">Post to the following profiles</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {connectedProfiles.map(profile => {
                                        const selected = isPostTarget(profile);
                                        return (
                                            <div
                                                key={profile.profileId || profile.name}
                                                onClick={() => togglePostTarget(profile)}
                                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${selected ? 'bg-[#26cece]/10 border-[#26cece]' : 'bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[#115e59] shrink-0 ${selected ? 'bg-[#26cece]' : 'bg-gray-500'}`}>
                                                    {profile.platform === 'linkedin' && <Linkedin className="w-4 h-4 fill-current" />}
                                                    {profile.platform === 'twitter' && <XIcon className="w-4 h-4" />}
                                                    {profile.platform === 'facebook' && <Facebook className="w-4 h-4 fill-current" />}
                                                    {profile.platform === 'instagram' && <Instagram className="w-4 h-4 fill-current" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[13px] font-bold font-['Space_Grotesk'] truncate ${selected ? 'text-white' : 'text-white/80'}`}>{profile.name}</p>
                                                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/60 truncate">{profile.type}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selected ? 'border-[#26cece] bg-[#26cece] text-[#115e59]' : 'border-white/20 bg-white/10 text-transparent'}`}>
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {postTargets.length === 0 && (
                                    <p className="text-[#FFCA4A] text-[11px] font-mono tracking-widest uppercase mt-4">⚠ Please select at least one profile</p>
                                )}
                            </div>

                            {/* WhatsApp Notification Share (Optional) */}
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[14px] font-bold font-['Space_Grotesk'] text-white uppercase tracking-widest flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-[#25D366]" /> Share via WhatsApp
                                    </h3>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input type="checkbox" name="toggle" id="wa-toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-white/10" checked={waShare.enabled} onChange={(e) => setWaShare({ ...waShare, enabled: e.target.checked })} />
                                        <label htmlFor="wa-toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors duration-200 ease-in ${waShare.enabled ? 'bg-[#25D366]' : 'bg-[#333]'}`}></label>
                                    </div>
                                </div>

                                {waShare.enabled && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md border border-white/10 -[2px] w-fit rounded-2xl">
                                            <button onClick={() => setWaShare({ ...waShare, mode: 'link' })} className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded-full transition-colors ${waShare.mode === 'link' ? 'bg-[#25D366]/20 text-[#25D366]' : 'text-white/80 hover:text-teal-50'}`}>Share Link</button>
                                            <button onClick={() => setWaShare({ ...waShare, mode: 'direct' })} className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest rounded-full transition-colors ${waShare.mode === 'direct' ? 'bg-[#25D366]/20 text-[#25D366]' : 'text-white/80 hover:text-teal-50'}`}>Direct Message</button>
                                        </div>

                                        {waShare.mode === 'link' ? (
                                            <div className="space-y-3">
                                                <p className="text-[11px] font-mono uppercase tracking-widest text-white/80">Generate a universal WhatsApp link to share anywhere.</p>
                                                <button
                                                    onClick={() => {
                                                        const text = encodeURIComponent(`Check out this post:\n\n${postText}`);
                                                        const link = `https://wa.me/?text=${text}`;
                                                        navigator.clipboard.writeText(link);
                                                        setWaShare({ ...waShare, copied: true });
                                                        setTimeout(() => setWaShare(w => ({ ...w, copied: false })), 2000);
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 p-3 border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white -[2px] font-mono text-[12px] uppercase tracking-widest transition-colors cursor-pointer rounded-2xl"
                                                >
                                                    {waShare.copied ? <CheckCircle2 className="w-4 h-4 text-[#25D366]" /> : <Link2 className="w-4 h-4" />}
                                                    {waShare.copied ? 'Link Copied!' : 'Copy WhatsApp Link'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-[11px] font-mono uppercase tracking-widest text-white/80">Send this draft instantly to a WhatsApp number.</p>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 font-mono text-[12px]">+</span>
                                                        <input
                                                            type="text"
                                                            placeholder="CountryCodePhone (e.g. 919876543210)"
                                                            value={waShare.phone}
                                                            onChange={e => setWaShare({ ...waShare, phone: e.target.value.replace(/\D/g, '') })}
                                                            className="w-full pl-6 pr-3 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 -[2px] text-white font-mono text-[13px] focus:outline-none focus:border-[#25D366] transition-colors rounded-2xl"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={handleSendWhatsAppPreview}
                                                        disabled={waShare.sending || waShare.phone.length < 10}
                                                        className="px-4 bg-[#25D366] hover:bg-[#20bd5a] text-[#115e59] rounded-2xl font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {waShare.sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                        Send
                                                    </button>
                                                </div>
                                                {waShare.error && <p className="text-red-400 text-[11px] font-mono uppercase tracking-widest mt-1">✕ {waShare.error}</p>}
                                                {waShare.sent && <p className="text-[#25D366] text-[11px] font-mono uppercase tracking-widest mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Sent to WhatsApp</p>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {previewStep === 2 && (
                        <div className="p-8 max-w-3xl mx-auto">
                            {postTargets.length === 0 ? (
                                <div className="text-center py-12 text-[#FFCA4A] font-mono text-[12px] uppercase tracking-widest">
                                    No profiles selected to preview.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {postTargets.map((profile, idx) => {
                                        const isTwitter = profile.platform === 'twitter';
                                        return (
                                            <div key={idx} className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                                                <div className="px-4 py-3 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between shrink-0 rounded-2xl">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[#115e59] ${isTwitter ? 'bg-white' : 'bg-[#26cece]'}`}>
                                                            {isTwitter ? <XIcon className="w-3 h-3" /> : profile.platform === 'facebook' ? <Facebook className="w-3 h-3 fill-current" /> : profile.platform === 'instagram' ? <Instagram className="w-3 h-3 fill-current" /> : <Linkedin className="w-3 h-3 fill-current" />}
                                                        </div>
                                                        <span className="text-[12px] font-bold font-['Space_Grotesk'] text-white uppercase tracking-widest">{profile.platform} Preview</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 flex-1 flex flex-col bg-white">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        {profile.avatar ? (
                                                            <img src={profile.avatar} alt={profile.name} className={`w-12 h-12 object-cover ${isTwitter ? 'rounded-full' : 'rounded-full'}`} />
                                                        ) : (
                                                            <div className={`w-12 h-12 bg-slate-200 flex items-center justify-center text-lg font-bold text-white/60 ${isTwitter ? 'rounded-2xl' : 'rounded-2xl'}`}>
                                                                {profile.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-[14px] leading-tight">{profile.name}</p>
                                                            <p className="text-white/60 text-[12px] mt-0.5">{isTwitter ? profile.type : `${profile.followers} followers`}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-slate-900 text-[14px] leading-relaxed whitespace-pre-wrap font-sans">
                                                        {postText || <span className="text-white/80 italic">Post content goes here...</span>}
                                                    </div>
                                                    {mediaAttachment && (
                                                        <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200">
                                                            {mediaAttachment.mediaCategory === 'IMAGE' && mediaAttachment.preview ? (
                                                                <img src={mediaAttachment.preview} alt="attached" className="w-full h-auto object-cover max-h-[250px]" />
                                                            ) : (
                                                                <div className="bg-slate-50 p-4 flex items-center gap-3">
                                                                    {mediaAttachment.mediaCategory === 'VIDEO' ? <Film className="w-6 h-6 text-slate-400" /> : <FileText className="w-6 h-6 text-slate-400" />}
                                                                    <div className="min-w-0">
                                                                        <p className="text-[13px] font-bold text-slate-900 truncate">{mediaAttachment.file.name}</p>
                                                                        <p className="text-[11px] text-white/60">{(mediaAttachment.file.size / 1024 / 1024).toFixed(1)} MB</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-white/10 bg-white/10 flex justify-between items-center shrink-0">
                    <div>
                        {previewStep === 2 && (
                            <button
                                onClick={() => setPreviewStep(1)}
                                disabled={isPosting}
                                className="text-white/80 hover:text-white font-mono text-[12px] uppercase tracking-widest transition-colors cursor-pointer"
                            >
                                ← Back
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {previewStep === 1 ? (
                            <button
                                onClick={() => setPreviewStep(2)}
                                disabled={postTargets.length === 0}
                                className="bg-[#26cece] text-[#115e59] px-6 py-2.5 rounded-full font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#444] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue to Preview →
                            </button>
                        ) : (
                            <button
                                onClick={handlePost}
                                disabled={isPosting || postTargets.length === 0}
                                className="bg-[#26cece] text-[#115e59] px-8 py-2.5 rounded-full font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#444] transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPosting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                                ) : (
                                    <><Send className="w-4 h-4 mr-2" /> Publish Now</>
                                )}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export const TrendingTopicsModal = ({
    isTrendingModalOpen,
    setIsTrendingModalOpen,
    isTrendingLoading,
    trendingTopics,
    trendingNiche,
    setTrendingNiche,
    handleFetchTrending,
    setPostText,
    setIsAiWriteOpen,
    setAiPrompt
}) => {
    if (!isTrendingModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#115e59]/90 backdrop-blur-sm" onClick={() => setIsTrendingModalOpen(false)} />
            <div className="relative bg-white/10 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] w-full max-w-2xl max-h-[85vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/10 shrink-0">
                    <h3 className="text-[14px] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[#26cece] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Trending Topics (LinkedIn & Twitter)
                    </h3>
                    <button onClick={() => setIsTrendingModalOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 flex-1 overflow-y-auto bg-white/5 backdrop-blur-md rounded-2xl">
                    <div className="flex gap-2 mb-5 overflow-x-auto pb-2 custom-scrollbar">
                        {['technology', 'marketing', 'real estate', 'finance', 'design'].map(n => (
                            <button
                                key={n}
                                onClick={() => { setTrendingNiche(n); setTimeout(handleFetchTrending, 0); }}
                                className={`px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-widest whitespace-nowrap border transition-all cursor-pointer ${trendingNiche === n ? 'bg-[#26cece]/10 border-[#26cece] text-[#26cece]' : 'bg-white/10 border-white/10 text-white/80 hover:text-white hover:border-white/20'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>

                    {isTrendingLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-[#26cece] animate-spin mb-4" />
                            <p className="text-[11px] font-mono text-white/60 uppercase tracking-widest animate-pulse">Analyzing viral topics across platforms...</p>
                        </div>
                    ) : trendingTopics.length === 0 ? (
                        <div className="text-center py-10 border border-white/10 bg-white/10 rounded-2xl">
                            <TrendingUp className="w-8 h-8 text-[#333] mx-auto mb-3" />
                            <p className="text-white/60 font-mono text-[11px] uppercase tracking-widest">Select a niche to see trending topics</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {trendingTopics.map((topic, i) => (
                                <div key={i} className="bg-white/10 border border-white/10 p-4 rounded-2xl hover:border-white/20 transition-all group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-[15px] font-bold text-white font-['Space_Grotesk'] tracking-tight mb-1">{topic.title}</h4>
                                            <p className="text-[13px] text-white/80 font-sans leading-relaxed mb-3">{topic.context}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {topic.hashtags?.map(tag => (
                                                    <span key={tag} className="text-[10px] font-mono text-[#26cece] bg-[#26cece]/10 px-2 py-0.5 rounded-full">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setAiPrompt(`Write a highly engaging social post about: ${topic.title}. Context: ${topic.context}. Include these hashtags: ${topic.hashtags.join(', ')}`);
                                                setPostText('');
                                                setIsAiWriteOpen(true);
                                                setIsTrendingModalOpen(false);
                                            }}
                                            className="px-3 py-1.5 bg-[#26cece]/10 hover:bg-[#26cece] text-[#26cece] hover:text-[#115e59] border border-[#26cece]/30 hover:border-[#26cece] rounded-full font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100"
                                        >
                                            <Sparkles className="w-3 h-3" /> Write Post
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const GraphicsAIPickerModal = ({
    isGraphicsPickerOpen,
    setIsGraphicsPickerOpen,
    graphicsLoading,
    graphicsJobs,
    handleGraphicSelect
}) => {
    if (!isGraphicsPickerOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#115e59]/90 backdrop-blur-sm" onClick={() => setIsGraphicsPickerOpen(false)} />
            <div className="relative bg-white/10 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] w-full max-w-4xl max-h-[85vh] flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-white/10 shrink-0">
                    <h3 className="text-[14px] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[#26cece] flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Select from Graphics AI
                    </h3>
                    <button onClick={() => setIsGraphicsPickerOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 flex-1 overflow-y-auto bg-white/5 backdrop-blur-md rounded-2xl">
                    {graphicsLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-[#26cece] animate-spin mb-4" />
                            <p className="text-[11px] font-mono text-white/60 uppercase tracking-widest animate-pulse">Loading your generated graphics...</p>
                        </div>
                    ) : graphicsJobs.length === 0 ? (
                        <div className="text-center py-12 border border-white/10 bg-white/10 rounded-2xl">
                            <ImageIcon className="w-8 h-8 text-[#333] mx-auto mb-3" />
                            <p className="text-white/60 font-mono text-[11px] uppercase tracking-widest mb-2">No generated graphics found</p>
                            <p className="text-white/40 text-[12px] font-sans">Use the "Generate Image" tool to create AI art first.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {graphicsJobs.map((job) => (
                                <div key={job.id} className="group relative aspect-square bg-white/10 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                                    {job.status === 'completed' && (job.flyer_url || job.image_url) ? (
                                        <>
                                            <img src={job.flyer_url || job.image_url} alt={job.metadata?.prompt || 'Generated Graphic'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                                <button
                                                    onClick={() => handleGraphicSelect(job.flyer_url || job.image_url)}
                                                    className="bg-[#26cece] text-[#115e59] px-4 py-2 rounded-full font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[11px] flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer mb-2"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Select Image
                                                </button>
                                                <a
                                                    href={job.flyer_url || job.image_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-white/10/80 text-white px-3 py-1.5 rounded-full border border-white/10 font-mono uppercase tracking-widest text-[10px] flex items-center gap-1.5 hover:bg-white hover:text-black transition-colors"
                                                >
                                                    <Eye className="w-3 h-3" /> View Full
                                                </a>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                <p className="text-[10px] font-mono text-white/80 uppercase truncate">{job.metadata?.prompt || job.property_type || 'Generated Graphic'}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                            {job.status === 'failed' ? (
                                                <div className="text-red-400 text-[10px] font-mono uppercase text-center">Failed</div>
                                            ) : (
                                                <>
                                                    <Loader2 className="w-5 h-5 text-[#26cece] animate-spin mb-2" />
                                                    <div className="text-white/80 text-[10px] font-mono uppercase text-center">Generating...</div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
