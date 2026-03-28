import React, { useState } from 'react';
import {
    CalendarClock, X, Calendar, CheckCircle2, Clock, AlertCircle,
    PlayCircle, PauseCircle
} from 'lucide-react';
import { useMetaAds } from './MetaAdsLayout';
import {
    SchedulePostModal,
    StepAccount,
    StepContent,
    StepSchedule,
    StepAdvanced,
    StepReview
} from '../../components/meta';

const getStatusConfig = (status) => {
    const configs = {
        ACTIVE: { icon: PlayCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' },
        PAUSED: { icon: PauseCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Paused' },
        SCHEDULED: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Scheduled' },
        pending: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Pending' },
        published: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Published' },
        failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
    };
    return configs[status] || configs.pending;
};

const MetaScheduledPostsPage = () => {
    const {
        scheduledPosts, connection, isConnected, setShowConnectModal,
        getAuthHeaders, loadScheduledPosts, API_BASE
    } = useMetaAds();

    // Wizard state (local to this page)
    const [showModal, setShowModal] = useState(false);
    const [scheduleStep, setScheduleStep] = useState(1);
    const [uploadMode, setUploadMode] = useState('file');
    const [formData, setFormData] = useState({
        pageId: '', content: '', mediaUrls: [], mediaFiles: [],
        linkUrl: '', hashtags: '', scheduledTime: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        recurring: false, recurringFrequency: 'weekly',
        targetAudience: { ageMin: 18, ageMax: 65, location: '' }
    });

    const updateForm = (updates) => setFormData(prev => ({ ...prev, ...updates }));

    const validateStep = (step) => {
        if (step === 1 && !formData.pageId) return 'Please select a page';
        if (step === 2 && !formData.content && !formData.mediaUrls[0] && !formData.mediaFiles.length) return 'Please add content or media';
        if (step === 3 && !formData.scheduledTime) return 'Please select a schedule time';
        return true;
    };

    const handleDelete = async (postId) => {
        if (!confirm('Delete this scheduled post?')) return;
        try {
            await fetch(`${API_BASE}/api/meta/posts/${postId}`, { method: 'DELETE', headers: getAuthHeaders() });
            await loadScheduledPosts();
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!formData.pageId || (!formData.content && !formData.mediaUrls[0] && !formData.mediaFiles.length) || !formData.scheduledTime) {
            return;
        }
        try {
            let finalMediaUrls = formData.mediaUrls.filter(u => u.trim() !== '' && !u.startsWith('blob:'));

            if (formData.mediaFiles.length > 0 && uploadMode === 'file') {
                const fd = new FormData();
                formData.mediaFiles.forEach(file => fd.append('files', file));
                const headers = getAuthHeaders();
                delete headers['Content-Type'];
                const uploadRes = await fetch(`${API_BASE}/api/meta/posts/upload-media`, { method: 'POST', headers, body: fd });
                const uploadData = await uploadRes.json();
                if (!uploadData.success) throw new Error(uploadData.error || 'Upload failed');
                finalMediaUrls = uploadData.urls;
            }

            const utcTime = new Date(formData.scheduledTime).toISOString();
            const res = await fetch(`${API_BASE}/api/meta/posts/schedule`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...formData, scheduledTime: utcTime, mediaUrls: finalMediaUrls })
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setScheduleStep(1);
                setFormData({
                    pageId: '', content: '', mediaUrls: [], mediaFiles: [],
                    linkUrl: '', hashtags: '', scheduledTime: '',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    recurring: false, recurringFrequency: 'weekly',
                    targetAudience: { ageMin: 18, ageMax: 65, location: '' }
                });
                setUploadMode('file');
                await loadScheduledPosts();
            }
        } catch (e) { console.error(e); }
    };

    if (!isConnected) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center bg-[#070707] font-mono">
                <div className="w-20 h-20 mb-6 bg-[#111111] border border-[#333] flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform shadow-[4px_4px_0_0_#26cece]">
                    <CalendarClock className="h-10 w-10 text-[#26cece]" />
                </div>
                <h3 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight mb-2">Not Connected</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">&gt; Connect your Meta account first to manage scheduled posts.</p>
                <button onClick={() => setShowConnectModal(true)} className="px-6 py-3 rounded-[2px] bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] border border-[#070707] hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-1 transition-all">
                    Initialize Connection
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-[#333] pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-white font-['Space_Grotesk'] uppercase tracking-tight">Scheduled Transmissions</h2>
                    <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-1">&gt; {scheduledPosts.length} packet{scheduledPosts.length !== 1 ? 's' : ''} queued in buffer</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex flex-row items-center gap-2 px-5 py-3 rounded-[2px] bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] border border-[#070707] hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-1 transition-all"
                >
                    <Calendar className="h-4 w-4" /> Queue Transmission
                </button>
            </div>

            {scheduledPosts.length === 0 ? (
                <div className="text-center py-20 bg-[#111111] border border-dashed border-[#333] relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <div className="relative z-10 w-20 h-20 mx-auto mb-6 bg-[#070707] border border-[#333] flex items-center justify-center transform rotate-3 shadow-[4px_4px_0_0_#333] group-hover:border-[#26cece] group-hover:shadow-[4px_4px_0_0_#26cece] transition-all">
                        <CalendarClock className="h-8 w-8 text-gray-600 group-hover:text-[#26cece] transition-colors" />
                    </div>
                    <h3 className="relative z-10 text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight mb-2">Buffer Empty</h3>
                    <p className="relative z-10 text-gray-500 font-mono text-sm max-w-sm mx-auto mb-6">&gt; Schedule your first post transmission to populate the queue.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-[2px] bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] border border-[#070707] hover:-translate-y-1 shadow-[4px_4px_0_0_#333] transition-all"
                    >
                        <Calendar className="h-4 w-4" /> Queue Transmission
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {scheduledPosts.map(post => {
                        const statusConfig = getStatusConfig(post.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                            <div key={post.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#070707] border border-[#333] hover:border-[#26cece] hover:shadow-[4px_4px_0_0_#26cece] hover:-translate-y-1 transition-all gap-4">
                                <div className="flex-1 min-w-0 border-l-2 border-transparent group-hover:border-[#26cece] pl-3">
                                    <p className="font-extrabold font-['Space_Grotesk'] text-lg text-white truncate tracking-tight uppercase">{post.content || '(No text)'}</p>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono tracking-widest uppercase text-gray-500 flex-wrap">
                                        <span>TARGET: {post.page_name}</span>
                                        <span className="text-[#333]">/</span>
                                        <span>ETA: {new Date(post.scheduled_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center bg-[#111111] border border-[#1E1E1E] p-3 gap-4 shrink-0">
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 border text-[10px] uppercase font-mono tracking-widest font-bold ${statusConfig.bg === 'bg-emerald-500/10' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30' : statusConfig.bg === 'bg-amber-500/10' ? 'border-amber-500 text-amber-400 bg-amber-950/30' : statusConfig.bg === 'bg-red-500/10' ? 'border-red-500 text-red-400 bg-red-950/30' : 'border-blue-500 text-blue-400 bg-blue-950/30'}`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {statusConfig.label}
                                    </div>
                                    {post.status === 'pending' && (
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 border border-[#333] hover:border-red-500 hover:bg-red-500 hover:text-[#070707] text-gray-400 transition-colors"
                                            title="Abort Transmission"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Schedule Wizard Modal */}
            <SchedulePostModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setScheduleStep(1); }}
                currentStep={scheduleStep}
                setCurrentStep={setScheduleStep}
                onSubmit={handleSubmit}
                onValidate={validateStep}
            >
                {scheduleStep === 1 && (
                    <StepAccount
                        pages={connection?.pages || []}
                        selectedPageId={formData.pageId}
                        onSelect={(pageId) => updateForm({ pageId })}
                    />
                )}
                {scheduleStep === 2 && (
                    <StepContent
                        content={formData.content}
                        linkUrl={formData.linkUrl}
                        mediaUrls={formData.mediaUrls}
                        mediaFiles={formData.mediaFiles}
                        onContentChange={(content) => updateForm({ content })}
                        onLinkChange={(linkUrl) => updateForm({ linkUrl })}
                        onMediaUpdate={(updates) => updateForm(updates)}
                        getAuthHeaders={getAuthHeaders}
                        apiBase={API_BASE}
                    />
                )}
                {scheduleStep === 3 && (
                    <StepSchedule
                        scheduledTime={formData.scheduledTime}
                        onScheduleChange={(scheduledTime) => updateForm({ scheduledTime })}
                    />
                )}
                {scheduleStep === 4 && (
                    <StepAdvanced
                        targetAudience={formData.targetAudience}
                        callToAction={formData.callToAction}
                        onTargetChange={(targetAudience) => updateForm({ targetAudience })}
                        onCtaChange={(callToAction) => updateForm({ callToAction })}
                    />
                )}
                {scheduleStep === 5 && (
                    <StepReview formData={formData} pages={connection?.pages || []} />
                )}
            </SchedulePostModal>
        </div>
    );
};

export default MetaScheduledPostsPage;
