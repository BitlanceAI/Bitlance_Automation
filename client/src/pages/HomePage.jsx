import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    MessageSquare,
    Phone,
    Search,
    ArrowRight,
    Activity,
    Zap,
    LayoutDashboard
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentActivity from '../components/dashboard/RecentActivity';
import { trackAgentOpen } from '../lib/analytics';

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

    const agents = [
        {
            title: 'SEO AI Agent',
            description: 'Dominate search rankings with automated content and SEO optimization.',
            icon: Search,
            path: '/dashboard/agents/seo',
            color: 'from-amber-500 to-orange-500',
            stats: 'Keyword Rankings'
        },
        {
            title: 'WhatsApp Automation',
            description: 'AI-powered bulk messaging, follow-ups, and lead engagement on WhatsApp.',
            icon: MessageSquare,
            path: '/dashboard/agents/whatsapp',
            color: 'from-green-500 to-emerald-500',
            stats: 'Active Broadcasts'
        },
        {
            title: 'AI Voice Agent',
            description: 'Intelligent voice assistants for sales, support, and customer engagement.',
            icon: Phone,
            path: '/dashboard/agents/voice',
            color: 'from-purple-500 to-pink-500',
            stats: 'Call Analytics'
        }
    ];

    return (
        <div className="min-h-screen bg-[#070707] transition-colors duration-300 pt-24 font-['Space_Grotesk']">
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <header className="mb-12 border-l-4 border-[#26CECE] pl-6">
                    <h1 className="text-[40px] font-bold text-white mb-2 tracking-tight leading-none uppercase">
                        {greeting}, <br /><span className="text-[#26CECE]">{user?.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-lg text-gray-400 font-sans tracking-tight">
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
                        <div className="flex items-center justify-between mb-1 pb-4 border-b border-[#1E1E1E]">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-widest">
                                <LayoutDashboard size={20} className="text-[#26CECE]" />
                                Your Agents
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                            {agents.map((agent, index) => (
                                <div
                                    key={index}
                                    onClick={() => { trackAgentOpen(agent.title); navigate(agent.path); }}
                                    className="group relative bg-[#111111] rounded-[2px] p-8 border border-[#1E1E1E] transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-[#333] hover:shadow-[4px_4px_0px_0px_#26cece]"
                                >
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="w-12 h-12 flex flex-shrink-0 items-center justify-center text-[#26CECE] mb-6 border border-[#333] bg-[#070707] rounded-[2px] group-hover:bg-[#26CECE] group-hover:text-[#070707] transition-colors">
                                            <agent.icon size={24} />
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">
                                            {agent.title}
                                        </h3>

                                        <p className="text-gray-400 mb-8 leading-relaxed text-[14px] font-sans flex-grow">
                                            {agent.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#1E1E1E]">
                                            <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#26CECE]">
                                                {agent.stats}
                                            </div>
                                            <div className="w-8 h-8 rounded-[2px] bg-[#070707] border border-[#333] flex items-center justify-center text-gray-500 group-hover:text-[#26CECE] transition-colors">
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
