import React, { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    TrendingUp, TrendingDown, Minus, AlertTriangle,
    RefreshCw, ExternalLink, ChevronUp, ChevronDown,
    ShieldCheck, Info
} from 'lucide-react';
import API_BASE_URL from '../../config.js';

const STORAGE_KEY = 'seo_rank_siteUrl';

function PositionBadge({ position, change }) {
    const color =
        change === null ? 'text-slate-400'
        : change > 0    ? 'text-emerald-500'
        : change < 0    ? 'text-rose-500'
        : 'text-slate-400';

    const Icon =
        change === null ? Minus
        : change > 0    ? TrendingUp
        : change < 0    ? TrendingDown
        : Minus;

    return (
        <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-slate-900 text-sm">{position}</span>
            {change !== null && (
                <span className={`flex items-center gap-0.5 text-xs font-mono ${color}`}>
                    <Icon className="w-3 h-3" />
                    {Math.abs(change)}
                </span>
            )}
        </div>
    );
}

function DropAlert({ drops }) {
    if (!drops.length) return null;
    return (
        <div className="mb-4 p-3 rounded-lg border border-rose-200 bg-rose-50 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-sm font-semibold text-rose-900">
                    {drops.length} keyword{drops.length > 1 ? 's' : ''} dropped 3+ positions
                </p>
                <p className="text-xs text-rose-600 mt-0.5">
                    {drops.slice(0, 3).map(d => `"${d.keyword}"`).join(', ')}
                    {drops.length > 3 ? ` +${drops.length - 3} more` : ''}
                </p>
            </div>
        </div>
    );
}

