import React, { useState } from 'react';
import {
    Send,
    Calendar,
    Library,
    Users,
    Inbox,
    BarChart2,
    MessageSquare,
    HelpCircle,
    AlertCircle,
    MoreVertical,
    Plus,
    ChevronLeft,
    Rocket,
    TrendingUp,
    Facebook,
    Linkedin,
    Instagram,
    Edit2,
    Layers,
    Sparkles,
    CalendarCheck,
    Star,
    CalendarDays,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.webp';
import API_BASE_URL from '../config.js';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const SocialDashboard = () => {
    const { user, session } = useAuth();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [isAddProfileModalOpen, setIsAddProfileModalOpen] = useState(false);
    const [connectedProfiles, setConnectedProfiles] = useState([]);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
    const [activeView, setActiveView] = useState('share'); // 'share' or 'profiles'

    const authToken = session?.access_token;

    // Fetch existing connections and handle OAuth callback
    React.useEffect(() => {
        if (!authToken) return;

        const fetchConnections = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/linkedin/connection`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                if (data.connected && data.profiles) {
                    const mappedProfiles = data.profiles.map(p => ({
                        platform: 'linkedin',
                        profileId: p.profileId,
                        name: p.name,
                        type: 'LinkedIn Profile',
                        followers: 'Connected',
                        avatar: p.profilePicture
                    }));
                    setConnectedProfiles(prev => {
                        const others = prev.filter(p => p.platform !== 'linkedin');
                        return [...others, ...mappedProfiles];
                    });
                }
            } catch (error) {
                console.error('Error fetching connections:', error);
            } finally {
                setIsLoadingProfiles(false);
            }
        };

        const handleOAuthCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');

            if (code && state && state.startsWith('linkedin_connect')) {
                window.history.replaceState({}, document.title, window.location.pathname);
                setIsLoadingProfiles(true);

                try {
                    const response = await fetch(`${API_BASE_URL}/api/linkedin/connect`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ code })
                    });
                    const data = await response.json();
                    if (data.success) {
                        await fetchConnections();
                        setIsAddProfileModalOpen(false);
                    } else {
                        alert(`LinkedIn Connection Failed: ${data.error}`);
                        fetchConnections();
                    }
                } catch (error) {
                    console.error('Error connecting linkedin:', error);
                    alert('Error connecting LinkedIn account');
                    fetchConnections();
                }
            } else {
                fetchConnections();
            }
        };

        handleOAuthCallback();
    }, [authToken]);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    const sidebarItems = [
        { icon: Send, label: 'Share a post', view: 'share', path: '/dashboard' },
        { icon: Calendar, label: 'Calendar', view: null, path: '#' },
        { icon: Library, label: 'Libraries', view: null, path: '#' },
        { icon: Users, label: 'Social profiles', view: 'profiles', path: '#' },
        { icon: Inbox, label: 'Inbox', view: null, path: '#' },
        { icon: BarChart2, label: 'Reports', view: null, path: '#' },
        { icon: MessageSquare, label: 'DM automations', view: null, path: '#' },
    ];

    const shareMenuItems = [
        { icon: Edit2, label: 'Create a Post Manually' },
        { icon: Layers, label: 'Upload CSV file' },
        { divider: true },
        { icon: Sparkles, label: 'Create a Post with AI' },
        { icon: CalendarCheck, label: 'Plan Weekly Posts with AI' },
        { icon: Star, label: 'Use AI Templates' },
        { icon: CalendarDays, label: 'Special Days Posts (AI)' },
        { divider: true },
        { icon: XIcon, label: 'X (Twitter) Thread Builder' },
    ];

    const bottomItems = [
        { icon: HelpCircle, label: 'Help', path: '#' },
        { icon: AlertCircle, label: 'Report an Issue', path: '#' },
    ];

    // ─── Reusable profile card (list style, used in Profiles view) ───────────
    const ProfileListCard = ({ profile }) => (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-5 hover:border-slate-700 transition-colors">
            <div className="relative">
                {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-14 h-14 rounded-full object-cover border-2 border-slate-700" />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400 border-2 border-slate-700">
                        {profile.name?.charAt(0)}
                    </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md border-2 border-slate-900 ${profile.platform === 'linkedin' ? 'bg-[#0A66C2]' : 'bg-blue-600'}`}>
                    {profile.platform === 'linkedin' ? <Linkedin className="w-3 h-3 fill-current" /> : <Facebook className="w-3 h-3 fill-current" />}
                </div>
            </div>
            <div className="flex-1">
                <h3 className="text-white font-medium text-[16px]">{profile.name}</h3>
                <p className="text-slate-500 text-[13px] mt-0.5">{profile.type}</p>
                <div className="flex items-center gap-4 mt-2">
                    <span className="text-[12px] text-slate-400 flex items-center gap-1.5 bg-slate-800 rounded-full px-2.5 py-1">
                        {profile.platform === 'linkedin' ? <Linkedin className="w-3 h-3" /> : <Facebook className="w-3 h-3" />}
                        {profile.followers}
                    </span>
                    <span className="text-[12px] text-emerald-400 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        Active
                    </span>
                </div>
            </div>
            <button className="text-slate-500 hover:text-red-400 p-2 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10" title="Disconnect">
                <MoreVertical className="w-5 h-5" />
            </button>
        </div>
    );

    // ─── Reusable profile card (grid style, used in Share/dashboard view) ────
    const ProfileGridCard = ({ profile }) => (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-4 hover:border-slate-700 transition-colors">
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden shadow-sm flex items-center justify-center text-lg font-bold text-slate-400 border border-slate-700">
                    {profile.avatar
                        ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                        : profile.name.charAt(0)
                    }
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded flex items-center justify-center text-white shadow-md border-2 border-slate-900 ${profile.platform === 'linkedin' ? 'bg-[#0A66C2]' : 'bg-blue-600'}`}>
                    {profile.platform === 'linkedin' ? <Linkedin className="w-2.5 h-2.5 fill-current" /> : <Facebook className="w-2.5 h-2.5 fill-current" />}
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <h3 className="text-slate-200 font-medium text-[15px] truncate">{profile.name}</h3>
                <p className="text-slate-500 text-[12px] mt-0.5">{profile.type}</p>
                <div className="flex items-center gap-3 mt-3">
                    <span className="text-[12px] font-medium text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {profile.followers}
                    </span>
                </div>
            </div>
            <button className="text-slate-500 hover:text-white p-1 ml-auto shrink-0 transition-colors cursor-pointer">
                <MoreVertical className="w-4 h-4" />
            </button>
        </div>
    );

    // ─── Shared empty-state illustration ────────────────────────────────────
    const EmptyIllustration = () => (
        <div className="relative w-[340px] h-[240px] mb-8 flex justify-center items-center">
            <div className="absolute top-4 right-14 w-10 h-10 bg-blue-900/30 text-blue-400 rounded-[10px] flex items-center justify-center transform rotate-[15deg] shadow-sm z-10">
                <Facebook className="w-[20px] h-[20px]" />
            </div>
            <div className="absolute top-16 left-12 w-9 h-9 bg-pink-900/30 text-pink-400 rounded-full flex items-center justify-center transform -rotate-[15deg] shadow-sm z-10">
                <Instagram className="w-[18px] h-[18px]" />
            </div>
            <div className="absolute bottom-16 right-6 w-9 h-9 bg-blue-900/30 text-blue-400 rounded-[8px] flex items-center justify-center shadow-sm z-10 scale-90 rotate-[-5deg]">
                <Linkedin className="w-[18px] h-[18px]" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-24 h-24 text-indigo-500 flex items-center justify-center z-20 drop-shadow-2xl">
                <Rocket className="w-20 h-20 fill-current" />
            </div>
            <div className="absolute top-[22%] left-0 -translate-x-4 w-[120px] h-[68px] bg-slate-900 border border-slate-800 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-3 flex flex-col z-20">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">Conversions</div>
                <div className="text-[16px] text-indigo-400 font-extrabold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> 251K</div>
                <div className="mt-1.5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="w-[65%] bg-indigo-500 h-full rounded-full"></div>
                </div>
            </div>
            <div className="absolute bottom-6 right-6 w-[140px] h-[76px] bg-slate-900 border border-slate-800 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-3.5 flex flex-col z-20">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Result</span>
                    <span className="text-[13px] text-emerald-400 font-extrabold flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" /> 450K</span>
                </div>
                <div className="flex-1 w-full bg-slate-800/50 rounded mt-1.5 relative overflow-hidden flex items-end">
                    <div className="w-full h-[65%] bg-emerald-500 rounded-t-[3px] border-t border-emerald-400"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen font-sans overflow-hidden bg-slate-950">
            <div className="flex flex-1 overflow-hidden">

                {/* ── Sidebar ─────────────────────────────────────────────── */}
                <aside className={`flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 relative ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>

                    {/* Logo */}
                    <div className="h-16 flex items-center px-4 border-b border-slate-800 mt-2">
                        {!isSidebarCollapsed ? (
                            <div className="flex items-center gap-2 group">
                                <img
                                    src={Logo}
                                    alt="Bitlance.ai"
                                    className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<span class="text-xl font-bold text-indigo-400">Bitlance</span>';
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                                    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Nav items */}
                    <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3" style={{ overflow: 'visible' }}>
                        {sidebarItems.map((item, index) => (
                            <div key={index} className="relative">
                                <button
                                    onClick={() => {
                                        if (item.label === 'Share a post') {
                                            setIsShareMenuOpen(!isShareMenuOpen);
                                            setActiveView('share');
                                        } else if (item.view) {
                                            setActiveView(item.view);
                                            setIsShareMenuOpen(false);
                                        } else if (item.path !== '#') {
                                            navigate(item.path);
                                            setIsShareMenuOpen(false);
                                        }
                                    }}
                                    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-[14px] font-[500] transition-colors ${item.view && activeView === item.view
                                        ? 'bg-indigo-500/10 text-indigo-400'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${item.view && activeView === item.view ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    {!isSidebarCollapsed && <span>{item.label}</span>}
                                </button>

                                {/* Share post popup */}
                                {item.label === 'Share a post' && isShareMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsShareMenuOpen(false)} />
                                        <div className={`absolute top-0 z-50 w-[260px] bg-slate-900 border border-slate-700/50 shadow-2xl shadow-indigo-500/10 rounded-xl py-2 ${isSidebarCollapsed ? 'left-[calc(100%+16px)]' : 'left-[calc(100%+8px)]'}`}>
                                            {shareMenuItems.map((shareItem, idx) =>
                                                shareItem.divider ? (
                                                    <div key={idx} className="my-2 border-t border-slate-800" />
                                                ) : (
                                                    <button key={idx} className="flex items-center w-full px-4 py-2.5 hover:bg-slate-800 text-left transition-colors group">
                                                        <shareItem.icon className="w-[18px] h-[18px] mr-3 text-slate-400 group-hover:text-white transition-colors" />
                                                        <span className="text-[14px] font-[500] text-slate-300 group-hover:text-white transition-colors">{shareItem.label}</span>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        <div className="my-2 border-t border-slate-800 w-8 mx-auto" />

                        {bottomItems.map((item, index) => (
                            <button key={index} className="flex items-center w-full px-3 py-2.5 rounded-lg text-[14px] font-[500] text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} text-slate-400`} />
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                            </button>
                        ))}
                    </div>

                    {/* User profile */}
                    <div className="p-3 border-t border-slate-800">
                        <button className="flex items-center w-full p-2.5 rounded-lg hover:bg-slate-800 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                                <Users className="w-4 h-4" />
                            </div>
                            {!isSidebarCollapsed && (
                                <>
                                    <span className="ml-3 text-[14px] font-medium text-slate-300 truncate">{userName}</span>
                                    <MoreVertical className="w-4 h-4 ml-auto text-slate-500" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Collapse toggle */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="absolute right-0 top-16 translate-x-1/2 z-10 bg-slate-800 border border-slate-700 rounded-full p-0.5 text-indigo-400 hover:text-indigo-300 shadow-sm transition-transform hover:scale-110"
                    >
                        <ChevronLeft className={`w-[14px] h-[14px] transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </aside>

                {/* ── Main content ─────────────────────────────────────────── */}
                <main className="flex-1 flex flex-col relative w-full h-full overflow-y-auto bg-slate-950">

                    {activeView === 'profiles' ? (
                        /* ── PROFILES VIEW ─────────────────────────────────── */
                        <div className="flex-1 p-8 bg-slate-950 overflow-y-auto w-full">
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-semibold text-white">Social Profiles</h2>
                                        <p className="text-sm text-slate-400 mt-1">Manage your connected social media accounts</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddProfileModalOpen(true)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-500/20"
                                    >
                                        <Plus className="w-4 h-4" /> Add Profile
                                    </button>
                                </div>

                                {connectedProfiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <Users className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <h3 className="text-lg text-slate-300 font-medium mb-2">No profiles connected yet</h3>
                                        <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">Connect your LinkedIn or Facebook account to start managing your social media.</p>
                                        <button
                                            onClick={() => setIsAddProfileModalOpen(true)}
                                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" /> Connect a profile
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {connectedProfiles.map((profile, idx) => (
                                            <ProfileListCard key={idx} profile={profile} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    ) : connectedProfiles.length === 0 ? (
                        /* ── SHARE VIEW — empty state ───────────────────────── */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
                            <EmptyIllustration />
                            <h3 className="text-[28px] leading-[36px] font-normal text-white mb-3 text-center tracking-tight">
                                You haven&apos;t connected any social profiles<br />yet.
                            </h3>
                            <p className="text-[15px] text-slate-400 text-center mb-8 max-w-[440px] leading-relaxed">
                                Connect your Meta or LinkedIn account to start boosting your posts with Paid Ads.
                            </p>
                            <button
                                onClick={() => setIsAddProfileModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/50 text-white px-5 py-[11px] rounded-[8px] flex items-center text-[14px] font-[500] shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                            >
                                <Plus className="w-[20px] h-[20px] mr-2" />
                                Add social profiles
                            </button>
                        </div>

                    ) : (
                        /* ── SHARE VIEW — dashboard ─────────────────────────── */
                        <div className="flex-1 p-8 bg-slate-950 overflow-y-auto w-full">
                            <div className="max-w-5xl mx-auto space-y-8">

                                {/* Connected profiles grid */}
                                <div>
                                    <div className="flex justify-between items-center mb-5">
                                        <h2 className="text-xl font-semibold text-white">Connected Profiles</h2>
                                        <button
                                            onClick={() => setIsAddProfileModalOpen(true)}
                                            className="text-[13px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium bg-indigo-500/10 hover:bg-indigo-500/20 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" /> Add another
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {connectedProfiles.map((profile, idx) => (
                                            <ProfileGridCard key={idx} profile={profile} />
                                        ))}
                                    </div>
                                </div>

                                {/* Create post */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-[16px] font-medium text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                        Create a new post
                                    </h2>
                                    <div className="border border-slate-700 bg-slate-950/50 rounded-xl p-4 focus-within:border-indigo-500/50 focus-within:bg-slate-900/80 transition-all shadow-inner">
                                        <textarea
                                            placeholder="What do you want to share with your audience?"
                                            className="w-full bg-transparent border-none text-slate-200 resize-none focus:outline-none min-h-[120px] text-[15px] placeholder:text-slate-600"
                                        />
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/80">
                                            <div className="flex gap-2">
                                                <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-sm font-medium">
                                                    <Sparkles className="w-4 h-4" /> AI Rewrite
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                                                    <Layers className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center transition-all cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95">
                                                <Send className="w-4 h-4 mr-2" /> Publish Now
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-[15px] font-medium text-white flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4 text-slate-400" /> Recent Posts
                                            </h3>
                                            <button className="text-[13px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer">View all</button>
                                        </div>
                                        <div className="space-y-4">
                                            {[1, 2].map(i => (
                                                <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-800/60 bg-slate-950/30">
                                                    <div className="w-12 h-12 rounded bg-slate-800 shrink-0 border border-slate-700/50" />
                                                    <div className="flex-1 space-y-2 py-1">
                                                        <div className="h-3.5 bg-slate-800 rounded-full w-3/4" />
                                                        <div className="h-3.5 bg-slate-800 rounded-full w-1/2" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-[15px] font-medium text-white flex items-center gap-2">
                                                <BarChart2 className="w-4 h-4 text-slate-400" /> Performance Overview
                                            </h3>
                                            <select className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer">
                                                <option>Last 7 days</option>
                                                <option>Last 30 days</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-950/30">
                                                <div className="text-[12px] text-slate-400 font-medium mb-1">Total Impressions</div>
                                                <div className="text-xl font-bold text-white mb-2">0</div>
                                                <div className="flex items-center text-xs text-emerald-400"><TrendingUp className="w-3 h-3 mr-1" /> --%</div>
                                            </div>
                                            <div className="p-4 rounded-xl border border-slate-800/60 bg-slate-950/30">
                                                <div className="text-[12px] text-slate-400 font-medium mb-1">Total Engagements</div>
                                                <div className="text-xl font-bold text-white mb-2">0</div>
                                                <div className="flex items-center text-xs text-emerald-400"><TrendingUp className="w-3 h-3 mr-1" /> --%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* ── Add Profile Modal ────────────────────────────────────────── */}
            {isAddProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        onClick={() => setIsAddProfileModalOpen(false)}
                    />
                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-indigo-500/10 w-full max-w-sm overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-[16px] font-medium text-white">Connect Profile</h3>
                            <button
                                onClick={() => setIsAddProfileModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-800 rounded-full p-1.5"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            {/* Facebook */}
                            <button
                                onClick={() => {
                                    if (!connectedProfiles.find(p => p.platform === 'facebook')) {
                                        setConnectedProfiles([...connectedProfiles, {
                                            platform: 'facebook',
                                            name: userName + ' Page',
                                            type: 'Facebook Page',
                                            followers: '1.2K'
                                        }]);
                                    }
                                    setIsAddProfileModalOpen(false);
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all group cursor-pointer text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                                    <Facebook className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[15px] text-slate-200 font-medium group-hover:text-white">Facebook</div>
                                    <div className="text-[13px] text-slate-400 mt-0.5">Connect page or group</div>
                                </div>
                                <Plus className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
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
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-blue-700/10 hover:border-blue-600/30 transition-all group cursor-pointer text-left"
                            >
                                <div className="w-10 h-10 rounded-[8px] bg-[#0A66C2] flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
                                    <Linkedin className="w-5 h-5 fill-current" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[15px] text-slate-200 font-medium group-hover:text-white">LinkedIn</div>
                                    <div className="text-[13px] text-slate-400 mt-0.5">Connect profile or page</div>
                                </div>
                                <Plus className="w-5 h-5 text-slate-500 group-hover:text-blue-400" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialDashboard;