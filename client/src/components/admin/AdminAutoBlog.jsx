import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../context/AuthContext";
import {
    Upload, FileText, CheckCircle, AlertCircle, Loader, Calendar,
    Settings, Plus, Trash2, Clock, RefreshCw, Zap, BarChart2, Timer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../../config.js';
const API_BASE = API_BASE_URL;

const AdminAutoBlog = () => {
    const { user, token } = useAuth();

    // Tabs state
    const [activeTab, setActiveTab] = useState('sync'); // 'sync' | 'schedule' | 'settings'

    // --- SYNC STATE ---
    const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | success | error
    const [syncMessage, setSyncMessage] = useState('');

    // --- SCHEDULE STATE ---
    const [isCronEnabled, setIsCronEnabled] = useState(false);
    const [cronLoading, setCronLoading] = useState(false);
    const [scheduledBlogs, setScheduledBlogs] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [queueStats, setQueueStats] = useState({ pending: 0, processing: 0, completed: 0, failed: 0 });
    const [lastRunAt, setLastRunAt] = useState(null);
    const [delayMinutes, setDelayMinutes] = useState(300);
    const [nextRunLabel, setNextRunLabel] = useState('');

    // New schedule form
    const [newSchedule, setNewSchedule] = useState({ title: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    // Settings state
    const [settingsDelay, setSettingsDelay] = useState(300);
    const [settingsWebsiteUrl, setSettingsWebsiteUrl] = useState('');
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });

    // ────────────────────────────────────────────────
    // Computed: next run time label
    // ────────────────────────────────────────────────
    useEffect(() => {
        if (!lastRunAt || !isCronEnabled) {
            setNextRunLabel('');
            return;
        }
        const updateLabel = () => {
            const elapsed = (Date.now() - new Date(lastRunAt).getTime()) / 60000; // minutes
            const remaining = Math.max(0, Math.ceil(delayMinutes - elapsed));
            if (remaining === 0) {
                setNextRunLabel('Ready to generate now');
            } else {
                const h = Math.floor(remaining / 60);
                const m = remaining % 60;
                setNextRunLabel(`Next blog in ${h > 0 ? `${h}h ` : ''}${m}m`);
            }
        };
        updateLabel();
        const interval = setInterval(updateLabel, 30000);
        return () => clearInterval(interval);
    }, [lastRunAt, delayMinutes, isCronEnabled]);

    // ────────────────────────────────────────────────
    // Data fetching
    // ────────────────────────────────────────────────
    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/auto-blog/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.settings) {
                setIsCronEnabled(data.settings.is_enabled ?? false);
                setDelayMinutes(data.settings.delay_minutes ?? 300);
                setSettingsDelay(data.settings.delay_minutes ?? 300);
                setLastRunAt(data.settings.last_run_at ?? null);
                setSettingsWebsiteUrl(data.settings.website_url ?? '');
            }
        } catch (err) {
            console.error('Failed to fetch cron settings:', err);
        }
    }, [token]);

    const fetchScheduledBlogs = useCallback(async () => {
        setScheduleLoading(true);
        try {
            const [schedRes, statsRes] = await Promise.all([
                fetch(`${API_BASE}/api/admin/auto-blog/schedule`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE}/api/admin/auto-blog/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);
            const schedData = await schedRes.json();
            const statsData = await statsRes.json();
            if (schedData.success) setScheduledBlogs(schedData.entries || []);
            if (statsData.success) setQueueStats(statsData.stats || {});
        } catch (err) {
            console.error('Failed to fetch scheduled blogs:', err);
        } finally {
            setScheduleLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (activeTab === 'schedule' || activeTab === 'settings') {
            fetchSettings();
            if (activeTab === 'schedule') fetchScheduledBlogs();
        }
    }, [activeTab, fetchSettings, fetchScheduledBlogs]);

    // ────────────────────────────────────────────────
    // Cron toggle
    // ────────────────────────────────────────────────
    const toggleCron = async () => {
        setCronLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/auto-blog/settings/toggle`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_enabled: !isCronEnabled })
            });
            const data = await res.json();
            if (data.success) setIsCronEnabled(!isCronEnabled);
        } catch (err) {
            console.error('Failed to toggle cron:', err);
        } finally {
            setCronLoading(false);
        }
    };

    // ────────────────────────────────────────────────
    // Save settings (delay)
    // ────────────────────────────────────────────────
    const saveSettings = async () => {
        setSettingsSaving(true);
        setSettingsMsg({ type: '', text: '' });
        try {
            const res = await fetch(`${API_BASE}/api/admin/auto-blog/settings`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ delay_minutes: parseInt(settingsDelay, 10), is_enabled: isCronEnabled, website_url: settingsWebsiteUrl })
            });
            const data = await res.json();
            if (data.success) {
                setDelayMinutes(parseInt(settingsDelay, 10));
                setSettingsMsg({ type: 'success', text: 'Settings saved!' });
            } else {
                setSettingsMsg({ type: 'error', text: data.error || 'Failed to save' });
            }
        } catch (err) {
            setSettingsMsg({ type: 'error', text: err.message });
        } finally {
            setSettingsSaving(false);
            setTimeout(() => setSettingsMsg({ type: '', text: '' }), 3000);
        }
    };

    // ────────────────────────────────────────────────
    // Single topic → queue
    // ────────────────────────────────────────────────
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });
        try {
            const res = await fetch(`${API_BASE}/api/admin/auto-blog/schedule`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchedule)
            });
            const data = await res.json();
            if (data.success) {
                setSubmitMessage({ type: 'success', text: 'Topic added to queue!' });
                setNewSchedule({ title: '' });
                fetchScheduledBlogs();
            } else {
                setSubmitMessage({ type: 'error', text: data.error || 'Failed to queue' });
            }
        } catch (err) {
            setSubmitMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteSchedule = async (id) => {
        if (!window.confirm('Delete this queue entry?')) return;
        try {
            await fetch(`${API_BASE}/api/admin/auto-blog/schedule/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchScheduledBlogs();
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    // ────────────────────────────────────────────────
    // ────────────────────────────────────────────────
    // Google Sheet Sync → Queue
    // ────────────────────────────────────────────────
    const handleSync = async () => {
        setSyncStatus('syncing');
        setSyncMessage('Connecting to Google Sheets...');
        try {
            const res = await fetch(`${API_BASE}/api/admin/auto-blog/sync-sheet`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setSyncStatus('success');
                setSyncMessage(data.message || 'Topics added to queue!');
                setTimeout(() => setActiveTab('schedule'), 2500);
            } else {
                throw new Error(data.error || 'Failed to sync');
            }
        } catch (error) {
            setSyncStatus('error');
            setSyncMessage(error.message || 'An error occurred during sync.');
        }
    };

    // ────────────────────────────────────────────────
    // Helpers
    // ────────────────────────────────────────────────
    const formatDelay = (minutes) => {
        if (minutes < 60) return `${minutes} min`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const statusColors = {
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        pending: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };

    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Auto Blog Management</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add topics to the queue — the scheduler generates one post every{' '}
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatDelay(delayMinutes)}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">

                    {(activeTab === 'schedule' || activeTab === 'settings') && (
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-Post:</span>
                            <button
                                onClick={toggleCron}
                                disabled={cronLoading}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isCronEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCronEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className={`text-xs font-bold ${isCronEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                                {isCronEnabled ? 'ON' : 'OFF'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Queue Stats Bar (shown on schedule tab) */}
            {activeTab === 'schedule' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Pending', value: queueStats.pending, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Processing', value: queueStats.processing, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                        { label: 'Completed', value: queueStats.completed, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                        { label: 'Failed', value: queueStats.failed, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} className={`${bg} rounded-xl px-4 py-3 flex items-center justify-between`}>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
                            <span className={`text-2xl font-bold ${color}`}>{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Next Run Banner */}
            {activeTab === 'schedule' && isCronEnabled && nextRunLabel && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm text-indigo-700 dark:text-indigo-300">
                    <Timer size={16} className="shrink-0" />
                    <span className="font-medium">{nextRunLabel}</span>
                    <span className="text-indigo-500 dark:text-indigo-400 ml-1">— one blog generated per cycle</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('sync')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sync' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                    <RefreshCw size={16} className="inline mr-2" />Sheet Sync
                </button>
                <button
                    onClick={() => { setActiveTab('schedule'); fetchScheduledBlogs(); fetchSettings(); }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                    <Calendar size={16} className="inline mr-2" />Queue
                    {queueStats.pending > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">{queueStats.pending}</span>
                    )}
                </button>
                <button
                    onClick={() => { setActiveTab('settings'); fetchSettings(); }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                    <Settings size={16} className="inline mr-2" />Settings
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-slate-700 shadow-sm">

                {/* ── SYNC TAB ── */}
                {activeTab === 'sync' && (
                    <div className="max-w-xl mx-auto">
                        <div className="bg-indigo-50 dark:bg-slate-700/50 rounded-2xl p-8 text-center border border-indigo-100 dark:border-slate-600">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 relative">
                                <FileText size={28} className="text-indigo-600 dark:text-indigo-400" />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-indigo-50 dark:border-slate-700 border-solid">
                                    <RefreshCw size={14} className="text-white" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sync with Google Sheets</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Pull the latest topics from your configured Google Sheet directly into the queue.
                            </p>

                            <button
                                onClick={handleSync}
                                disabled={syncStatus === 'syncing'}
                                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-medium transition-colors shadow-sm ${syncStatus === 'syncing' ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {syncStatus === 'syncing'
                                    ? <><Loader size={18} className="animate-spin" /> Syncing Topics...</>
                                    : <><RefreshCw size={18} /> Run Sync Now</>}
                            </button>

                            <div className="mt-6 pt-6 border-t border-indigo-200/60 dark:border-slate-600/60 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Need to update your spreadsheet link? </span>
                                <Link to="/settings" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Go to Settings
                                </Link>
                            </div>
                        </div>

                        {/* Info box */}
                        <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                            <Zap size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                                <strong>How it works:</strong> We fetch rows from your Google Sheet. New topics are <strong>added to the queue</strong> in 'pending' status. Duplicates are ignored. The scheduler picks one every <strong>{formatDelay(delayMinutes)}</strong> when Auto-Post is ON.
                            </p>
                        </div>

                        {syncStatus === 'error' && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 animate-fade-in">
                                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-red-800 dark:text-red-300 font-medium">{syncMessage}</p>
                            </div>
                        )}

                        {/* Column format legend */}
                        <div className="mt-5 p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Required Sheet Columns</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {[
                                    { col: 'Title / Topic', example: 'How AI changes X…', required: true },
                                    { col: 'Niche / Industry', example: 'Real Estate (optional)', required: false },
                                    { col: 'Keywords', example: 'AI, automation (optional)', required: false },
                                ].map(({ col, example, required }) => (
                                    <div key={col} className="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                                        <p className={`font-semibold text-xs ${required ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>{col}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 italic">{example}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 text-center">
                                Column headers must match these names (case-insensitive).
                            </p>
                        </div>

                        {syncStatus === 'success' && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3 animate-fade-in">
                                <CheckCircle className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" size={18} />
                                <div className="text-sm text-green-800 dark:text-green-300 font-medium whitespace-pre-line">{syncMessage}</div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── QUEUE TAB ── */}
                {activeTab === 'schedule' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Queue List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock size={18} /> Blog Queue
                                </h4>
                                <button
                                    onClick={fetchScheduledBlogs}
                                    className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
                                >
                                    <RefreshCw size={13} /> Refresh
                                </button>
                            </div>

                            {scheduleLoading ? (
                                <div className="flex justify-center p-8"><Loader className="animate-spin text-indigo-500" /></div>
                            ) : scheduledBlogs.length === 0 ? (
                                <div className="text-center p-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl">
                                    <BarChart2 size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Queue is empty. Upload an Excel file or add a topic below.</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                        <thead className="bg-gray-50 dark:bg-slate-800/80">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Topic</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                            {scheduledBlogs.map(blog => (
                                                <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{blog.title}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                            {blog.niche}
                                                            {blog.keywords && ` · ${blog.keywords.substring(0, 30)}${blog.keywords.length > 30 ? '…' : ''}`}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[blog.status] || statusColors.pending}`}>
                                                            {blog.status === 'processing' && <Loader size={10} className="animate-spin mr-1" />}
                                                            {blog.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {(blog.status === 'pending' || blog.status === 'failed') && (
                                                            <button onClick={() => deleteSchedule(blog.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                                                <Trash2 size={15} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Add New Form */}
                        <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-6 border border-gray-100 dark:border-slate-600 h-fit">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                <Plus size={18} /> Add Topic to Queue
                            </h4>

                            <form onSubmit={handleScheduleSubmit} className="space-y-4">
                                {/* AI auto-research banner */}
                                <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <Zap size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                                        Just enter a title — AI will auto-research the industry, keywords &amp; content strategy.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Article Title <span className="text-indigo-500">*</span>
                                    </label>
                                    <input
                                        type="text" required
                                        value={newSchedule.title}
                                        onChange={e => setNewSchedule({ title: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        placeholder="e.g. How AI is Changing Real Estate in 2025"
                                    />
                                </div>

                                {submitMessage.text && (
                                    <div className={`p-3 rounded-lg text-xs font-medium ${submitMessage.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {submitMessage.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                                    {isSubmitting ? 'Adding...' : 'Add to Queue'}
                                </button>

                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 text-center">
                                    Next post generates in <strong>{formatDelay(delayMinutes)}</strong> when Auto-Post is ON.
                                </p>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── SETTINGS TAB ── */}
                {activeTab === 'settings' && (
                    <div className="max-w-md mx-auto space-y-8">
                        {/* Website URL */}
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                                🔗 Website URL for Interlinking
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                The AI will automatically link to recent blog posts from this site to boost SEO.
                            </p>
                            <input
                                type="url"
                                value={settingsWebsiteUrl}
                                onChange={e => setSettingsWebsiteUrl(e.target.value)}
                                placeholder="https://yourwebsite.com"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            />
                        </div>

                        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                                <Timer size={18} /> Posting Delay
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                How long to wait between generating each blog post in the queue.
                            </p>

                            {/* Quick presets */}
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {[
                                    { label: '1h', minutes: 60 },
                                    { label: '2h', minutes: 120 },
                                    { label: '5h', minutes: 300 },
                                    { label: '12h', minutes: 720 },
                                    { label: '24h', minutes: 1440 },
                                    { label: '48h', minutes: 2880 },
                                    { label: '3d', minutes: 4320 },
                                    { label: '7d', minutes: 10080 },
                                ].map(({ label, minutes }) => (
                                    <button
                                        key={label}
                                        onClick={() => setSettingsDelay(minutes)}
                                        className={`py-2 text-sm font-medium rounded-lg border transition-colors ${settingsDelay === minutes
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:border-indigo-400'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Custom input */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Custom delay (minutes)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={settingsDelay}
                                        onChange={e => setSettingsDelay(parseInt(e.target.value, 10) || 1)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    />
                                </div>
                                <div className="mt-5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    = <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatDelay(settingsDelay)}</span>
                                </div>
                            </div>

                            {settingsMsg.text && (
                                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${settingsMsg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {settingsMsg.text}
                                </div>
                            )}

                            <button
                                onClick={saveSettings}
                                disabled={settingsSaving}
                                className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {settingsSaving ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                {settingsSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>

                        {/* Auto-Post toggle */}
                        <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                                <Zap size={18} /> Auto-Post Toggle
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                When enabled, the scheduler automatically picks the next pending blog and generates it.
                            </p>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-gray-200 dark:border-slate-600">
                                <button
                                    onClick={toggleCron}
                                    disabled={cronLoading}
                                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isCronEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isCronEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                                </button>
                                <div>
                                    <p className={`text-sm font-bold ${isCronEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {isCronEnabled ? '● Auto-Post is ON' : '○ Auto-Post is OFF'}
                                    </p>
                                    {isCronEnabled && nextRunLabel && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{nextRunLabel}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAutoBlog;
