import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import {
    Phone,
    Clock,
    Users,
    User,
    CheckCircle,
    Mic,
    Settings,
    LayoutDashboard,
    BarChart,
    Calendar,
    Bell,
    Search,
    MoreVertical,
    Play,
    Volume2,
    AlertTriangle,
    Download,
    LogOut,
    Megaphone
} from 'lucide-react';

import VoiceAgentInterface from '../components/VoiceAgentInterface';
import ThemeToggle from '../components/ThemeToggle';
import AiAvatar from '../assets/ai_agent_avatar.png';
import { meetingsService } from '../services/meetingsService';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config.js';

const SalesDashboard = () => {
    const navigate = useNavigate();
    const { credits } = useAuth();
    const [currentView, setCurrentView] = useState('overview'); // overview, voice_demo
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCalls: 0,
        totalCallsTrend: 0,
        avgDuration: '0m 0s',
        avgDurationTrend: 0,
        activeConversations: 0,
        successRate: '0%',
        successRateTrend: 0,
        pendingReminders: 0,
        pendingRemindersTrend: 0
    });
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isCalling, setIsCalling] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedCall, setSelectedCall] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [meetings, setMeetings] = useState([]);
    const [loadingMeetings, setLoadingMeetings] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const [filterType, setFilterType] = useState('all');
    const [analyticsDate, setAnalyticsDate] = useState(new Date().toISOString().split('T')[0]);

    // Agent-specific stats
    const [agentStats, setAgentStats] = useState(null);
    const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

    useEffect(() => {
        fetchData();
        if (currentView === 'meetings') {
            fetchMeetings();
        }
        loadAgentStats();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('public:sales_calls')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_calls' }, (payload) => {
                console.log('Realtime change received!', payload);
                fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, (payload) => {
                console.log('Realtime reminder change!', payload);
                fetchData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, (payload) => {
                console.log('Realtime meeting change!', payload);
                if (currentView === 'meetings') {
                    fetchMeetings();
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentView]);

    const fetchData = async () => {
        try {
            const { data: callsData, error } = await supabase
                .from('sales_calls')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const { data: remindersData, error: remindersError } = await supabase
                .from('reminders')
                .select('*');

            if (error) throw error;
            if (remindersError) throw remindersError;

            setCalls(callsData);
            calculateStats(callsData, remindersData || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const fetchMeetings = async () => {
        try {
            setLoadingMeetings(true);
            const { data, error } = await supabase
                .from('meetings')
                .select('*')
                .order('scheduled_date', { ascending: true });

            if (error) throw error;
            setMeetings(data);
            setLoadingMeetings(false);
        } catch (error) {
            console.error('Error fetching meetings:', error);
            setLoadingMeetings(false);
        }
    };

    const updateMeetingStatus = async (meetingId, newStatus) => {
        try {
            await meetingsService.updateMeeting(meetingId, { status: newStatus });

            // Update local state
            setMeetings(meetings.map(m =>
                m.id === meetingId ? { ...m, status: newStatus } : m
            ));

            // Update selected meeting if it's open
            if (selectedMeeting && selectedMeeting.id === meetingId) {
                setSelectedMeeting({ ...selectedMeeting, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating meeting status:', error);
        }
    };

    const loadAgentStats = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${API_BASE_URL}/api/credits/stats/voice`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setAgentStats(data.stats);

                // Show low credit alert if balance is less than 100 credits
                if (data.stats.currentBalance < 100) {
                    setShowLowCreditAlert(true);
                }
            }
        } catch (error) {
            console.error('Error loading agent stats:', error);
        }
    };

    const calculateStats = (data, reminders = []) => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();

        // Filter calls for Today and Yesterday
        const todayCalls = data.filter(c => new Date(c.created_at).getTime() >= startOfToday);
        const yesterdayCalls = data.filter(c => {
            const time = new Date(c.created_at).getTime();
            return time >= startOfYesterday && time < startOfToday;
        });

        const active = data.filter(c => c.status === 'Active').length;

        const getMetrics = (calls) => {
            const total = calls.length;
            const completed = calls.filter(c => c.status === 'Completed');
            // Assuming 'Completed' implies success for this metrics simplified view
            const success = completed.length;
            const totalDuration = completed.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
            const avgSeconds = completed.length ? totalDuration / completed.length : 0;
            const successRate = total ? (success / total) * 100 : 0;
            return { total, avgSeconds, successRate };
        };

        const current = getMetrics(todayCalls);
        const previous = getMetrics(yesterdayCalls);

        const calculateTrend = (curr, prev) => {
            if (prev === 0) return curr > 0 ? 100 : 0;
            return ((curr - prev) / prev) * 100;
        };

        const totalCallsTrend = calculateTrend(current.total, previous.total);
        const avgDurationTrend = calculateTrend(current.avgSeconds, previous.avgSeconds);
        const successRateTrend = calculateTrend(current.successRate, previous.successRate);

        const avgMin = Math.floor(current.avgSeconds / 60);
        const avgSec = Math.floor(current.avgSeconds % 60);

        // Reminder Stats
        const todayReminders = reminders.filter(r => r.status === 'pending' && new Date(r.created_at).getTime() >= startOfToday);
        const yesterdayReminders = reminders.filter(r => {
            const time = new Date(r.created_at).getTime();
            return r.status === 'pending' && time >= startOfYesterday && time < startOfToday;
        });

        // This logic calculates "New Pending Reminders Created" trend. 
        // If the goal is "Total Pending Reminders Count" snapshot, trend is harder to define without historical snapshots.
        // Assuming user wants "How many pending reminders were created Today vs Yesterday"

        const currentPending = reminders.filter(r => r.status === 'pending').length;
        const createdToday = todayReminders.length;
        const createdYesterday = yesterdayReminders.length;

        const pendingRemindersTrend = calculateTrend(createdToday, createdYesterday);

        setStats({
            totalCalls: current.total,
            totalCallsTrend,
            avgDuration: `${avgMin}m ${avgSec}s`,
            avgDurationTrend,
            activeConversations: active,
            successRate: `${current.successRate.toFixed(1)}%`,
            successRateTrend,
            pendingReminders: currentPending,
            pendingRemindersTrend
        });
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `${diffInHours} hours ago`;
    };

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const handlePhoneCall = async () => {
        if (!phoneNumber) {
            alert('Please enter a phone number');
            return;
        }
        setIsCalling(true);
        try {
            const url = `${API_BASE_URL}/api/create-phone-call`;
            console.log('Making call to:', url);

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ to_number: phoneNumber })
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorMessage = `Server returned ${response.status} ${response.statusText}`;

                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } else {
                    const errorText = await response.text();
                    console.error('Non-JSON response:', errorText.substring(0, 200));
                    errorMessage += ' (Non-JSON response)';
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            alert('Call initiated to ' + phoneNumber);
            setPhoneNumber('');
        } catch (error) {
            console.error('Phone call failed:', error);
            alert('Failed to call: ' + error.message);
        } finally {
            setIsCalling(false);
        }
    };

    const handleSyncCalls = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/sync-calls`);
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            console.log('Sync result:', data);
            await fetchData(); // Refresh local list
        } catch (error) {
            console.error('Sync failed:', error);
            alert('Failed to sync calls: ' + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleExportCSV = () => {
        const startOfDay = new Date(analyticsDate).getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

        const dailyCalls = calls.filter(c => {
            const time = new Date(c.created_at).getTime();
            return time >= startOfDay && time < endOfDay;
        });

        if (dailyCalls.length === 0) {
            alert('No calls found for this date.');
            return;
        }

        const headers = ['Call ID', 'Contact Name', 'Phone Number', 'Direction', 'Type', 'Status', 'Duration (s)', 'Summary', 'Sentiment', 'Date'];
        const rows = dailyCalls.map(c => {
            const direction = c.direction?.toLowerCase() || 'outbound';
            const phoneNumber = direction === 'inbound' ? (c.from_number || c.to_number) : (c.to_number || c.from_number);

            return [
                c.call_id,
                c.contact_name || 'Unknown',
                phoneNumber || 'N/A',
                c.direction,
                c.call_type,
                c.status,
                c.duration_seconds,
                `"${(c.call_summary || '').replace(/"/g, '""')}"`,
                c.user_sentiment,
                new Date(c.created_at).toLocaleString()
            ]
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `calls_export_${analyticsDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredCalls = calls.filter(call => {
        const matchesSearch = searchTerm === '' ||
            (call.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (call.call_id?.toLowerCase().includes(searchTerm.toLowerCase()));

        let matchesType = true;
        if (filterType === 'phone_call') matchesType = call.call_type === 'phone_call';
        if (filterType === 'web_call') matchesType = call.call_type === 'web_call';
        if (filterType === 'inbound') matchesType = call.direction === 'inbound';
        if (filterType === 'outbound') matchesType = call.direction === 'outbound';

        return matchesSearch && matchesType;
    });

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col hidden md:flex transition-colors duration-300">


                <nav className="flex-1 px-4 space-y-2 mt-6">
                    <NavItem
                        icon={<LogOut size={20} />}
                        label="Back to Agents"
                        active={false}
                        onClick={() => navigate('/agents')}
                    />
                    <div className="h-4"></div> {/* Spacer */}
                    <div className="text-xs font-semibold text-slate-500 mb-4 px-4">DASHBOARD</div>
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Overview"
                        active={currentView === 'overview'}
                        onClick={() => setCurrentView('overview')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Conversations"
                        active={currentView === 'conversations'}
                        onClick={() => setCurrentView('conversations')}
                    />
                    <NavItem
                        icon={<BarChart size={20} />}
                        label="Analytics"
                        active={currentView === 'analytics'}
                        onClick={() => setCurrentView('analytics')}
                    />
                    <NavItem
                        icon={<Calendar size={20} />}
                        label="Meetings"
                        active={currentView === 'meetings'}
                        onClick={() => setCurrentView('meetings')}
                    />
                    <NavItem
                        icon={<Megaphone size={20} />}
                        label="Ad Campaigns"
                        active={false}
                        onClick={() => navigate('/meta-ads-agent')}
                    />


                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-slate-900 transition-colors duration-300">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Voice Agent Dashboard</h2>
                        <p className="text-sm text-gray-500 dark:text-slate-500">
                            {currentView === 'overview' && 'Manage your calls and conversations'}
                            {currentView === 'voice_demo' && 'Live Voice Agent Demo'}
                            {currentView === 'conversations' && 'Call History & Analytics'}
                            {currentView === 'analytics' && 'Export & Analyze Daily Performance'}
                            {currentView === 'meetings' && 'Scheduled Meetings from Calls'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Credit Display */}
                        <div className="hidden md:flex flex-col items-end group relative">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {credits.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Available Credits
                            </div>
                            {agentStats && (
                                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 z-20">
                                    <div className="text-xs space-y-1">
                                        <div className="font-semibold text-green-600 dark:text-green-400 mb-2">Voice Agent Stats</div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Total Used:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{agentStats.totalCreditsUsed.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Calls:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{agentStats.totalUsageCount}</span>
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs pt-1 border-t border-gray-200 dark:border-slate-700 mt-2">
                                            Cost: 1 credit/second
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden md:block"></div>
                        <ThemeToggle />
                        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-medium">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            System Online
                        </div>
                    </div>
                </header>

                {/* Low Credit Alert */}
                {showLowCreditAlert && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b dark:border-yellow-800 px-8 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Low Credit Balance</p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                        You have {credits} credits remaining. Consider purchasing more credits to continue using this agent.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowLowCreditAlert(false)}
                                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-auto p-8 relative">
                    {currentView === 'voice_demo' ? (
                        <div className="h-full w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 transition-colors duration-300">
                            <VoiceAgentInterface />
                        </div>
                    ) : currentView === 'conversations' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">All Conversations</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Detailed history of all client interactions</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSyncCalls}
                                        disabled={isSyncing}
                                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
                                    >
                                        <div className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}>⟳</div>
                                        <span className="font-medium">{isSyncing ? 'Syncing...' : 'Sync History'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by phone or name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                                    />
                                </div>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-gray-900 dark:text-slate-200 focus:outline-none focus:border-green-500 transition-colors"
                                >
                                    <option value="all">All Types</option>
                                    <option value="phone_call">Phone Calls</option>
                                    <option value="web_call">Web Calls</option>
                                    <option value="inbound">Inbound</option>
                                    <option value="outbound">Outbound</option>
                                </select>
                            </div>

                            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 text-xs uppercase font-medium border-b border-gray-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Duration</th>
                                            <th className="px-6 py-4">Date & Time</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                        {loading ? (
                                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading conversations...</td></tr>
                                        ) : filteredCalls.length === 0 ? (
                                            <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No conversations found matching your filters.</td></tr>
                                        ) : (
                                            filteredCalls.map((call) => (
                                                <tr
                                                    key={call.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                                    onClick={() => setSelectedCall(call)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 font-bold text-xs">
                                                                {call.contact_name ? call.contact_name[0] : 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-900 dark:text-slate-200 font-medium text-sm">{call.contact_name || 'Unknown'}</p>
                                                                <p className="text-gray-500 dark:text-slate-500 text-xs">ID: {call.call_id?.slice(0, 8)}...</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                            {call.direction === 'inbound' ? <Users size={16} /> : <Phone size={16} />}
                                                            <span className="capitalize">{call.call_type?.replace('_', ' ') || 'Web Call'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${call.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                                            call.status === 'Active' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                                                            }`}>
                                                            {call.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 text-sm font-mono">
                                                        {formatDuration(call.duration_seconds)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                                        {new Date(call.created_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-slate-500 hover:text-white transition-colors">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : currentView === 'analytics' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Analytics Export</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Export call logs and view daily performance.</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="date"
                                        value={analyticsDate}
                                        onChange={(e) => setAnalyticsDate(e.target.value)}
                                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-green-500 transition-colors"
                                    />
                                    <button
                                        onClick={handleExportCSV}
                                        className="bg-green-600 hover:bg-green-500 text-white flex items-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium"
                                    >
                                        <Download size={18} /> Export CSV
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                                <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/80">
                                    <h4 className="font-semibold text-gray-700 dark:text-slate-300">Preview: {analyticsDate}</h4>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 text-xs uppercase font-medium border-b border-gray-200 dark:border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4">Time</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Phone</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                        {calls.filter(c => {
                                            const time = new Date(c.created_at).getTime();
                                            const start = new Date(analyticsDate).getTime();
                                            const end = start + 86400000;
                                            return time >= start && time < end;
                                        }).length === 0 ? (
                                            <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No calls recorded for this date.</td></tr>
                                        ) : (
                                            calls.filter(c => {
                                                const time = new Date(c.created_at).getTime();
                                                const start = new Date(analyticsDate).getTime();
                                                const end = start + 86400000;
                                                return time >= start && time < end;
                                            }).map(call => {
                                                const direction = call.direction?.toLowerCase() || 'outbound';
                                                const phoneNumber = direction === 'inbound' ? (call.from_number || call.to_number) : (call.to_number || call.from_number);
                                                return (
                                                    <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{new Date(call.created_at).toLocaleTimeString()}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-200">{call.contact_name || 'Unknown'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 font-mono">{phoneNumber || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400 capitalize">{call.direction} {call.call_type?.replace('_', ' ')}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${call.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700 text-slate-300'
                                                                }`}>{call.status}</span>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : currentView === 'overview' ? (
                        <>
                            {/* Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <MetricCard
                                    title="Total Calls Today"
                                    value={stats.totalCalls}
                                    trend={`${stats.totalCallsTrend > 0 ? '+' : ''}${stats.totalCallsTrend.toFixed(1)}%`}
                                    icon={<Phone className="text-green-500" />}
                                    trendUp={stats.totalCallsTrend >= 0}
                                />
                                <MetricCard
                                    title="Pending Reminders"
                                    value={stats.pendingReminders}
                                    trend={`${stats.pendingRemindersTrend > 0 ? '+' : ''}${stats.pendingRemindersTrend.toFixed(1)}%`}
                                    icon={<Bell className="text-yellow-500" />}
                                    trendUp={stats.pendingRemindersTrend >= 0}
                                />
                                <MetricCard
                                    title="Average Call Duration"
                                    value={stats.avgDuration}
                                    trend={`${stats.avgDurationTrend > 0 ? '+' : ''}${stats.avgDurationTrend.toFixed(1)}%`}
                                    icon={<Clock className="text-blue-500" />}
                                    trendUp={stats.avgDurationTrend >= 0}
                                />
                                <MetricCard
                                    title="Active Conversations"
                                    value={stats.activeConversations}
                                    trend="Live"
                                    icon={<Users className="text-purple-500" />}
                                    trendUp={true}
                                />
                                <MetricCard
                                    title="Success Rate"
                                    value={stats.successRate}
                                    trend={`${stats.successRateTrend > 0 ? '+' : ''}${stats.successRateTrend.toFixed(1)}%`}
                                    icon={<CheckCircle className="text-emerald-500" />}
                                    trendUp={stats.successRateTrend >= 0}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Recent Calls List */}
                                <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 transition-colors duration-300">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold">Recent Calls</h3>
                                            <p className="text-sm text-slate-500">Latest voice agent interactions</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSyncCalls}
                                                disabled={isSyncing}
                                                className="text-slate-400 hover:text-white flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                                            >
                                                <div className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}>⟳</div>
                                                <span className="text-sm font-medium">{isSyncing ? 'Syncing...' : 'Sync Calls'}</span>
                                            </button>
                                            <button className="text-slate-400 hover:text-white">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {loading ? (
                                            <div className="text-center py-10 text-slate-500">Loading calls...</div>
                                        ) : calls.length === 0 ? (
                                            <div className="text-center py-10 text-slate-500">No calls recorded yet.</div>
                                        ) : (
                                            calls.map((call) => (
                                                <CallItem
                                                    key={call.id}
                                                    name={call.contact_name}
                                                    duration={formatDuration(call.duration_seconds)}
                                                    status={call.status}
                                                    timeAgo={formatTimeAgo(call.created_at)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Voice Agent Status Panel */}
                                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 h-fit flex flex-col items-center text-center transition-colors duration-300">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-6 relative">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/0 dark:from-slate-900/0 to-gray-900/30 dark:to-slate-900/30 z-10"></div>
                                        <img
                                            src={AiAvatar}
                                            alt="AI Voice Agent"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-800 z-20 animate-pulse"></div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">AI Agent Active</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Ready to handle your calls</p>

                                    <div className="w-full space-y-3 mb-6">
                                        <input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors text-center text-sm"
                                        />
                                        <button
                                            onClick={handlePhoneCall}
                                            disabled={isCalling}
                                            className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isCalling ? (
                                                <span className="animate-spin">⟳</span>
                                            ) : (
                                                <Phone size={18} fill="currentColor" />
                                            )}
                                            {isCalling ? 'Calling...' : 'Call Now'}
                                        </button>
                                    </div>

                                    <div className="w-full h-px bg-gray-200 dark:bg-slate-700/50 mb-6"></div>

                                    <button
                                        onClick={() => setCurrentView('voice_demo')}
                                        className="w-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-300 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Play size={18} fill="currentColor" /> Open Voice Interface
                                    </button>


                                </div>
                            </div>
                        </>
                    ) : null}

                    {/* Meetings View */}
                    {currentView === 'meetings' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Scheduled Meetings</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Meetings detected from call transcripts</p>
                                </div>
                                <button
                                    onClick={fetchMeetings}
                                    disabled={loadingMeetings}
                                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    <div className={`w-4 h-4 ${loadingMeetings ? 'animate-spin' : ''}`}>⟳</div>
                                    <span className="font-medium">{loadingMeetings ? 'Syncing...' : 'Sync Meetings'}</span>
                                </button>
                            </div>

                            {loadingMeetings ? (
                                <div className="text-center py-10 text-slate-500">Loading meetings...</div>
                            ) : meetings.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-gray-200 dark:border-slate-800">
                                    <Calendar className="mx-auto mb-4 text-gray-400 dark:text-slate-600" size={48} />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-200 mb-2">No Meetings Found</h3>
                                    <p className="text-gray-500 dark:text-slate-400">Meetings will appear here when detected in call transcripts</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {(() => {
                                        const groupedMeetings = meetings.reduce((groups, meeting) => {
                                            const date = new Date(meeting.scheduled_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            });
                                            if (!groups[date]) groups[date] = [];
                                            groups[date].push(meeting);
                                            return groups;
                                        }, {});

                                        return Object.entries(groupedMeetings).map(([date, dayMeetings]) => (
                                            <div key={date} className="space-y-3">
                                                <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    {date}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {dayMeetings.map((meeting) => (
                                                        <div
                                                            key={meeting.id}
                                                            onClick={() => setSelectedMeeting(meeting)}
                                                            className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-800 hover:border-green-500/50 transition-all cursor-pointer group"
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h5 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                                    {meeting.title}
                                                                </h5>
                                                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${meeting.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                                                    meeting.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                                        'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                                    }`}>
                                                                    {meeting.status}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-2 text-sm">
                                                                {meeting.contact_name && (
                                                                    <div className="flex items-center gap-2 text-gray-900 dark:text-slate-200 font-medium">
                                                                        <User size={14} />
                                                                        <span>{meeting.contact_name}</span>
                                                                        {meeting.contact_phone && (
                                                                            <span className="text-gray-500 dark:text-slate-400">• {meeting.contact_phone}</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                                                                    <Clock size={14} />
                                                                    <span>{new Date(meeting.scheduled_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                                {meeting.location && (
                                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                                                                        <span>📍</span>
                                                                        <span className="truncate">{meeting.location}</span>
                                                                    </div>
                                                                )}
                                                                {meeting.attendees && meeting.attendees.length > 0 && (
                                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                                                                        <Users size={14} />
                                                                        <span>{meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Call Details Modal */}
                {selectedCall && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCall(null)}>
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-colors duration-300" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 transition-colors duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 font-bold text-lg">
                                        {selectedCall.contact_name ? selectedCall.contact_name[0] : 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCall.contact_name || 'Unknown User'}</h3>
                                        {selectedCall.from_number && selectedCall.direction === 'inbound' && (
                                            <p className="text-sm text-green-600 dark:text-green-400 font-mono mb-1">From: {selectedCall.from_number}</p>
                                        )}
                                        {selectedCall.to_number && selectedCall.direction === 'outbound' && (
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-mono mb-1">To: {selectedCall.to_number}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1"><Clock size={14} /> {formatDuration(selectedCall.duration_seconds)}</span>
                                            <span>•</span>
                                            <span>{new Date(selectedCall.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {(selectedCall.from_number || selectedCall.to_number) && (
                                        <button
                                            onClick={() => {
                                                const numberToCall = selectedCall.direction === 'inbound' ? selectedCall.from_number : selectedCall.to_number;
                                                setPhoneNumber(numberToCall);
                                                setSelectedCall(null);
                                                setCurrentView('voice_demo');
                                            }}
                                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm"
                                        >
                                            <Phone size={16} fill="currentColor" /> Call Back
                                        </button>
                                    )}
                                    <button onClick={() => setSelectedCall(null)} className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-6 space-y-6">
                                {/* Summary & Sentiment */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Summary</h4>
                                        <p className="text-gray-700 dark:text-slate-300 leading-relaxed text-sm">
                                            {selectedCall.call_summary || 'No summary available for this call.'}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex justify-between items-center shadow-sm transition-colors duration-300">
                                            <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sentiment</h4>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCall.user_sentiment === 'Positive' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-500/20' :
                                                selectedCall.user_sentiment === 'Negative' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20' :
                                                    'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                                                }`}>
                                                {selectedCall.user_sentiment || 'Neutral'}
                                            </span>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex justify-between items-center shadow-sm transition-colors duration-300">
                                            <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Outcome</h4>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCall.call_successful ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-500/20' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                                                }`}>
                                                {selectedCall.call_successful ? 'Successful' : 'Standard'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Audio Player */}
                                {selectedCall.recording_url && (
                                    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                            <Volume2 size={16} /> Call Recording
                                        </h4>
                                        <audio controls className="w-full h-8" src={selectedCall.recording_url}>
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}

                                {/* Transcript */}
                                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Transcript</h4>
                                    <div className="space-y-4 text-sm max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedCall.transcript ? (
                                            selectedCall.transcript.split('\n').map((line, i) => {
                                                const isAgent = line.toLowerCase().startsWith('agent:');
                                                return (
                                                    <div key={i} className={`flex gap-3 ${isAgent ? 'flex-row' : 'flex-row-reverse'}`}>
                                                        <div className={`p-3 rounded-2xl max-w-[80%] ${isAgent ? 'bg-gray-100 dark:bg-slate-700/50 text-gray-800 dark:text-slate-200 rounded-tl-none' : 'bg-green-600/10 dark:bg-green-600/20 text-green-800 dark:text-green-100 rounded-tr-none border border-green-500/20'
                                                            }`}>
                                                            <p>{line.replace(/^(Agent:|User:)/i, '').trim()}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-gray-400 dark:text-slate-500 italic text-center py-4">Transcript not available.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-end transition-colors duration-300">
                                <button
                                    onClick={() => setSelectedCall(null)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div >
                )}

                {/* Meeting Details Modal */}
                {selectedMeeting && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMeeting(null)}>
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedMeeting.title}</h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(selectedMeeting.scheduled_date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {new Date(selectedMeeting.scheduled_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedMeeting(null)} className="text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-6 space-y-4">
                                {(selectedMeeting.contact_name || selectedMeeting.contact_phone) && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Contact Person</h4>
                                        <div className="flex items-center gap-3">
                                            {selectedMeeting.contact_name && (
                                                <span className="text-gray-900 dark:text-slate-100 font-medium flex items-center gap-2">
                                                    <User size={16} />
                                                    {selectedMeeting.contact_name}
                                                </span>
                                            )}
                                            {selectedMeeting.contact_phone && (
                                                <span className="text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Phone size={16} />
                                                    {selectedMeeting.contact_phone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedMeeting.description && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                                        <p className="text-gray-700 dark:text-slate-300">{selectedMeeting.description}</p>
                                    </div>
                                )}

                                {selectedMeeting.location && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Location</h4>
                                        <p className="text-gray-700 dark:text-slate-300 flex items-center gap-2">
                                            <span>📍</span>
                                            {selectedMeeting.location}
                                        </p>
                                    </div>
                                )}

                                {selectedMeeting.attendees && selectedMeeting.attendees.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Attendees</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMeeting.attendees.map((attendee, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-sm text-gray-700 dark:text-slate-300">
                                                    {attendee}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Status</h4>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedMeeting.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                        selectedMeeting.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                            'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                        }`}>
                                        {selectedMeeting.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center gap-2">
                                <div className="flex gap-2">
                                    {selectedMeeting.status !== 'completed' && (
                                        <button
                                            onClick={() => updateMeetingStatus(selectedMeeting.id, 'completed')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                                        >
                                            <CheckCircle size={16} />
                                            Mark Completed
                                        </button>
                                    )}
                                    {selectedMeeting.status !== 'upcoming' && (
                                        <button
                                            onClick={() => updateMeetingStatus(selectedMeeting.id, 'upcoming')}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-sm"
                                        >
                                            Mark Upcoming
                                        </button>
                                    )}
                                    {selectedMeeting.status !== 'cancelled' && (
                                        <button
                                            onClick={() => updateMeetingStatus(selectedMeeting.id, 'cancelled')}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-medium text-sm"
                                        >
                                            Mark Cancelled
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedMeeting(null)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-green-500/10 text-green-500' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'}`}>
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const MetricCard = ({ title, value, trend, icon, trendUp }) => (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 relative overflow-hidden group hover:border-gray-300 dark:hover:border-slate-700 transition-all transition-colors duration-300">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-slate-100">{value}</h3>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
        </div>
        <div className={`text-xs font-semibold ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
            {trendUp ? '↗' : '↘'} {trend}
        </div>
    </div>
);

const CallItem = ({ name, duration, status, timeAgo }) => {
    const getStatusColor = (s) => {
        switch (s.toLowerCase()) {
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'missed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl flex items-center justify-between border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 font-bold">
                    {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <div className="font-semibold text-gray-900 dark:text-slate-200">{name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-500">Duration: {duration}</div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                    {status}
                </div>
                <div className="text-xs text-gray-400 dark:text-slate-500 w-24 text-right">
                    {timeAgo}
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
