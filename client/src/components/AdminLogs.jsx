import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config';
import { toast } from 'react-hot-toast';
import { Terminal, RefreshCw, ArrowDown, ChevronDown, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const LOG_LEVEL_STYLES = {
    error: { bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400', icon: AlertCircle },
    warn: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle },
    info: { bg: '', text: 'text-gray-300', badge: 'bg-blue-500/20 text-blue-400', icon: Info },
    default: { bg: '', text: 'text-gray-400', badge: 'bg-gray-500/20 text-gray-400', icon: Terminal },
};

const getLogLevel = (message) => {
    const lower = message?.toLowerCase() || '';
    if (lower.includes('error') || lower.includes('err') || lower.includes('fatal') || lower.includes('exception')) return 'error';
    if (lower.includes('warn') || lower.includes('warning')) return 'warn';
    if (lower.includes('info') || lower.includes('listening') || lower.includes('connected') || lower.includes('started')) return 'info';
    return 'default';
};

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [filter, setFilter] = useState('all'); // all, error, warn, info
    const [searchTerm, setSearchTerm] = useState('');
    const logEndRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                fetchLogs(true);
            }, 5000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoRefresh]);

    const fetchLogs = async (silent = false) => {
        if (!silent) setLoading(true);
        setRefreshing(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/logs/render?limit=200`);
            const data = await response.json();

            if (data.success) {
                // Render API returns an array of objects with { id, message, timestamp, ... }
                const formatted = (Array.isArray(data.logs) ? data.logs : []).map((log, i) => ({
                    id: log.id || i,
                    message: log.message || log.text || JSON.stringify(log),
                    timestamp: log.timestamp || log.createdAt || '',
                    level: getLogLevel(log.message || log.text || ''),
                }));
                setLogs(formatted);
            } else {
                // Disable auto-refresh on error to avoid spamming
                setAutoRefresh(false);
                if (!silent) toast.error(data.error || 'Failed to fetch logs');
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            setAutoRefresh(false);
            if (!silent) toast.error('Error fetching Render logs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const scrollToBottom = () => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'all' || log.level === filter;
        const matchesSearch = !searchTerm || log.message.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const errorCount = logs.filter(l => l.level === 'error').length;
    const warnCount = logs.filter(l => l.level === 'warn').length;

    if (loading && logs.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">Fetching Render logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-emerald-500" />
                        Render Deploy Logs
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live server logs from your Render deployment.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Stats Badges */}
                    {errorCount > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-2.5 py-1 rounded-full font-medium">
                            {errorCount} errors
                        </span>
                    )}
                    {warnCount > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 px-2.5 py-1 rounded-full font-medium">
                            {warnCount} warnings
                        </span>
                    )}

                    {/* Auto Refresh Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Auto</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={() => setAutoRefresh(!autoRefresh)}
                                className="sr-only"
                            />
                            <div className={`w-9 h-5 rounded-full transition-colors ${autoRefresh ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${autoRefresh ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'}`}></div>
                            </div>
                        </div>
                    </label>

                    {/* Refresh Button */}
                    <button
                        onClick={() => fetchLogs()}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search logs..."
                    className="flex-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Level Filters */}
                <div className="flex items-center gap-1.5">
                    {['all', 'error', 'warn', 'info'].map(level => (
                        <button
                            key={level}
                            onClick={() => setFilter(level)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${filter === level
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>

                {/* Scroll to bottom */}
                <button
                    onClick={scrollToBottom}
                    className="text-gray-500 dark:text-gray-400 hover:text-indigo-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    title="Jump to latest"
                >
                    <ArrowDown className="w-4 h-4" />
                </button>
            </div>

            {/* Log Output */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-xs text-slate-400 ml-2 font-mono">render-logs — {filteredLogs.length} entries</span>
                    {autoRefresh && (
                        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live
                        </span>
                    )}
                </div>

                <div className="overflow-y-auto max-h-[520px] p-1 font-mono text-xs leading-relaxed scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                    {filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Terminal className="w-10 h-10 mb-3 opacity-30" />
                            <p>No logs match your filter.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => {
                            const style = LOG_LEVEL_STYLES[log.level] || LOG_LEVEL_STYLES.default;
                            return (
                                <div
                                    key={log.id}
                                    className={`flex gap-3 px-3 py-1.5 hover:bg-slate-800/70 transition-colors rounded ${style.bg}`}
                                >
                                    <span className="text-slate-500 shrink-0 select-none whitespace-nowrap">
                                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                                    </span>
                                    <span className={`break-all ${style.text}`}>
                                        {log.message}
                                    </span>
                                </div>
                            );
                        })
                    )}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    );
};

export default AdminLogs;
