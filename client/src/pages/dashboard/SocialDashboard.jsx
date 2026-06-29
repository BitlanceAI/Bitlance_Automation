import React, { useState, useRef, useEffect } from 'react'; // Force save 6
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_BASE_URL from '../../config.js';
import WorkspaceSwitcher from '../../components/workspace/WorkspaceSwitcher';
import { Menu, Edit2, Layers, Sparkles, CalendarCheck, Star, CalendarDays, Zap } from 'lucide-react';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);
// Import views
import CalendarView from '../../components/social/CalendarView';
import AITemplatesView from '../../components/social/AITemplatesView';
import CreateWithAIView from '../../components/social/CreateWithAIView';
import PlanWeeklyAIView from '../../components/social/PlanWeeklyAIView';
import SpecialDaysAIView from '../../components/social/SpecialDaysAIView';
import TwitterThreadBuilderView from '../../components/social/TwitterThreadBuilderView';
import UploadCSVView from '../../components/social/UploadCSVView';
import InboxView from '../../components/social/InboxView';
import SchedulePostView from '../../components/social/SchedulePostView';
import GraphicsAIView from '../../components/social/GraphicsAIView';
import AgentSettingsView from '../../components/social/AgentSettingsView';
import HumanReviewView from '../../components/social/HumanReviewView';
import CommentsView from '../../components/social/CommentsView';

// Import extracted dashboard components
import Sidebar from '../../components/social/dashboard/Sidebar';
import PostComposer from '../../components/social/dashboard/PostComposer';
import PerformanceStats from '../../components/social/dashboard/PerformanceStats';
import SocialProfilesView from '../../components/social/dashboard/SocialProfilesView';
import {
    AddProfileModal,
    PostPreviewModal,
    TrendingTopicsModal,
    GraphicsAIPickerModal
} from '../../components/social/dashboard/Modals';

