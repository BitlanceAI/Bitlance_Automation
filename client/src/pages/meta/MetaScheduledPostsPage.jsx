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
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-800 flex items-center justify-center">
                    <CalendarClock className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Not Connected</h3>
                <p className="text-gray-400 mb-6 max-w-xs">Connect your Meta account first to manage scheduled posts.</p>
                <button onClick={() => setShowConnectModal(true)} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors text-sm">
                    Connect Account
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Scheduled Posts</h2>
                    <p className="text-gray-400 text-sm mt-1">{scheduledPosts.length} post{scheduledPosts.length !== 1 ? 's' : ''} queued</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg shadow-blue-500/25 text-sm"
                >
                    <Calendar className="h-4 w-4" />Schedule Post
                </button>
            </div>

            {scheduledPosts.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/40 rounded-3xl border border-slate-700/50">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-slate-800 flex items-center justify-center">
                        <CalendarClock className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Scheduled Posts</h3>
                    <p className="text-gray-400 max-w-xs mx-auto mb-6">Schedule your first post to see it here.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors text-sm"
                    >
                        <Calendar className="h-4 w-4" />Schedule Post
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {scheduledPosts.map(post => {
                        const statusConfig = getStatusConfig(post.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                            <div key={post.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{post.content || '(No text)'}</p>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
                                        <span>{post.page_name}</span>
                                        <span>•</span>
                                        <span>{new Date(post.scheduled_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {statusConfig.label}
                                    </div>
                                    {post.status === 'pending' && (
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 rounded-lg hover:bg-red-900/30 text-red-400 transition-colors"
                                            title="Delete"
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
