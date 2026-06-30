import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    MessageSquare,
    Phone,
    Search,
    ArrowRight,
    Activity,
    Zap,
    LayoutDashboard
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import DashboardStats from '../../components/dashboard/DashboardStats';
import RecentActivity from '../../components/dashboard/RecentActivity';
import { trackAgentOpen } from '../../lib/analytics';
import { agents as allAgents } from '../../data/agentsData';
import { ElegantShape } from '../../components/ui/shape-landing-hero';

const HomePage = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [greeting, setGreeting] = useState('');

    const [stats, setStats] = useState({
        credits: 0,
        articles: 0,
        calls: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // 1. Fetch Credits
                const { data: creditData } = await supabase
                    .from('user_credits')
                    .select('balance')
                    .eq('user_id', user.id)
                    .single();

                // 2. Fetch Articles Count
                const { count: articlesCount } = await supabase
                    .from('articles')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                // 3. Fetch Calls Count (from meetings table for now, or calls table if exists)
                // Assuming meetings table holds call records
                const { count: callsCount } = await supabase
                    .from('meetings')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                setStats({
                    credits: creditData?.balance || 0,
                    articles: articlesCount || 0,
                    calls: callsCount || 0
                });

                // 4. Fetch Recent Activity (Combined)
                const { data: recentArticles } = await supabase
                    .from('articles')
                    .select('topic, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                const { data: recentCalls } = await supabase
                    .from('meetings')
                    .select('meeting_id, created_at') // adjust fields based on actual schema
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Merge and Sort
                const articles = (recentArticles || []).map(a => ({
                    type: 'blog',
                    title: a.topic || 'Untitled Article',
                    date: a.created_at,
                    status: 'Published'
                }));

                const calls = (recentCalls || []).map(c => ({
                    type: 'call',
                    title: `Call ID: ${c.meeting_id || 'Unknown'}`,
                    date: c.created_at,
                    status: 'Completed'
                }));

                const combined = [...articles, ...calls]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);

                setRecentActivity(combined);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    const agentPaths = {
        'GEO (Generative) AI Agent': { path: '/dashboard/agents/geo', stats: 'Keyword Rankings' },
        'SEO (Search Engine) AI Agent': { path: '/dashboard/agents/seo', stats: 'Content Scaling' },
        'Graphic Designer AI': { path: '/dashboard/agents/design', stats: 'Templates Generated' },
        'Real Estate Reel AI Agent': { path: '/dashboard/agents/video', stats: 'Reels Generated' },
        'Email Automation AI': { path: '/dashboard/email-automation', stats: 'Campaigns Sent' },
        'WhatsApp Broadcasting Automation': { path: 'https://wacrm.bitlancetechhub.com/', stats: 'Active Broadcasts' },
        'AI Voice Agent': { path: 'https://voice.bitlancetechhub.com/', stats: 'Call Analytics' }
    };

    const agents = allAgents
        .filter(a => a.status === 'Available')
        .map(a => ({
            ...a,
            path: agentPaths[a.title]?.path || '#',
            stats: agentPaths[a.title]?.stats || 'Access Agent'
        }));

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-teal-900 text-white transition-colors duration-300 pt-24 font-['Space_Grotesk']">
            {/* Global ambient glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[180px] animate-float"
                    style={{ background: 'rgba(38,206,206,0.15)' }} />
                <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px] animate-pulse-slow"
                    style={{ background: 'rgba(45,212,191,0.1)' }} />
                <div className="absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full blur-[140px] animate-float"
                    style={{ background: 'rgba(15,118,110,0.2)' }} />
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle, #26CECE 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-teal-400/[0.15]" className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />
                <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-cyan-400/[0.1]" className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" />
                <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-teal-300/[0.12]" className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" />
                <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-cyan-500/[0.15]" className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <header className="mb-12 border-l-4 border-[#26CECE] pl-6">
                    <h1 className="text-[40px] font-bold text-white mb-2 tracking-tight leading-none uppercase">
                        {greeting}, <br /><span className="text-[#26CECE]">{user?.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-lg text-teal-100/80 font-sans tracking-tight">
                        Here's what's happening with your AI agents today.
                    </p>
                </header>

                {/* Dynamic Stats Row */}
                <DashboardStats
                    credits={stats.credits}
                    articlesCount={stats.articles}
                    callsCount={stats.calls}
                />

                {/* Content Grid: Agents & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Agents (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-1 pb-4 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-widest">
                                <LayoutDashboard size={20} className="text-[#26CECE]" />
                                Your Agents
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                            {agents.map((agent, index) => (
                                <div
                                    key={index}
                                        onClick={() => { 
                                            trackAgentOpen(agent.title); 
                                            if (agent.path.startsWith('http')) {
                                                window.open(agent.path, '_blank');
                                            } else {
                                                navigate(agent.path); 
                                            }
                                        }}
                                        className="group relative bg-white/5 rounded-xl p-8 border border-white/10 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-[#26cece] hover:shadow-[0_0_20px_rgba(38,206,206,0.3)] backdrop-blur-sm"
                                    >
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="w-12 h-12 flex flex-shrink-0 items-center justify-center text-[#26CECE] mb-6 border border-white/10 bg-white/5 rounded-xl group-hover:bg-[#26CECE] group-hover:text-teal-950 transition-colors">
                                                <agent.icon size={24} />
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">
                                                {agent.title}
                                            </h3>

                                            <p className="text-teal-100/60 mb-8 leading-relaxed text-[14px] font-sans flex-grow group-hover:text-teal-100/80 transition-colors">
                                                {agent.description}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                                                <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#26CECE]">
                                                    {agent.stats}
                                                </div>
                                                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-[#26cece] group-hover:text-teal-950 group-hover:border-[#26cece] transition-colors">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Recent Activity (1/3 width) */}
                    <div className="lg:col-span-1">
                        <RecentActivity activities={recentActivity} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;
