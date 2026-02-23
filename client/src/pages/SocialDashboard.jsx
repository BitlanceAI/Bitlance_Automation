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
    Volume2,
    Plus,
    ChevronLeft,
    MessageCircle,
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
    CalendarDays
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.webp';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const SocialDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

    // Using default name if profile name not available
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Rahul Saini';

    const sidebarItems = [
        { icon: Send, label: 'Share a post', active: true, path: '/dashboard' },
        { icon: Calendar, label: 'Calendar', active: false, path: '#' },
        { icon: Library, label: 'Libraries', active: false, path: '#' },
        { icon: Users, label: 'Social profiles', active: false, path: '#' },
        { icon: Inbox, label: 'Inbox', active: false, path: '#' },
        { icon: BarChart2, label: 'Reports', active: false, path: '#' },
        { icon: MessageSquare, label: 'DM automations', active: false, path: '#' },
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

    return (
        <div className="flex flex-col h-screen font-sans overflow-hidden bg-slate-950">


            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 relative ${isSidebarCollapsed ? 'w-20' : 'w-64'
                        }`}
                >
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-4 border-b border-slate-800 mt-2">
                        {!isSidebarCollapsed && (
                            <div className="flex items-center gap-2 group">
                                <img
                                    src={Logo}
                                    alt="Bitlance.ai"
                                    className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<span class="text-xl font-bold text-indigo-400 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>Bitlance</span>';
                                    }}
                                />
                            </div>
                        )}
                        {isSidebarCollapsed && (
                            <div className="flex items-center justify-center w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Links */}
                    <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3" style={{ overflow: "visible" }}>
                        {sidebarItems.map((item, index) => (
                            <div key={index} className="relative">
                                <button
                                    onClick={() => {
                                        if (item.label === 'Share a post') {
                                            setIsShareMenuOpen(!isShareMenuOpen);
                                        } else if (item.path !== '#') {
                                            navigate(item.path);
                                            setIsShareMenuOpen(false);
                                        }
                                    }}
                                    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-[14px] font-[500] transition-colors ${item.active
                                        ? 'bg-indigo-500/10 text-indigo-400'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${item.active ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    {!isSidebarCollapsed && <span>{item.label}</span>}
                                </button>

                                {/* Share Post Popup Menu */}
                                {item.label === 'Share a post' && isShareMenuOpen && (
                                    <>
                                        {/* Backdrop to close menu when clicking outside */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsShareMenuOpen(false)}
                                        ></div>
                                        <div className={`absolute top-0 z-50 w-[260px] bg-slate-900 border border-slate-700/50 shadow-2xl shadow-indigo-500/10 rounded-xl py-2 ${isSidebarCollapsed ? 'left-[calc(100%+16px)]' : 'left-[calc(100%+8px)]'}`}>
                                            {shareMenuItems.map((shareItem, idx) => (
                                                shareItem.divider ? (
                                                    <div key={idx} className="my-2 border-t border-slate-800"></div>
                                                ) : (
                                                    <button
                                                        key={idx}
                                                        className="flex items-center w-full px-4 py-2.5 hover:bg-slate-800 text-left transition-colors group"
                                                    >
                                                        <shareItem.icon className="w-[18px] h-[18px] mr-3 text-slate-400 group-hover:text-white transition-colors" />
                                                        <span className="text-[14px] font-[500] text-slate-300 group-hover:text-white transition-colors">{shareItem.label}</span>
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        <div className="my-2 border-t border-slate-800 w-8 mx-auto"></div>

                        {bottomItems.map((item, index) => (
                            <button
                                key={index}
                                className={`flex items-center w-full px-3 py-2.5 rounded-lg text-[14px] font-[500] text-slate-400 hover:bg-slate-800 hover:text-white transition-colors`}
                            >
                                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} text-slate-400`} />
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                            </button>
                        ))}
                    </div>

                    {/* User Profile */}
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

                    {/* Collapse Toggle Button exactly on the border */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="absolute right-0 top-16 translate-x-1/2 z-10 bg-slate-800 border border-slate-700 rounded-full p-0.5 text-indigo-400 hover:text-indigo-300 shadow-sm transition-transform hover:scale-110"
                    >
                        <ChevronLeft className={`w-[14px] h-[14px] transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col relative w-full h-full overflow-y-auto bg-slate-950">



                    {/* Empty State Body */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">

                        {/* Illustration Placeholder matching style */}
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

                            {/* Conversion Card */}
                            <div className="absolute top-[22%] left-0 -translate-x-4 w-[120px] h-[68px] bg-slate-900 border border-slate-800 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-3 flex flex-col z-20">
                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">Conversions</div>
                                <div className="text-[16px] text-indigo-400 font-extrabold flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> 251K</div>
                                <div className="mt-1.5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="w-[65%] bg-indigo-500 h-full rounded-full"></div>
                                </div>
                            </div>

                            {/* Result Card */}
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

                        <h3 className="text-[28px] leading-[36px] font-normal text-white mb-3 text-center tracking-tight">
                            You haven't connected any social profiles<br />yet.
                        </h3>
                        <p className="text-[15px] text-slate-400 text-center mb-8 max-w-[440px] leading-relaxed">
                            Connect your Meta or LinkedIn account to start boosting your posts with Paid Ads.
                        </p>

                        <button className="bg-indigo-600 hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-500/50 text-white px-5 py-[11px] rounded-[8px] flex items-center text-[14px] font-[500] shadow-lg shadow-indigo-500/25 transition-all cursor-pointer">
                            <Plus className="w-[20px] h-[20px] mr-2" />
                            Add social profiles
                        </button>
                    </div>
                </main>
            </div>


        </div>
    );
};

export default SocialDashboard;
