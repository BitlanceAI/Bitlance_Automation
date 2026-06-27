import React from 'react';
import {
    Sparkles,
    Linkedin,
    Film,
    FileText,
    X,
    Palette,
    TrendingUp,
    Paperclip,
    ImageIcon,
    Send,
    Check
} from 'lucide-react';
import API_BASE_URL from '../../../config.js';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const Facebook = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
);

const Instagram = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.822a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
    </svg>
);

const PostComposer = ({
    linkedinProfiles,
    connectedProfiles,
    selectedProfileIds,
    toggleProfileSelection,
    postText,
    setPostText,
    setPostStatus,
    mediaAttachment,
    removeAttachment,
    isAiWriteOpen,
    setIsAiWriteOpen,
    aiPrompt,
    setAiPrompt,
    aiTone,
    setAiTone,
    aiError,
    setAiError,
    handleAiWrite,
    isAiLoading,
    isGraphicsGenerateOpen,
    setIsGraphicsGenerateOpen,
    graphicsPrompt,
    setGraphicsPrompt,
    isGraphicsGenerating,
    setIsGraphicsGenerating,
    setIsGraphicsPickerOpen,
    setGraphicsLoading,
    setGraphicsJobs,
    setIsTrendingModalOpen,
    handleFetchTrending,
    fileInputRef,
    handleFileSelect,
    postVisibility,
    setPostVisibility,
    setPreviewStep,
    setWaShare,
    setIsPreviewOpen,
    postTargets,
    togglePostTarget,
    isPostTarget,
    postStatus,
    authToken
}) => {
    return (
        <div className="bg-white/10 border border-white/10 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <h2 className="text-[16px] font-bold font-['Space_Grotesk'] tracking-tight text-white mb-4 uppercase flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#26cece]" />
                Create a new post
            </h2>

            {/* Profile selector (legacy for LinkedIn specific) */}
            {linkedinProfiles.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {linkedinProfiles.map(profile => {
                        const isSelected = selectedProfileIds.length === 0 || selectedProfileIds.includes(profile.profileId);
                        return (
                            <button
                                key={profile.profileId}
                                onClick={() => toggleProfileSelection(profile.profileId)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-widest border transition-all cursor-pointer ${isSelected ? 'bg-[#26cece]/10 border-[#26cece] text-[#26cece]' : 'bg-white/5 backdrop-blur-md border-white/10 text-white/60 hover:text-teal-50 hover:border-white/20'}`}
                            >
                                <Linkedin className="w-3.5 h-3.5" />
                                {profile.name}
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="border border-white/10 bg-white/5 backdrop-blur-md -[2px] p-4 focus-within:border-[#26cece] transition-all rounded-2xl">
                <textarea
                    value={postText}
                    onChange={e => { setPostText(e.target.value); setPostStatus(null); }}
                    placeholder="What do you want to share with your audience?"
                    className="w-full bg-transparent border-none text-white resize-none focus:outline-none min-h-[120px] text-[15px] placeholder:text-white/40 font-sans"
                />

                {/* Attachment preview */}
                {mediaAttachment && (
                    <div className="mt-3 relative inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-2xl px-3 py-2 max-w-full">
                        {mediaAttachment.mediaCategory === 'IMAGE' && mediaAttachment.preview ? (
                            <img src={mediaAttachment.preview} alt="preview" className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/10" />
                        ) : mediaAttachment.mediaCategory === 'VIDEO' ? (
                            <Film className="w-8 h-8 text-[#26cece] shrink-0" />
                        ) : (
                            <FileText className="w-8 h-8 text-[#26cece] shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-teal-50 text-[11px] font-mono tracking-widest truncate">{mediaAttachment.file.name}</p>
                            <p className="text-white/60 font-mono text-[10px] tracking-widest uppercase">{mediaAttachment.mediaCategory} · {(mediaAttachment.file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <button onClick={removeAttachment} className="ml-1 text-white/60 hover:text-red-400 transition-colors shrink-0 cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* AI Write panel */}
                {isAiWriteOpen && (
                    <div className="mt-3 p-3 bg-[#26cece]/5 border border-[#26cece]/20 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-[#26cece] font-mono uppercase tracking-widest text-[11px]">
                            <Sparkles className="w-3.5 h-3.5" />
                            {postText.trim() ? 'Rewrite with AI' : 'Generate with AI'}
                        </div>

                        {!postText.trim() && (
                            <textarea
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                placeholder="What do you want to post about? (e.g. product launch, industry insight, career win…)"
                                className="w-full bg-white/10 border border-white/10 text-white rounded-2xl p-2.5 text-[13px] font-sans resize-none focus:outline-none focus:border-[#26cece] min-h-[72px] placeholder:text-white/40"
                            />
                        )}
                        {postText.trim() && (
                            <p className="text-[10px] font-mono tracking-widest uppercase text-[#26cece]">Your current draft will be improved and rewritten.</p>
                        )}

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono tracking-widest text-white/60 shrink-0 uppercase">Tone:</span>
                            {['professional', 'casual', 'inspiring', 'witty'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setAiTone(t)}
                                    className={`px-2.5 py-1 rounded-2xl font-mono text-[10px] uppercase tracking-widest border transition-all cursor-pointer ${aiTone === t ? 'bg-[#26cece]/10 border-[#26cece] text-[#26cece]' : 'bg-white/10 border-white/10 text-white/80 hover:text-teal-50 hover:border-white/20'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {aiError && (
                            <p className="text-[12px] font-mono text-red-500">✕ {aiError}</p>
                        )}

                        <div className="flex gap-2 justify-end mt-2">
                            <button
                                onClick={() => { setIsAiWriteOpen(false); setAiPrompt(''); setAiError(null); }}
                                className="px-3 py-1.5 text-white/80 hover:text-teal-50 rounded-full font-mono text-[11px] uppercase tracking-widest hover:bg-[#222] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAiWrite}
                                disabled={isAiLoading || (!aiPrompt.trim() && !postText.trim())}
                                className="px-4 py-1.5 bg-[#26cece] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-[#115e59] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                {isAiLoading ? (
                                    <><span className="w-3 h-3 border-2 border-[#115e59]/30 border-t-[#115e59] rounded-full animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-3.5 h-3.5" /> Generate</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Graphics Generate panel */}
                {isGraphicsGenerateOpen && (
                    <div className="mt-3 p-3 bg-[#26cece]/5 border border-[#26cece]/20 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-[#26cece] font-mono uppercase tracking-widest text-[11px]">
                            <Palette className="w-3.5 h-3.5" />
                            Generate Image with AI
                        </div>

                        <textarea
                            value={graphicsPrompt}
                            onChange={e => setGraphicsPrompt(e.target.value)}
                            placeholder="Describe the image you want to generate (e.g. A futuristic city skyline at sunset)..."
                            className="w-full bg-white/10 border border-white/10 text-white rounded-2xl p-2.5 text-[13px] font-sans resize-none focus:outline-none focus:border-[#26cece] min-h-[72px] placeholder:text-white/40"
                        />

                        <div className="flex gap-2 justify-end mt-2">
                            <button
                                onClick={() => { setIsGraphicsGenerateOpen(false); setGraphicsPrompt(''); }}
                                className="px-3 py-1.5 text-white/80 hover:text-teal-50 rounded-full font-mono text-[11px] uppercase tracking-widest hover:bg-[#222] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!graphicsPrompt.trim()) return;
                                    setIsGraphicsGenerating(true);
                                    try {
                                        const res = await fetch(`${API_BASE_URL}/api/design/generate-from-prompt`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                                            body: JSON.stringify({ prompt: graphicsPrompt, image_size: '1024x1024', image_quality: 'low' })
                                        });
                                        const data = await res.json();
                                        if (!res.ok) throw new Error(data.error || 'Failed to generate image');
                                        
                                        setIsGraphicsGenerateOpen(false);
                                        setGraphicsPrompt('');
                                        
                                        setIsGraphicsPickerOpen(true);
                                        setGraphicsLoading(true);
                                        try {
                                            const resJobs = await fetch(`${API_BASE_URL}/api/design/jobs`, {
                                                headers: { 'Authorization': `Bearer ${authToken}` }
                                            });
                                            const dataJobs = await resJobs.json();
                                            setGraphicsJobs(dataJobs.jobs || []);
                                        } catch { /* non-critical */ } finally {
                                            setGraphicsLoading(false);
                                        }
                                    } catch (err) {
                                        alert(err.message);
                                    } finally {
                                        setIsGraphicsGenerating(false);
                                    }
                                }}
                                disabled={isGraphicsGenerating || !graphicsPrompt.trim()}
                                className="px-4 py-1.5 bg-[#26cece] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-[#115e59] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                                {isGraphicsGenerating ? (
                                    <><span className="w-3 h-3 border-2 border-[#115e59]/30 border-t-[#115e59] rounded-full animate-spin" /> Generating...</>
                                ) : (
                                    <><Sparkles className="w-3.5 h-3.5" /> Generate</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Twitter char counter */}
                {connectedProfiles.some(p => p.platform === 'twitter') && (
                    <div className={`mt-2 text-right text-[12px] font-mono tracking-widest uppercase ${postText.length > 280 ? 'text-[#FF4A4A]' : postText.length > 240 ? 'text-[#FFCA4A]' : 'text-white/60'}`}>
                        <XIcon className="inline w-3 h-3 mr-1 opacity-70" />
                        {postText.length}/280{postText.length > 280 && ' · over limit for tweet'}
                    </div>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                    <div className="flex gap-1 items-center">
                        <button
                            onClick={() => { setIsAiWriteOpen(v => !v); setIsGraphicsGenerateOpen(false); setAiError(null); }}
                            className={`p-2 rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest border border-transparent ${isAiWriteOpen ? 'bg-[#26cece]/10 text-[#26cece] border-[#26cece]' : 'text-white/80 hover:text-teal-50 hover:border-white/20 hover:bg-[#222]'}`}
                        >
                            <Sparkles className="w-4 h-4" /> AI Write
                        </button>
                        
                        <button
                            onClick={() => { setIsGraphicsGenerateOpen(v => !v); setIsAiWriteOpen(false); }}
                            className={`p-2 rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest border border-transparent ${isGraphicsGenerateOpen ? 'bg-[#26cece]/10 text-[#26cece] border-[#26cece]' : 'text-white/80 hover:text-teal-50 hover:border-white/20 hover:bg-[#222]'}`}
                        >
                            <Palette className="w-4 h-4" /> <span className="hidden sm:inline">Generate Image</span>
                        </button>
                        
                        <button
                            onClick={() => { setIsTrendingModalOpen(true); handleFetchTrending(); }}
                            className="p-2 text-white/80 hover:text-[#26cece] rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest border border-transparent hover:border-white/20 hover:bg-[#222]"
                        >
                            <TrendingUp className="w-4 h-4" /> Trends
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,application/pdf"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach image, video or PDF"
                            className="p-2 text-white/80 hover:text-teal-50 rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 hover:bg-[#222] hover:shadow-[2px_2px_0_0_#444]"
                        >
                            <Paperclip className="w-4 h-4" />
                        </button>

                        <button
                            onClick={async () => {
                                setIsGraphicsPickerOpen(true);
                                setGraphicsLoading(true);
                                try {
                                    const res = await fetch(`${API_BASE_URL}/api/design/jobs`, {
                                        headers: { 'Authorization': `Bearer ${authToken}` }
                                    });
                                    const data = await res.json();
                                    setGraphicsJobs(data.jobs || []);
                                } catch { /* non-critical */ } finally {
                                    setGraphicsLoading(false);
                                }
                            }}
                            title="Import image from Graphics AI"
                            className="p-2 text-white/80 hover:text-[#26cece] rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 hover:bg-[#222] font-mono text-[11px] uppercase tracking-widest border border-transparent hover:border-white/20"
                        >
                            <ImageIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">AI Art</span>
                        </button>

                        <select
                            value={postVisibility}
                            onChange={e => setPostVisibility(e.target.value)}
                            className="bg-white/10 border border-white/10 text-teal-50 font-mono text-[10px] uppercase tracking-widest rounded-2xl px-2.5 py-1.5 focus:outline-none focus:border-[#26cece] cursor-pointer"
                        >
                            <option value="PUBLIC">Public</option>
                            <option value="CONNECTIONS">Connections only</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            setPostStatus(null);
                            setPreviewStep(1);
                            setWaShare({ enabled: false, mode: 'link', phone: '', sending: false, sent: false, copied: false, opened: false, error: null });
                            setIsPreviewOpen(true);
                        }}
                        disabled={!postText.trim() || postTargets.length === 0}
                        className="bg-[#26cece] text-[#115e59] px-5 py-2.5 rounded-full font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#444] transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        <Send className="w-4 h-4 mr-2" /> Preview & Publish
                    </button>
                </div>
            </div>

            {/* Platform / profile selection */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-white/60 uppercase shrink-0">Post to:</span>
                {connectedProfiles.map(profile => {
                    const selected = isPostTarget(profile);
                    const activeStyle = 'bg-[#26cece]/10 border-[#26cece] text-[#26cece]';
                    const inactiveStyle = 'bg-white/5 backdrop-blur-md border-white/10 text-white/60 hover:text-teal-50 hover:border-white/20';
                    return (
                        <button
                            key={profile.profileId || profile.name}
                            onClick={() => togglePostTarget(profile)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono uppercase tracking-widest text-[11px] border transition-all cursor-pointer ${selected ? activeStyle : inactiveStyle}`}
                        >
                            {profile.platform === 'linkedin' && <Linkedin className="w-3 h-3" />}
                            {profile.platform === 'twitter' && <XIcon className="w-3 h-3" />}
                            {profile.platform === 'facebook' && <Facebook className="w-3 h-3" />}
                            {profile.platform === 'instagram' && <Instagram className="w-3 h-3" />}
                            <span className="truncate max-w-[100px]">{profile.name}</span>
                            {selected && <Check className="w-3 h-3 shrink-0" />}
                        </button>
                    );
                })}
                {postTargets.length === 0 && (
                    <span className="text-[10px] font-mono tracking-widest text-[#FFCA4A] uppercase">Select at least one profile</span>
                )}
            </div>

            {/* Status message */}
            {postStatus && (
                <div className={`mt-3 px-4 py-3 rounded-full font-mono text-[11px] uppercase tracking-widest flex items-center gap-2 ${postStatus.type === 'success' ? 'bg-[#26cece]/10 border border-[#26cece] text-[#26cece]' : 'bg-[#FF4A4A]/10 border border-[#FF4A4A] text-[#FF4A4A]'}`}>
                    {postStatus.type === 'success' ? '✓' : '✕'} {postStatus.message}
                </div>
            )}
        </div>
    );
};

export default PostComposer;
