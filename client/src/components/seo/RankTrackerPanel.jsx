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
        change === null ? 'text-gray-400'
        : change > 0    ? 'text-green-400'
        : change < 0    ? 'text-red-400'
        : 'text-gray-400';

    const Icon =
        change === null ? Minus
        : change > 0    ? TrendingUp
        : change < 0    ? TrendingDown
        : Minus;

    return (
        <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-white text-sm">{position}</span>
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
        <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-sm font-semibold text-red-300">
                    {drops.length} keyword{drops.length > 1 ? 's' : ''} dropped 3+ positions
                </p>
                <p className="text-xs text-red-400/80 mt-0.5">
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
        if (sortKey !== k) return <ChevronDown className="w-3 h-3 text-gray-600" />;
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
                    <h2 className="text-xl font-bold text-white font-mono tracking-tight">Rank Tracker</h2>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                        Powered by Google Search Console · detects position drops automatically
                    </p>
                </div>
            </div>

            {/* Setup notice */}
            <div className="p-3 rounded-lg border border-[#26cece]/20 bg-[#26cece]/5 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#26cece] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                    Connect your Google account once to fetch rankings from
                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-[#26cece] hover:underline mx-1">
                        Google Search Console
                    </a>
                    automatically.
                </p>
            </div>

            {/* Site URL input */}
            <div className="bg-[#111] border border-[#222] rounded-lg p-4 space-y-3">
                <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500">GSC Property URL</p>

                {/* Auto-discover sites button */}
                <button
                    type="button"
                    onClick={fetchSites}
                    disabled={sitesLoading}
                    className="text-xs text-[#26cece] hover:underline flex items-center gap-1 mb-1"
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
                                        ? 'border-[#26cece] bg-[#26cece]/10 text-[#26cece]'
                                        : 'border-[#333] text-gray-400 hover:border-[#26cece]/50'
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
                    className="w-full px-3 py-2.5 bg-[#070707] border border-[#333] focus:border-[#26cece] outline-none rounded-[2px] text-white font-mono text-[13px] placeholder-gray-600"
                />

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono">Period:</span>
                        {[7, 28, 90].map(d => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`text-xs px-2.5 py-1 rounded font-mono border transition-colors ${
                                    days === d
                                        ? 'border-[#26cece] bg-[#26cece]/10 text-[#26cece]'
                                        : 'border-[#333] text-gray-500 hover:border-[#555]'
                                }`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchRanks}
                        disabled={loading || !siteUrl.trim()}
                        className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#26cece] hover:bg-[#1fb8b8] disabled:opacity-50 text-black text-xs font-bold font-mono tracking-widest uppercase rounded-[2px] transition-colors"
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
                    <div className="p-5 rounded-xl border border-[#26cece]/30 bg-[#26cece]/5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-[#26cece]/10 border border-[#26cece]/20">
                                <ShieldCheck className="w-5 h-5 text-[#26cece]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white font-mono tracking-tight">
                                    {isReconnect ? 'Reconnect Google Account' : 'Connect Google Search Console'}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 font-mono">
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
                            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold font-mono tracking-wide rounded-[2px] transition-colors"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                            {isReconnect ? 'Reconnect with Google' : 'Connect with Google'}
                        </button>
                    </div>
                ) : (
                    <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300 font-mono">
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
                            <div key={label} className={`bg-[#111] border rounded-lg p-3 ${alert ? 'border-red-500/40' : 'border-[#222]'}`}>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{label}</p>
                                <p className={`text-xl font-bold font-mono mt-1 ${alert ? 'text-red-400' : 'text-white'}`}>{value}</p>
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
                                        ? 'border-[#26cece] bg-[#26cece]/10 text-[#26cece]'
                                        : 'border-[#333] text-gray-400 hover:border-[#555]'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-gray-600 font-mono">
                            {data.period.startDate} → {data.period.endDate}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg overflow-x-auto">
                        <table className="w-full text-xs font-mono">
                            <thead>
                                <tr className="border-b border-[#1e1e1e]">
                                    <th className="px-4 py-3 text-left text-gray-500 uppercase tracking-widest font-normal">Keyword</th>
                                    <th
                                        className="px-4 py-3 text-right text-gray-500 uppercase tracking-widest font-normal cursor-pointer hover:text-[#26cece]"
                                        onClick={() => toggle('position')}
                                    >
                                        <span className="flex items-center justify-end gap-1">Pos <SortIcon k="position" /></span>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-right text-gray-500 uppercase tracking-widest font-normal cursor-pointer hover:text-[#26cece]"
                                        onClick={() => toggle('clicks')}
                                    >
                                        <span className="flex items-center justify-end gap-1">Clicks <SortIcon k="clicks" /></span>
                                    </th>
                                    <th
                                        className="px-4 py-3 text-right text-gray-500 uppercase tracking-widest font-normal cursor-pointer hover:text-[#26cece]"
                                        onClick={() => toggle('impressions')}
                                    >
                                        <span className="flex items-center justify-end gap-1">Impr <SortIcon k="impressions" /></span>
                                    </th>
                                    <th className="px-4 py-3 text-right text-gray-500 uppercase tracking-widest font-normal">CTR</th>
                                    <th className="px-3 py-3 text-gray-500 uppercase tracking-widest font-normal">Page</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-600">
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
                                            className={`border-b border-[#111] hover:bg-[#111] transition-colors ${dropped ? 'bg-red-950/20' : gained ? 'bg-green-950/20' : ''}`}
                                        >
                                            <td className="px-4 py-2.5 text-gray-200 max-w-[220px] truncate">{row.keyword}</td>
                                            <td className="px-4 py-2.5 text-right">
                                                <PositionBadge position={row.position} change={row.posChange} />
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-gray-300">{row.clicks.toLocaleString()}</td>
                                            <td className="px-4 py-2.5 text-right text-gray-300">{row.impressions.toLocaleString()}</td>
                                            <td className="px-4 py-2.5 text-right text-gray-500">{row.ctr}%</td>
                                            <td className="px-3 py-2.5">
                                                <a
                                                    href={row.page}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#26cece]/60 hover:text-[#26cece] truncate max-w-[140px] block"
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