export default function RankTrackerPanel() {
    const { token, user } = useAuth();

    const [siteUrl, setSiteUrl]   = useState(() => localStorage.getItem(STORAGE_KEY) || '');
    const [days, setDays]         = useState(28);
    const [loading, setLoading]   = useState(false);
    const [data, setData]         = useState(null);   // { rows, drops, period }
    const [error, setError]       = useState('');
    const [sites, setSites]       = useState(null);   // GSC property list
    const [sitesLoading, setSitesLoading] = useState(false);
    const [filter, setFilter]     = useState('all');  // 'all' | 'drops' | 'top10'
    const [sortKey, setSortKey]   = useState('impressions');
    const [sortDir, setSortDir]   = useState('desc');

    const fetchSites = useCallback(async () => {
        setSitesLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/seo/sites`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const d = await res.json();
            if (d.success) setSites(d.sites);
            else setError(d.error);
        } catch (e) {
            setError(e.message);
        } finally {
            setSitesLoading(false);
        }
    }, [token]);

    const fetchRanks = useCallback(async () => {
        if (!siteUrl.trim()) return;
        localStorage.setItem(STORAGE_KEY, siteUrl.trim());
        setLoading(true);
        setError('');
        try {
            const url = `${API_BASE_URL}/api/seo/rank-data?siteUrl=${encodeURIComponent(siteUrl.trim())}&days=${days}`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const d = await res.json();
            if (d.success) setData(d);
            else setError(d.error);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [siteUrl, days, token]);

    const toggle = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const SortIcon = ({ k }) => {
        if (sortKey !== k) return <ChevronDown className="w-3 h-3 text-slate-300" />;
        return sortDir === 'asc'
            ? <ChevronUp className="w-3 h-3 text-[#26cece]" />
            : <ChevronDown className="w-3 h-3 text-[#26cece]" />;
    };

    let rows = data?.rows || [];
    if (filter === 'drops') rows = rows.filter(r => r.posChange !== null && r.posChange < -3);
    if (filter === 'top10') rows = rows.filter(r => r.position <= 10);
    rows = [...rows].sort((a, b) => {
        const av = a[sortKey] ?? -Infinity;
        const bv = b[sortKey] ?? -Infinity;
        return sortDir === 'asc' ? av - bv : bv - av;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 font-mono tracking-tight uppercase">Rank Tracker</h2>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                        Powered by Google Search Console · detects position drops automatically
                    </p>
                </div>
            </div>

            {/* Setup notice */}
            <div className="p-3 rounded-lg border border-[#26cece]/20 bg-[#26cece]/5 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#26cece] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                    Connect your Google account once to fetch rankings from
                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-[#26cece] hover:underline mx-1 font-medium">
                        Google Search Console
                    </a>
                    automatically.
                </p>
            </div>

            {/* Site URL input */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-sm">
                <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">GSC Property URL</p>

                {/* Auto-discover sites button */}
                <button
                    type="button"
                    onClick={fetchSites}
                    disabled={sitesLoading}
                    className="text-xs text-[#26cece] hover:underline flex items-center gap-1 mb-1 font-medium"
                >
                    <RefreshCw className={`w-3 h-3 ${sitesLoading ? 'animate-spin' : ''}`} />
                    {sitesLoading ? 'Detecting…' : 'Auto-detect my sites'}
                </button>

                {sites && sites.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {sites.map(s => (
                            <button
                                key={s.url}
                                onClick={() => setSiteUrl(s.url)}
                                className={`text-xs px-2 py-1 rounded border font-mono transition-colors ${
                                    siteUrl === s.url
                                        ? 'border-[#26cece] bg-slate-50 text-[#26cece]'
                                        : 'border-slate-200 text-slate-500 hover:border-[#26cece]/50'
                                }`}
                            >
                                {s.url}
                            </button>
                        ))}
                    </div>
                )}

                <input
                    type="url"
                    value={siteUrl}
                    onChange={e => setSiteUrl(e.target.value)}
                    placeholder="https://www.yoursite.com/"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#26cece] outline-none rounded-[2px] text-slate-900 font-mono text-[13px] placeholder-slate-400 transition-colors"
                />

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">Period:</span>
                        {[7, 28, 90].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`text-xs px-2.5 py-1 rounded font-mono border transition-colors ${
                                    days === d
                                        ? 'border-[#26cece] bg-slate-50 text-[#26cece]'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchRanks}
                        disabled={loading || !siteUrl.trim()}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#26cece] hover:bg-[#1fb8b8] disabled:opacity-50 text-white text-xs font-bold font-mono tracking-widest uppercase rounded-[2px] transition-all hover:shadow-md"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Loading…' : 'Fetch Rankings'}
                    </button>
                </div>
            </div>

            {error && (() => {
                const needsAuth = error.toLowerCase().includes('not connected')
                    || error.toLowerCase().includes('credentials')
                    || error.toLowerCase().includes('insufficient')
                    || error.toLowerCase().includes('oauth tokens not found');
                const isReconnect = error.toLowerCase().includes('insufficient');

                return needsAuth ? (
                    /* ── Connect / Reconnect Google card ── */
                    <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                <ShieldCheck className="w-5 h-5 text-[#26cece]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">
                                    {isReconnect ? 'Reconnect Google Account' : 'Connect Google Search Console'}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                                    {isReconnect
                                        ? 'Your Google token is missing Search Console access — reconnect to grant it'
                                        : 'Sign in with Google to access your GSC ranking data'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch(`${API_BASE_URL}/api/google-sheets/auth-url?userId=${user?.id}`);
                                    if (!res.ok) {
                                        const text = await res.text();
                                        throw new Error(`Server error ${res.status}: ${text}`);
                                    }
                                    const json = await res.json();
                                    if (json.url) {
                                        window.location.href = json.url;
                                    } else {
                                        throw new Error('No URL returned from server');
                                    }
                                } catch (e) {
                                    console.error('Google sign-in error:', e);
                                    alert(`Failed to start Google sign-in: ${e.message}`);
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold font-mono tracking-wide rounded-[2px] transition-colors"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                            {isReconnect ? 'Reconnect with Google' : 'Connect with Google'}
                        </button>
                    </div>
                ) : (
                    <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-600 font-mono">
                        {error}
                    </div>
                );
            })()}

            {data && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Keywords', value: data.rows.length },
                            { label: 'Total Clicks', value: data.rows.reduce((s, r) => s + r.clicks, 0).toLocaleString() },
                            { label: 'Impressions', value: data.rows.reduce((s, r) => s + r.impressions, 0).toLocaleString() },
                            { label: 'Drops >3 pos', value: data.dropCount, alert: data.dropCount > 0 },
                        ].map(({ label, value, alert }) => (
                            <div key={label} className={`bg-white border rounded-lg p-3 shadow-sm ${alert ? 'border-rose-200 bg-rose-50' : 'border-slate-200'}`}>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">{label}</p>
                                <p className={`text-xl font-bold font-mono mt-1 ${alert ? 'text-rose-600' : 'text-slate-900'}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <DropAlert drops={data.drops} />

                    {/* Filter buttons */}
                    <div className="flex items-center gap-2">
                        {[
                            { id: 'all', label: 'All Keywords' },
                            { id: 'drops', label: `Drops (${data.dropCount})` },
                            { id: 'top10', label: 'Top 10' },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`text-xs px-3 py-1.5 rounded font-mono border transition-colors ${
                                    filter === f.id
                                        ? 'border-[#26cece] bg-slate-50 text-[#26cece]'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-slate-400 font-mono">
                            {data.period.startDate} → {data.period.endDate}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
                        <table className="w-full text-xs font-mono">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-4 py-3 text-left text-slate-500 uppercase tracking-widest font-normal">Keyword</th>
                                    <th
                                        className="px-4 py-3 text-right text-slate-500 uppercase tracking-widest font-normal cursor-pointer hover:text-[#26cece]"
                                        onClick={() => toggle('position')}
                                    >
                                        <span className="flex items-center justify-end gap-1">Pos <SortIcon k="position" /></span>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-right text-slate-500 uppercase tracking-widest font-normal cursor-pointer hover:text-[#26cece]"
                                        onClick={() => toggle('clicks')}
                                    >
                                        <span className="flex items-center justify-end gap-1">Clicks <SortIcon k="clicks" /></span>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-right text-slate-500 uppercase tracking-widest font-normal cursor-pointer hover:text-[#26cece]"
                                        onClick={() => toggle('impressions')}
                                    >
                                        <span className="flex items-center justify-end gap-1">Impr <SortIcon k="impressions" /></span>
                                    </th>
                                    <th className="px-4 py-3 text-right text-slate-500 uppercase tracking-widest font-normal">CTR</th>
                                    <th className="px-3 py-3 text-slate-500 uppercase tracking-widest font-normal">Page</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-slate-400 font-mono">
                                            No data for this filter.
                                        </td>
                                    </tr>
                                )}
                                {rows.map((row, i) => {
                                    const dropped = row.posChange !== null && row.posChange < -3;
                                    const gained  = row.posChange !== null && row.posChange > 3;
                                    return (
                                        <tr
                                            key={i}
                                            className={`hover:bg-slate-50 transition-colors ${dropped ? 'bg-rose-50/50' : gained ? 'bg-emerald-50/50' : ''}`}
                                        >
                                            <td className="px-4 py-2.5 text-slate-900 max-w-[220px] truncate">{row.keyword}</td>
                                            <td className="px-4 py-2.5 text-right">
                                                <PositionBadge position={row.position} change={row.posChange} />
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-slate-600">{row.clicks.toLocaleString()}</td>
                                            <td className="px-4 py-2.5 text-right text-slate-600">{row.impressions.toLocaleString()}</td>
                                            <td className="px-4 py-2.5 text-right text-slate-400">{row.ctr}%</td>
                                            <td className="px-3 py-2.5">
                                                <a
                                                    href={row.page}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#26cece]/60 hover:text-[#26cece] truncate max-w-[140px] block transition-colors"
                                                    title={row.page}
                                                >
                                                    <ExternalLink className="w-3 h-3 inline mr-1" />
                                                    {row.page.replace(/^https?:\/\/[^/]+/, '').slice(0, 30) || '/'}
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

