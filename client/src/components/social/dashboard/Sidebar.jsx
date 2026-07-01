import React from 'react';
import {
    Send,
    Calendar,
    Library,
    Users,
    Inbox,
    BarChart2,
    MessageSquare,
    MessageCircle,
    HelpCircle,
    AlertCircle,
    MoreVertical,
    ChevronLeft,
    Edit2,
    Layers,
    Sparkles,
    CalendarCheck,
    Star,
    CalendarDays,
    ImageIcon,
    Zap,
    CheckCircle2,
    TrendingUp,
} from 'lucide-react';
import Logo from '../../../assets/logo.webp';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const Sidebar = ({
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    activeView,
    setActiveView,
    userName,
    navigate,
    isShareMenuOpen,
    setIsShareMenuOpen,
    isLibraryMenuOpen,
    setIsLibraryMenuOpen
}) => {
    const sidebarItems = [
        { icon: Send, label: 'Share a post', view: 'share_menu', path: '/dashboard' },
        { icon: CheckCircle2, label: 'Approval Queue', view: 'approval_queue', path: '#' },
        { icon: Calendar, label: 'Calendar', view: 'calendar', path: '#' },
        { icon: TrendingUp, label: 'High-Performing Ads', view: 'ads_library', path: '#' },
        { icon: Library, label: 'Libraries', view: null, path: '#' },
        { icon: Users, label: 'Social profiles', view: 'profiles', path: '#' },
        { icon: Inbox, label: 'Inbox', view: 'inbox', path: '#' },
        { icon: MessageCircle, label: 'Comments', view: 'comments', path: '#' },
        { icon: BarChart2, label: 'Reports', view: null, path: '#' },
        { icon: MessageSquare, label: 'DM automations', view: null, path: '#' },
    ];

    const shareMenuItems = [
        { id: 'share', icon: Edit2, label: 'Create a Post Manually' },
        { id: 'upload_csv', icon: Layers, label: 'Upload CSV file' },
        { divider: true },
        { id: 'create_ai', icon: Sparkles, label: 'Create a Post with AI' },
        { id: 'plan_weekly', icon: CalendarCheck, label: 'Plan Weekly Posts with AI' },
        { id: 'ai_templates', icon: Star, label: 'Use AI Templates' },
        { id: 'special_days', icon: CalendarDays, label: 'Special Days Posts (AI)' },
        { divider: true },
        { id: 'twitter_thread', icon: XIcon, label: 'X (Twitter) Thread Builder' },
        { divider: true },
        { id: 'smart_schedule', icon: Zap, label: 'Smart Post Scheduler (AI)' },
    ];

    const libraryMenuItems = [
        { id: 'graphics_ai', icon: ImageIcon, label: 'Graphics AI Agent' },
        { id: 'ads_library', icon: TrendingUp, label: 'High-Performing Ads' },
    ];

    const bottomItems = [
        { icon: HelpCircle, label: 'Help', path: '#' },
        { icon: AlertCircle, label: 'Report an Issue', path: '#' },
    ];

    return (
        <aside className={`flex flex-col bg-[#115e59] border-r border-white/10 transition-all duration-300 relative ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-white/10 mt-2">
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
                                    setIsLibraryMenuOpen(false);
                                    setActiveView('share_menu');
                                } else if (item.label === 'Libraries') {
                                    setIsLibraryMenuOpen(!isLibraryMenuOpen);
                                    setIsShareMenuOpen(false);
                                } else if (item.view) {
                                    setActiveView(item.view);
                                    setIsShareMenuOpen(false);
                                    setIsLibraryMenuOpen(false);
                                } else if (item.path !== '#') {
                                    navigate(item.path);
                                    setIsShareMenuOpen(false);
                                    setIsLibraryMenuOpen(false);
                                }
                            }}
                            className={`flex items-center w-full px-3 py-2.5 rounded-2xl font-mono text-[12px] uppercase tracking-wider transition-colors ${item.view && activeView === item.view
                                ? 'bg-[#26cece]/10 text-[#26cece] border-l-2 border-[#26cece]'
                                : 'text-white/80 hover:bg-white/10 hover:text-[#26cece] border-l-2 border-transparent'
                                }`}
                        >
                            <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${item.view && activeView === item.view ? 'text-[#26cece]' : 'text-white/60'}`} />
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </button>

                        {/* Libraries popup */}
                        {item.label === 'Libraries' && isLibraryMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsLibraryMenuOpen(false)} />
                                <div className={`absolute top-0 z-50 w-[260px] bg-white/10 border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.8)] rounded-2xl py-2 ${isSidebarCollapsed ? 'left-[calc(100%+16px)]' : 'left-[calc(100%+8px)]'}`}>
                                    {libraryMenuItems.map((libItem, idx) =>
                                        libItem.divider ? (
                                            <div key={idx} className="my-2 border-t border-white/10" />
                                        ) : (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setActiveView(libItem.id);
                                                    setIsLibraryMenuOpen(false);
                                                }}
                                                className={`flex items-center w-full px-4 py-2.5 hover:bg-[#222] text-left transition-colors group ${activeView === libItem.id ? 'bg-[#222]' : ''}`}
                                            >
                                                <libItem.icon className={`w-[18px] h-[18px] mr-3 transition-colors ${activeView === libItem.id ? 'text-[#26cece]' : 'text-white/80 group-hover:text-[#26cece]'}`} />
                                                <span className={`text-[13px] font-mono transition-colors ${activeView === libItem.id ? 'text-[#26cece]' : 'text-teal-50 group-hover:text-[#26cece]'}`}>{libItem.label}</span>
                                            </button>
                                        )
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}

                <div className="my-2 border-t border-white/10 w-8 mx-auto" />

                {bottomItems.map((item, index) => (
                    <button key={index} className="flex items-center w-full px-3 py-2.5 rounded-2xl text-[12px] font-mono uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-[#26cece] transition-colors">
                        <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} text-white/60`} />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                    </button>
                ))}
            </div>

            {/* User profile */}
            <div className="p-3 border-t border-white/10">
                <button className="flex items-center w-full p-2.5 rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/80 flex-shrink-0">
                        <Users className="w-4 h-4" />
                    </div>
                    {!isSidebarCollapsed && (
                        <>
                            <span className="ml-3 text-[13px] font-mono text-teal-50 truncate">{userName}</span>
                            <MoreVertical className="w-4 h-4 ml-auto text-white/60" />
                        </>
                    )}
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="absolute right-0 top-16 translate-x-1/2 z-10 bg-white/10 border border-white/10 rounded-2xl p-0.5 text-[#26cece] hover:text-white shadow-[0_0_10px_rgba(38,206,206,0.3)] transition-transform hover:scale-110"
            >
                <ChevronLeft className={`w-[14px] h-[14px] transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
        </aside>
    );
};

export default Sidebar;