const SocialDashboard = () => {
    const { user, session } = useAuth();
    const { workspaceHeaders, loading: workspaceLoading, activeWorkspace } = useWorkspace();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const shareMenuItems = [
        { id: 'share', icon: Edit2, label: 'Create a Post Manually', description: 'Write, schedule and publish your post directly to your social profiles' },
        { id: 'upload_csv', icon: Layers, label: 'Upload CSV file', description: 'Bulk schedule posts using a spreadsheet template' },
        { id: 'create_ai', icon: Sparkles, label: 'Create a Post with AI', description: 'Let AI generate a high-converting post for your audience' },
        { id: 'plan_weekly', icon: CalendarCheck, label: 'Plan Weekly Posts with AI', description: 'Automatically generate a full week of content' },
        { id: 'ai_templates', icon: Star, label: 'Use AI Templates', description: 'Start from proven, high-performing post structures' },
        { id: 'special_days', icon: CalendarDays, label: 'Special Days Posts (AI)', description: 'Create content for upcoming holidays and events' },
        { id: 'twitter_thread', icon: XIcon, label: 'X (Twitter) Thread Builder', description: 'Craft engaging threads with automatic splitting' },
        { id: 'smart_schedule', icon: Zap, label: 'Smart Post Scheduler (AI)', description: 'Let AI determine the best times to post' },
        { id: 'approval_queue', icon: CalendarCheck, label: 'Agent Approval Queue', description: 'Review, edit, and approve AI-generated posts' },
    ];
    
    // UI State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [isLibraryMenuOpen, setIsLibraryMenuOpen] = useState(false);
    const [activeView, setActiveView] = useState('share_menu'); // 'share_menu', 'share', 'profiles', 'calendar', etc.
    const [isAddProfileModalOpen, setIsAddProfileModalOpen] = useState(false);
    
    // Data State
    const [connectedProfiles, setConnectedProfiles] = useState([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
    const [recentPosts, setRecentPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [statsDays, setStatsDays] = useState(7);
    const [postSuccessCount, setPostSuccessCount] = useState(0);

    // Post Composer State
    const [postText, setPostText] = useState('');
    const [selectedProfileIds, setSelectedProfileIds] = useState([]);
    const [postVisibility, setPostVisibility] = useState('PUBLIC');
    const [isPosting, setIsPosting] = useState(false);
    const [postStatus, setPostStatus] = useState(null);
    const [mediaAttachment, setMediaAttachment] = useState(null);
    const fileInputRef = useRef(null);

    // Preview / Share State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewStep, setPreviewStep] = useState(1);
    const [postTargets, setPostTargets] = useState([]);
    const [waShare, setWaShare] = useState({ enabled: false, mode: 'link', phone: '', sending: false, sent: false, copied: false, opened: false, error: null });

    // Scheduling State
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');
    const [approverPhone, setApproverPhone] = useState(user?.user_metadata?.phone || '');

    // AI Write State
    const [isAiWriteOpen, setIsAiWriteOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiTone, setAiTone] = useState('professional');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    // AI Graphics Generate State
    const [isGraphicsGenerateOpen, setIsGraphicsGenerateOpen] = useState(false);
    const [graphicsPrompt, setGraphicsPrompt] = useState('');
    const [isGraphicsGenerating, setIsGraphicsGenerating] = useState(false);
    const [isGraphicsPickerOpen, setIsGraphicsPickerOpen] = useState(false);
    const [graphicsLoading, setGraphicsLoading] = useState(false);
    const [graphicsJobs, setGraphicsJobs] = useState([]);

    // Trending Modal State
    const [isTrendingModalOpen, setIsTrendingModalOpen] = useState(false);
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(false);
    const [trendingNiche, setTrendingNiche] = useState('technology');

    const authToken = session?.access_token;
    const userName = user?.user_metadata?.full_name || user?.email || 'User';

    useEffect(() => {
        if (!authToken) return;
        fetchProfiles();
        fetchLinkedInStats(7);
    }, [authToken, postSuccessCount]);

    const oauthHandledRef = useRef(false);

    // Handle Meta OAuth callback: ?code=...&platform=meta
    useEffect(() => {
        const code = searchParams.get('code');
        const platform = searchParams.get('platform');
        const connectPlatform = searchParams.get('connect_platform') || 'facebook';
        if (!code || !authToken) return;
        if (platform !== 'meta' && platform !== 'instagram_business') return;
        if (oauthHandledRef.current) return;
        oauthHandledRef.current = true;

        // Clean URL immediately so refresh doesn't re-trigger
        setSearchParams({}, { replace: true });

        const endpoint = platform === 'instagram_business'
            ? `${API_BASE_URL}/api/meta/instagram/connect`
            : `${API_BASE_URL}/api/meta/connect`;

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                ...workspaceHeaders
            },
            body: JSON.stringify(platform === 'instagram_business' ? { code } : { code, connect_platform: connectPlatform })
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setPostSuccessCount(c => c + 1); // triggers fetchProfiles
                } else {
                    console.error('Meta connect failed:', data.error);
                    alert('Meta connection failed: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(err => console.error('Meta connect error:', err));
    }, [searchParams, authToken]);

    const fetchProfiles = async () => {
        setIsLoadingProfiles(true);
        try {
            const [linkedinRes, metaRes, twitterRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/linkedin/connection`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
                fetch(`${API_BASE_URL}/api/meta/connection`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
                fetch(`${API_BASE_URL}/api/twitter/connection`, { headers: { 'Authorization': `Bearer ${authToken}` } })
            ]);

            const [linkedinData, metaData, twitterData] = await Promise.all([
                linkedinRes.ok ? linkedinRes.json() : null,
                metaRes.ok ? metaRes.json() : null,
                twitterRes.ok ? twitterRes.json() : null
            ]);

            const profiles = [];
            
            if (linkedinData?.connected && linkedinData.profiles) {
                linkedinData.profiles.forEach(p => {
                    profiles.push({ 
                        platform: 'linkedin', 
                        type: 'Personal Profile', 
                        name: p.name, 
                        avatar: p.profilePicture, 
                        followers: '0', 
                        profileId: p.profileId 
                    });
                });
            }
            
            if (metaData?.connected && metaData.profiles) {
                metaData.profiles.forEach(p => {
                    profiles.push({ 
                        platform: p.platform || 'facebook', 
                        type: p.type || (p.platform === 'instagram' ? 'Instagram Business' : 'Facebook Page'), 
                        name: p.name, 
                        avatar: p.profilePicture, 
                        followers: '0', 
                        profileId: p.profileId 
                    });
                });
            }
            
            if (twitterData?.connected && twitterData.profiles) {
                twitterData.profiles.forEach(p => {
                    profiles.push({ 
                        platform: 'twitter', 
                        type: 'X (Twitter) Profile', 
                        name: p.name, 
                        username: p.username, 
                        avatar: p.profilePicture, 
                        followers: '0', 
                        profileId: p.twitterUserId 
                    });
                });
            }
            
            setConnectedProfiles(profiles);
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setIsLoadingProfiles(false);
        }
    };

    const fetchLinkedInStats = async (days) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/linkedin/stats?days=${days}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setRecentPosts(data.recentPosts || []);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    // Make fetchLinkedInStats available globally for PerformanceStats component
    window._fetchLinkedInStats = fetchLinkedInStats;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let category = 'DOCUMENT';
        if (file.type.startsWith('image/')) category = 'IMAGE';
        else if (file.type.startsWith('video/')) category = 'VIDEO';

        if (category === 'IMAGE') {
            const reader = new FileReader();
            reader.onloadend = () => setMediaAttachment({ file, preview: reader.result, mediaCategory: category });
            reader.readAsDataURL(file);
        } else {
            setMediaAttachment({ file, preview: null, mediaCategory: category });
        }
    };

    const removeAttachment = () => {
        setMediaAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDisconnect = async (profile) => {
        if (!window.confirm(`Are you sure you want to disconnect ${profile.name}?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/${profile.platform}/disconnect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify(profile.platform === 'facebook' || profile.platform === 'instagram' ? { pageId: profile.id } : {})
            });
            const data = await res.json();
            if (data.success) fetchProfiles();
            else alert(data.error || `Failed to disconnect ${profile.platform}`);
        } catch (err) {
            console.error('Disconnect error:', err);
            alert('An error occurred while disconnecting');
        }
    };

    const handleAiWrite = async () => {
        setIsAiLoading(true);
        setAiError(null);
        try {
            const promptText = postText.trim() ? `Rewrite the following social media post to make it more engaging. Tone: ${aiTone}. Post: "${postText}"` : `Write an engaging social media post about: "${aiPrompt}". Tone: ${aiTone}. Use relevant emojis and hashtags.`;
            const res = await fetch(`${API_BASE_URL}/api/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ prompt: promptText })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate');
            setPostText(data.text);
            setIsAiWriteOpen(false);
            setAiPrompt('');
        } catch (err) {
            setAiError(err.message);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleFetchTrending = async () => {
        setIsTrendingLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ prompt: `List 5 highly viral and trending topics right now in the "${trendingNiche}" space for social media. Format as JSON array of objects with keys: title, context, hashtags (array of strings).` })
            });
            const data = await res.json();
            if (!res.ok) throw new Error();
            const cleanStr = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
            const topics = JSON.parse(cleanStr);
            setTrendingTopics(topics);
        } catch (err) {
            setTrendingTopics([{ title: `Top 3 AI tools for ${trendingNiche}`, context: `Everyone is talking about how AI is transforming ${trendingNiche}. Let's break down the top tools.`, hashtags: ['AI', trendingNiche.replace(' ', ''), 'Tech'] }]);
        } finally {
            setIsTrendingLoading(false);
        }
    };

    const handleSendWhatsAppPreview = async () => {
        if (waShare.phone.length < 10) return;
        setWaShare(w => ({ ...w, sending: true, error: null }));
        try {
            const payload = {
                to: waShare.phone,
                message: `*Draft Preview*\n\n${postText}`
            };
            if (mediaAttachment && mediaAttachment.mediaCategory === 'IMAGE' && mediaAttachment.preview) {
                payload.mediaUrl = mediaAttachment.preview;
                payload.type = 'image';
            } else {
                payload.type = 'text';
            }

            const res = await fetch(`${API_BASE_URL}/api/whatsapp/send`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${authToken}`,
                    ...workspaceHeaders 
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setWaShare(w => ({ ...w, sending: false, sent: true }));
                setTimeout(() => setWaShare(w => ({ ...w, sent: false })), 3000);
            } else throw new Error(data.error || 'Failed to send WhatsApp preview');
        } catch (err) {
            setWaShare(w => ({ ...w, sending: false, error: err.message }));
        }
    };

    const toggleProfileSelection = (id) => {
        setSelectedProfileIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
    };

    const isPostTarget = (profile) => {
        const key = profile.profileId || profile.name;
        return postTargets.some(p => (p.profileId || p.name) === key);
    };

    const togglePostTarget = (profile) => {
        const key = profile.profileId || profile.name;
        setPostTargets(prev => {
            const exists = prev.find(p => (p.profileId || p.name) === key);
            return exists ? prev.filter(p => (p.profileId || p.name) !== key) : [...prev, profile];
        });
    };

    const handleGraphicSelect = async (imageUrl) => {
        try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            const file = new File([blob], `ai-graphic-${Date.now()}.jpg`, { type: blob.type });
            const reader = new FileReader();
            reader.onloadend = () => setMediaAttachment({ file, preview: reader.result, mediaCategory: 'IMAGE' });
            reader.readAsDataURL(file);
            setIsGraphicsPickerOpen(false);
        } catch (err) {
            alert('Failed to attach generated image');
        }
    };

    const handlePost = async () => {
        if (!postText.trim() || postTargets.length === 0) return;
        setIsPosting(true);
        setPostStatus(null);
        let successCount = 0;
        let errors = [];

        try {
            // 1. Pre-upload media for Meta/Twitter if needed (they need a public URL)
            let publicMediaUrl = null;
            if (mediaAttachment && postTargets.some(t => ['facebook', 'instagram', 'twitter'].includes(t.platform))) {
                if (mediaAttachment.preview && mediaAttachment.preview.startsWith('http')) {
                    publicMediaUrl = mediaAttachment.preview;
                } else if (mediaAttachment.file) {
                    try {
                        const uploadData = new FormData();
                        uploadData.append('file', mediaAttachment.file);
                        const uploadRes = await fetch(`${API_BASE_URL}/api/campaigns/upload`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${authToken}`, ...workspaceHeaders },
                            body: uploadData
                        });
                        const uploadJson = await uploadRes.json();
                        if (uploadJson.success) {
                            publicMediaUrl = uploadJson.url;
                        } else {
                            console.warn("Failed to upload media to public storage:", uploadJson.error);
                        }
                    } catch (err) {
                        console.error("Failed to upload media:", err);
                    }
                }
            }

            if (isScheduling) {
                const endpoint = `${API_BASE_URL}/api/social/schedule`;
                const payload = {
                    text: postText,
                    platforms: postTargets.map(t => t.platform),
                    profileIds: postTargets.map(t => t.profileId || t.id || 'urn:li:person:me'),
                    scheduledAt: new Date(scheduledAt).toISOString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    approverPhone
                };
                if (publicMediaUrl) {
                    payload.mediaUrl = publicMediaUrl;
                    payload.mediaCategory = mediaAttachment?.mediaCategory || 'IMAGE';
                }
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json', ...workspaceHeaders },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    setPostStatus({ type: 'success', message: 'Post scheduled! Pending WhatsApp approval.' });
                    setPostSuccessCount(prev => prev + 1);
                    setPostText('');
                    setMediaAttachment(null);
                    setPostTargets([]);
                    setIsPreviewOpen(false);
                    // Reset scheduling state
                    setIsScheduling(false);
                    setScheduledAt('');
                } else {
                    errors.push(data.message || data.error || 'Scheduling failed');
                }
            } else {
                for (const target of postTargets) {
                    try {
                        let endpoint = '';
                        let payload = {};
                        let fetchOptions = {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${authToken}`, ...workspaceHeaders }
                        };

                        if (target.platform === 'linkedin') {
                            endpoint = `${API_BASE_URL}/api/linkedin/post`;
                            payload = {
                                profileId: target.profileId || 'urn:li:person:me',
                                text: postText,
                                visibility: postVisibility
                            };
                            
                            // LinkedIn needs its own direct upload to get an assetUrn
                            if (mediaAttachment && mediaAttachment.file) {
                                try {
                                    const liUploadData = new FormData();
                                    liUploadData.append('file', mediaAttachment.file);
                                    liUploadData.append('profileId', payload.profileId);
                                    liUploadData.append('mediaCategory', mediaAttachment.mediaCategory || 'IMAGE');
                                    
                                    const liUploadRes = await fetch(`${API_BASE_URL}/api/linkedin/upload-media`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${authToken}`, ...workspaceHeaders },
                                        body: liUploadData
                                    });
                                    const liUploadJson = await liUploadRes.json();
                                    if (liUploadJson.success && liUploadJson.assetUrn) {
                                        payload.assetUrn = liUploadJson.assetUrn;
                                        payload.mediaCategory = liUploadJson.mediaCategory;
                                    }
                                } catch (err) {
                                    console.error("LinkedIn media upload failed:", err);
                                }
                            }

                            fetchOptions.headers['Content-Type'] = 'application/json';
                            fetchOptions.body = JSON.stringify(payload);

                        } else if (target.platform === 'facebook' || target.platform === 'instagram') {
                            endpoint = `${API_BASE_URL}/api/meta/post`;
                            payload = {
                                accountId: target.profileId || target.id,
                                platform: target.platform,
                                text: postText
                            };
                            
                            if (publicMediaUrl) {
                                payload.mediaUrl = publicMediaUrl;
                            }
                            
                            fetchOptions.headers['Content-Type'] = 'application/json';
                            fetchOptions.body = JSON.stringify(payload);

                        } else if (target.platform === 'twitter') {
                            endpoint = `${API_BASE_URL}/api/twitter/post`;
                            payload = {
                                text: postText
                            };
                            
                            // If backend ever supports passing mediaUrl to Twitter, pass it here
                            if (publicMediaUrl) {
                                payload.mediaUrl = publicMediaUrl; 
                            }

                            fetchOptions.headers['Content-Type'] = 'application/json';
                            fetchOptions.body = JSON.stringify(payload);
                        }

                        if (!endpoint) continue;

                        const res = await fetch(endpoint, fetchOptions);
                        const data = await res.json();
                        if (!res.ok) errors.push(`${target.platform}: ${res.statusText}`);
                        else if (!data.success) errors.push(`${target.platform}: ${data.error || 'Failed'}`);
                        else successCount++;
                    } catch (err) {
                        errors.push(`${target.platform}: ${err.message}`);
                    }
                }
            } // end of else (isScheduling)

            if (errors.length > 0) {
                setPostStatus({ type: 'success', message: `Successfully posted to ${successCount} profile(s)` });
                setPostText('');
                removeAttachment();
                setPostTargets([]);
                setIsPreviewOpen(false);
                setPostSuccessCount(prev => prev + 1);
            }
            if (errors.length > 0) {
                if (successCount === 0) {
                    setPostStatus({ type: 'error', message: `Failed: ${errors.join(', ')}` });
                } else {
                    alert(`Some posts failed:\n${errors.join('\n')}`);
                }
            }
        } catch (err) {
            setPostStatus({ type: 'error', message: err.message || 'Failed to publish post' });
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#115e59] overflow-hidden text-gray-100 font-sans relative">
            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar 
                    isSidebarCollapsed={isSidebarCollapsed}
                    setIsSidebarCollapsed={setIsSidebarCollapsed}
                    activeView={activeView}
                    setActiveView={(view) => {
                        setActiveView(view);
                        setIsMobileMenuOpen(false);
                    }}
                    userName={userName}
                    navigate={navigate}
                    isShareMenuOpen={isShareMenuOpen}
                    setIsShareMenuOpen={setIsShareMenuOpen}
                    isLibraryMenuOpen={isLibraryMenuOpen}
                    setIsLibraryMenuOpen={setIsLibraryMenuOpen}
                />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-[#222] bg-[#115e59] flex items-center justify-between px-4 md:px-6 shrink-0 relative z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            className="md:hidden text-white hover:text-[#26cece] transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <WorkspaceSwitcher />
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-transparent relative custom-scrollbar">
                    {/* Render different views based on state */}
                    {activeView === 'calendar' && <CalendarView />}
                    {activeView === 'create_ai' && <CreateWithAIView />}
                    {activeView === 'plan_weekly' && <PlanWeeklyAIView />}
                    {activeView === 'special_days' && <SpecialDaysAIView />}
                    {activeView === 'ai_templates' && <AITemplatesView />}
                    {activeView === 'upload_csv' && <UploadCSVView />}
                    {activeView === 'twitter_thread' && <TwitterThreadBuilderView />}
                    {activeView === 'smart_schedule' && (
                        <SchedulePostView 
                            connectedProfiles={connectedProfiles}
                            setPostText={setPostText}
                            setMediaAttachment={setMediaAttachment}
                            setIsPreviewOpen={setIsPreviewOpen}
                            setPostTargets={setPostTargets}
                            setPreviewStep={setPreviewStep}
                            postSuccessCount={postSuccessCount}
                            setIsScheduling={setIsScheduling}
                        />
                    )}
                    {activeView === 'inbox' && <InboxView />}
                    { activeView === 'graphics_ai' && <GraphicsAIView /> }
                    { activeView === 'agent_settings' && <AgentSettingsView setActiveView={setActiveView} /> }
                    { activeView === 'approval_queue' && <HumanReviewView /> }
                    { activeView === 'comments' && <CommentsView connectedProfiles={connectedProfiles} /> }
                    
                    {activeView === 'share_menu' && (
                        <div className="p-8 max-w-[1200px] mx-auto flex flex-col h-full overflow-y-auto">
                            <div className="mb-10 text-center relative">
                                <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] text-white tracking-tight uppercase mb-3">Create a Post</h1>
                                <p className="text-teal-50/80 font-mono tracking-widest text-sm uppercase">Choose how you want to create your content</p>
                                
                                <button 
                                    onClick={() => setActiveView('agent_settings')}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-4 py-2 bg-[#26cece]/10 text-[#26cece] hover:bg-[#26cece]/20 border border-[#26cece]/30 rounded-xl font-mono text-xs uppercase tracking-wider transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Agent Settings
                                </button>
                            </div>
                            
                            <div className="md:hidden flex justify-center mb-8">
                                <button 
                                    onClick={() => setActiveView('agent_settings')}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#26cece]/10 text-[#26cece] hover:bg-[#26cece]/20 border border-[#26cece]/30 rounded-xl font-mono text-xs uppercase tracking-wider transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Agent Settings
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {shareMenuItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveView(item.id)}
                                        className="flex flex-col items-center justify-center text-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#26cece]/50 hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(38,206,206,0.15)] transition-all duration-300 group"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-[#26cece]/10 flex items-center justify-center group-hover:bg-[#26cece]/20 transition-colors shrink-0">
                                            <item.icon className="w-7 h-7 text-[#26cece]" />
                                        </div>
                                        <div>
                                            <h3 className="text-[15px] font-bold font-['Space_Grotesk'] text-white mb-2">{item.label}</h3>
                                            <p className="text-[11px] font-mono text-white/50 leading-relaxed group-hover:text-white/70 transition-colors line-clamp-3">{item.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeView === 'profiles' && (
                        <SocialProfilesView 
                            connectedProfiles={connectedProfiles} 
                            setIsAddProfileModalOpen={setIsAddProfileModalOpen} 
                            handleDisconnect={handleDisconnect} 
                        />
                    )}

                    {activeView === 'share' && (
                        <div className="p-8 max-w-[1400px] mx-auto flex flex-col h-full overflow-y-auto">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-gray-100 tracking-tight uppercase">Social Dashboard</h1>
                                <p className="text-gray-400 font-mono mt-2 tracking-widest text-sm uppercase">Manage and publish content across your networks</p>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                                <PostComposer 
                                    linkedinProfiles={connectedProfiles.filter(p => p.platform === 'linkedin')}
                                    connectedProfiles={connectedProfiles}
                                    selectedProfileIds={selectedProfileIds}
                                    toggleProfileSelection={toggleProfileSelection}
                                    postText={postText}
                                    setPostText={setPostText}
                                    setPostStatus={setPostStatus}
                                    mediaAttachment={mediaAttachment}
                                    removeAttachment={removeAttachment}
                                    isAiWriteOpen={isAiWriteOpen}
                                    setIsAiWriteOpen={setIsAiWriteOpen}
                                    aiPrompt={aiPrompt}
                                    setAiPrompt={setAiPrompt}
                                    aiTone={aiTone}
                                    setAiTone={setAiTone}
                                    aiError={aiError}
                                    setAiError={setAiError}
                                    handleAiWrite={handleAiWrite}
                                    isAiLoading={isAiLoading}
                                    isGraphicsGenerateOpen={isGraphicsGenerateOpen}
                                    setIsGraphicsGenerateOpen={setIsGraphicsGenerateOpen}
                                    graphicsPrompt={graphicsPrompt}
                                    setGraphicsPrompt={setGraphicsPrompt}
                                    isGraphicsGenerating={isGraphicsGenerating}
                                    setIsGraphicsGenerating={setIsGraphicsGenerating}
                                    setIsGraphicsPickerOpen={setIsGraphicsPickerOpen}
                                    setGraphicsLoading={setGraphicsLoading}
                                    setGraphicsJobs={setGraphicsJobs}
                                    setIsTrendingModalOpen={setIsTrendingModalOpen}
                                    handleFetchTrending={handleFetchTrending}
                                    fileInputRef={fileInputRef}
                                    handleFileSelect={handleFileSelect}
                                    postVisibility={postVisibility}
                                    setPostVisibility={setPostVisibility}
                                    setPreviewStep={setPreviewStep}
                                    setWaShare={setWaShare}
                                    setIsPreviewOpen={setIsPreviewOpen}
                                    postTargets={postTargets}
                                    togglePostTarget={togglePostTarget}
                                    isPostTarget={isPostTarget}
                                    postStatus={postStatus}
                                    authToken={authToken}
                                />
                                
                                <div>
                                    <PerformanceStats 
                                        recentPosts={recentPosts}
                                        stats={stats}
                                        statsDays={statsDays}
                                        setStatsDays={setStatsDays}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <AddProfileModal 
                isAddProfileModalOpen={isAddProfileModalOpen}
                setIsAddProfileModalOpen={setIsAddProfileModalOpen}
                authToken={authToken}
            />
            
            <PostPreviewModal 
                isPreviewOpen={isPreviewOpen}
                setIsPreviewOpen={setIsPreviewOpen}
                previewStep={previewStep}
                setPreviewStep={setPreviewStep}
                postTargets={postTargets}
                setPostTargets={setPostTargets}
                connectedProfiles={connectedProfiles}
                postText={postText}
                mediaAttachment={mediaAttachment}
                postVisibility={postVisibility}
                isPosting={isPosting}
                handlePost={handlePost}
                postSuccessCount={postSuccessCount}
                waShare={waShare}
                setWaShare={setWaShare}
                handleSendWhatsAppPreview={handleSendWhatsAppPreview}
                isScheduling={isScheduling}
                setIsScheduling={setIsScheduling}
                scheduledAt={scheduledAt}
                setScheduledAt={setScheduledAt}
                approverPhone={approverPhone}
                setApproverPhone={setApproverPhone}
                authToken={authToken}
            />

            <TrendingTopicsModal 
                isTrendingModalOpen={isTrendingModalOpen}
                setIsTrendingModalOpen={setIsTrendingModalOpen}
                isTrendingLoading={isTrendingLoading}
                trendingTopics={trendingTopics}
                trendingNiche={trendingNiche}
                setTrendingNiche={setTrendingNiche}
                handleFetchTrending={handleFetchTrending}
                setPostText={setPostText}
                setIsAiWriteOpen={setIsAiWriteOpen}
                setAiPrompt={setAiPrompt}
            />

            <GraphicsAIPickerModal 
                isGraphicsPickerOpen={isGraphicsPickerOpen}
                setIsGraphicsPickerOpen={setIsGraphicsPickerOpen}
                graphicsLoading={graphicsLoading}
                graphicsJobs={graphicsJobs}
                handleGraphicSelect={handleGraphicSelect}
            />

        </div>
    );
};

export default SocialDashboard;
