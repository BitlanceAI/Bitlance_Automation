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
import ThemeToggle from '../components/ThemeToggle';
import { supabase } from '../lib/supabase';
import DashboardStats from '../components/DashboardStats';
import RecentActivity from '../components/RecentActivity';

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
            title: 'Social Media Automation',
            description: 'Automate your social presence with AI-generated content and scheduling.',
            icon: MessageSquare,
            path: '/broadcast',
            color: 'from-blue-500 to-cyan-500',
            stats: 'Active Campaigns'
        },
        {
            title: 'AI Voice Agent',
            description: 'Intelligent voice assistants for sales, support, and customer engagement.',
            icon: Phone,
            path: '/dashboard',
            color: 'from-purple-500 to-pink-500',
            stats: 'Call Analytics'
        },
        {
            title: 'SEO AI Agent',
            description: 'Dominate search rankings with automated content and SEO optimization.',
            icon: Search,
            path: '/seo-agent',
            color: 'from-amber-500 to-orange-500',
            stats: 'Keyword Rankings'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 pt-24">


            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{user?.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
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
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <LayoutDashboard size={24} className="text-indigo-600" />
                                Your Agents
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {agents.map((agent, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate(agent.path)}
                                    className="group relative bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                                >
                                    {/* Gradient Hover Effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                                    <div className="relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                            <agent.icon size={28} />
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {agent.title}
                                        </h3>

                                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed h-12">
                                            {agent.description}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                {agent.stats}
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                <ArrowRight size={18} />
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
