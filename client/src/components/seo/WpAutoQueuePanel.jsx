import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Globe, Plus, Trash2, Loader, CheckCircle, AlertCircle,
    Clock, Zap, RefreshCw, Timer, BarChart2, Settings, Play, Pause
} from 'lucide-react';
import API_BASE_URL from '../../config.js';
import KeywordSuggestions from './KeywordSuggestions.jsx';

const API_BASE = API_BASE_URL;

const STATUS_COLORS = {
    completed: 'bg-green-50 text-green-600 border border-green-200',
    failed: 'bg-red-50 text-red-600 border border-red-200',
    processing: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
    pending: 'bg-slate-50 text-slate-600 border border-slate-200',
};

const formatDelay = (minutes) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export default function WpAutoQueuePanel() {
    const { token } = useAuth();

    // WordPress profiles
    const [wpProfiles, setWpProfiles] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState('');

    // Queue state
    const [queue, setQueue] = useState([]);
    const [queueStats, setQueueStats] = useState({ pending: 0, processing: 0, completed: 0, failed: 0 });
    const [queueLoading, setQueueLoading] = useState(true);

    // Settings
    const [isEnabled, setIsEnabled] = useState(false);
    const [delayMinutes, setDelayMinutes] = useState(300);
    const [lastRunAt, setLastRunAt] = useState(null);
    const [settingsBusy, setSettingsBusy] = useState(false);

    // Add topic form
    const [newTitle, setNewTitle] = useState('');
    const [newKeywords, setNewKeywords] = useState('');
    const [newInterlinkUrls, setNewInterlinkUrls] = useState('');
    const [bulkTopics, setBulkTopics] = useState('');
    const [addMode, setAddMode] = useState('single'); // 'single' | 'bulk'
    const [submitting, setSubmitting] = useState(false);
    const [submitMsg, setSubmitMsg] = useState({ type: '', text: '' });

    // Next run countdown
    const [nextRunLabel, setNextRunLabel] = useState('');

    // ── Next run label ───────────────────────────────
    useEffect(() => {
        if (!lastRunAt || !isEnabled) { setNextRunLabel(''); return; }
        const update = () => {
            const elapsed = (Date.now() - new Date(lastRunAt).getTime()) / 60000;
            const remaining = Math.max(0, Math.ceil(delayMinutes - elapsed));
            if (remaining === 0) { setNextRunLabel('Ready now'); return; }
            const h = Math.floor(remaining / 60), m = remaining % 60;
            setNextRunLabel(`Next post in ${h > 0 ? `${h}h ` : ''}${m}m`);
        };
        update();
        const id = setInterval(update, 30000);
        return () => clearInterval(id);
    }, [lastRunAt, delayMinutes, isEnabled]);

    // ── Fetch WordPress profiles ─────────────────────
    const fetchProfiles = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/wordpress/profiles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setWpProfiles(data.profiles || []);
        } catch { /* ignore */ }
    }, [token]);

    // ── Fetch settings ───────────────────────────────
    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/auto-blog/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.settings) {
                setIsEnabled(data.settings.is_enabled ?? false);
                setDelayMinutes(data.settings.delay_minutes ?? 300);
                setLastRunAt(data.settings.last_run_at ?? null);
                setSelectedProfileId(data.settings.wp_profile_id ?? '');
            }
        } catch { /* ignore */ }
    }, [token]);

    // ── Fetch queue ──────────────────────────────────
    const fetchQueue = useCallback(async () => {
        setQueueLoading(true);
        try {
            const [qRes, sRes] = await Promise.all([
                fetch(`${API_BASE}/api/admin/auto-blog/schedule`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/api/admin/auto-blog/stats`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const qData = await qRes.json();
            const sData = await sRes.json();
            if (qData.success) setQueue(qData.entries || []);
            if (sData.success) setQueueStats(sData.stats || {});
        } catch { /* ignore */ } finally { setQueueLoading(false); }
    }, [token]);

    useEffect(() => {
        fetchProfiles();
        fetchSettings();
        fetchQueue();
    }, [fetchProfiles, fetchSettings, fetchQueue]);

    // ── Save settings (profile + delay + enabled) ────
    const saveSettings = async (overrides = {}) => {
        setSettingsBusy(true);
        try {
            const body = {
                is_enabled: isEnabled,
                delay_minutes: delayMinutes,
                wp_profile_id: selectedProfileId || null,
                ...overrides,
            };
            await fetch(`${API_BASE}/api/admin/auto-blog/settings`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            // Update local state from overrides
            if (overrides.is_enabled !== undefined) setIsEnabled(overrides.is_enabled);
            if (overrides.wp_profile_id !== undefined) setSelectedProfileId(overrides.wp_profile_id ?? '');
            if (overrides.delay_minutes !== undefined) setDelayMinutes(overrides.delay_minutes);
        } catch { /* ignore */ } finally { setSettingsBusy(false); }
    };

    // ── Toggle auto-post on/off ──────────────────────
    const toggleEnabled = () => saveSettings({ is_enabled: !isEnabled });

    // ── Add single topic ─────────────────────────────
    const addSingle = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setSubmitting(true);
        setSubmitMsg({ type: '', text: '' });
        try {
            const res = await fetch(`${API_BASE}/api/admin/auto-blog/schedule`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    keywords: newKeywords.trim(),
                    interlink_urls: newInterlinkUrls.trim(),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setNewTitle('');
                setNewKeywords('');
                setNewInterlinkUrls('');
                setSubmitMsg({ type: 'success', text: 'Topic added to queue!' });
                fetchQueue();
            } else {
                setSubmitMsg({ type: 'error', text: data.error || 'Failed to add' });
            }
        } catch (err) {
            setSubmitMsg({ type: 'error', text: err.message });
        } finally {
            setSubmitting(false);
            setTimeout(() => setSubmitMsg({ type: '', text: '' }), 3000);
        }
    };

    // ── Add bulk topics (one per line) ───────────────
    const addBulk = async (e) => {
        e.preventDefault();
        const titles = bulkTopics.split('\n').map(t => t.trim()).filter(Boolean);
        if (titles.length === 0) return;
        setSubmitting(true);
        setSubmitMsg({ type: '', text: '' });
        let added = 0;
        for (const title of titles) {
            try {
                const res = await fetch(`${API_BASE}/api/admin/auto-blog/schedule`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title }),
                });
                const data = await res.json();
                if (data.success) added++;
            } catch { /* skip */ }
        }
        setBulkTopics('');
        setSubmitMsg({ type: 'success', text: `${added} of ${titles.length} topics queued!` });
        fetchQueue();
        setSubmitting(false);
        setTimeout(() => setSubmitMsg({ type: '', text: '' }), 3000);
    };

    // ── Delete queue entry ───────────────────────────
    const deleteEntry = async (id) => {
        if (!window.confirm('Remove this topic from the queue?')) return;
        await fetch(`${API_BASE}/api/admin/auto-blog/schedule/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchQueue();
    };

    const totalPending = queueStats.pending + queueStats.processing;
    const selectedProfile = wpProfiles.find(p => p.id === selectedProfileId);

    return (
        <div className="space-y-6">

            {/* ── Status bar ─────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-[2px] p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
                {/* WordPress Profile */}
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1.5">WordPress Site</p>
                    <select
                        value={selectedProfileId}
                        onChange={e => {
                            setSelectedProfileId(e.target.value);
                            saveSettings({ wp_profile_id: e.target.value || null });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#26cece] outline-none rounded-[2px] text-slate-900 font-mono text-[13px] transition-colors"
                    >
                        <option value="">— Select a WordPress profile —</option>
                        {wpProfiles.map(p => (
                            <option key={p.id} value={p.id}>{p.name} · {p.wp_url}</option>
                        ))}
                    </select>
                    {wpProfiles.length === 0 && (
                        <p className="text-[11px] text-amber-600 font-mono mt-1">
                            No profiles found. Add one in Blog Manager → WordPress settings.
                        </p>
                    )}
                </div>

                {/* Delay selector */}
                <div className="shrink-0">
                    <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1.5">Interval</p>
                    <div className="flex items-center gap-2">
                        <select
                            value={[30,60,120,300,720,1440,2880,10080].includes(delayMinutes) ? delayMinutes : 'custom'}
                            onChange={e => {
                                if (e.target.value === 'custom') {
                                    setDelayMinutes(0); // 0 is not a preset → shows custom input
                                    return;
                                }
                                const v = parseInt(e.target.value, 10);
                                setDelayMinutes(v);
                                saveSettings({ delay_minutes: v });
                            }}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#26cece] outline-none rounded-[2px] text-slate-900 font-mono text-[13px] transition-colors"
                        >
                            {[
                                { label: '30 min', v: 30 }, { label: '1 hour', v: 60 },
                                { label: '2 hours', v: 120 }, { label: '5 hours', v: 300 },
                                { label: '12 hours', v: 720 }, { label: '24 hours', v: 1440 },
                                { label: '2 days', v: 2880 }, { label: '7 days', v: 10080 },
                                { label: 'Custom…', v: 'custom' },
                            ].map(({ label, v }) => (
                                <option key={v} value={v}>{label}</option>
                            ))}
                        </select>
                        {/* Custom minutes input — shown when value is not a preset */}
                        {![30,60,120,300,720,1440,2880,10080].includes(delayMinutes) && (
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="mins"
                                    value={delayMinutes || ''}
                                    onChange={e => setDelayMinutes(parseInt(e.target.value, 10) || 0)}
                                    onBlur={() => { if (delayMinutes > 0) saveSettings({ delay_minutes: delayMinutes }); }}
                                    className="w-20 px-2 py-2 bg-white border border-[#26cece] focus:border-[#26cece] outline-none rounded-[2px] text-[#26cece] font-mono text-[13px] text-center placeholder-slate-300"
                                />
                                <span className="text-[11px] font-mono text-slate-400">min</span>
                            </div>
                        )}
                    </div>
                    {![30,60,120,300,720,1440,2880,10080].includes(delayMinutes) && delayMinutes > 0 && (
                        <p className="text-[10px] font-mono text-[#26cece] mt-1">= {formatDelay(delayMinutes)}</p>
                    )}
                </div>

                {/* Toggle */}
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                    <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Auto-Post</p>
                    <button
                        onClick={toggleEnabled}
                        disabled={settingsBusy || !selectedProfileId}
                        title={!selectedProfileId ? 'Select a WordPress profile first' : ''}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors disabled:opacity-40 ${isEnabled ? 'bg-[#26cece]' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-[11px] font-mono font-bold ${isEnabled ? 'text-[#26cece]' : 'text-slate-400'}`}>
                        {isEnabled ? 'ON' : 'OFF'}
                    </span>
                </div>
            </div>

            {/* ── Active status banner ───────────────────── */}
            {isEnabled && selectedProfile && (
                <div className="flex items-center gap-3 px-4 py-3 bg-[#26cece]/5 border border-[#26cece]/20 rounded-[2px]">
                    <div className="w-2 h-2 rounded-full bg-[#26cece] animate-pulse shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-mono text-[#26cece]">
                            Auto-posting to <span className="font-bold">{selectedProfile.wp_url}</span>
                            {nextRunLabel && <span className="text-slate-400 ml-2">· {nextRunLabel}</span>}
                        </p>
                    </div>
                    {totalPending > 0 && (
                        <span className="shrink-0 text-[11px] font-mono text-slate-400">{totalPending} in queue</span>
                    )}
                </div>
            )}

            {/* ── Stats row ──────────────────────────────── */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Pending', value: queueStats.pending, color: 'text-[#26cece]' },
                    { label: 'Running', value: queueStats.processing, color: 'text-amber-500' },
                    { label: 'Done', value: queueStats.completed, color: 'text-emerald-500' },
                    { label: 'Failed', value: queueStats.failed, color: 'text-rose-500' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white border border-slate-200 rounded-[2px] px-4 py-3 text-center shadow-sm">
                        <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mt-0.5">{label}</div>
                    </div>
                ))}
            </div>

            {/* ── Main content: add form + queue list ────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Add Topics Form */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2px] p-6 h-fit shadow-sm">
                    <h4 className="text-[11px] font-mono tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
                        <Plus size={14} /> Add Topics
                    </h4>

                    {/* Mode toggle */}
                    <div className="flex gap-2 mb-5">
                        {[{ id: 'single', label: 'Single' }, { id: 'bulk', label: 'Bulk' }].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setAddMode(m.id)}
                                className={`flex-1 py-1.5 text-[11px] font-mono tracking-widest uppercase rounded-[2px] border transition-all ${addMode === m.id
                                    ? 'border-[#26cece] text-[#26cece] bg-slate-50'
                                    : 'border-slate-200 text-slate-400 hover:border-slate-300'
                                    }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {addMode === 'single' ? (
                        <form onSubmit={addSingle} className="space-y-3">
                            <input
                                type="text"
                                required
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="e.g. How AI is Changing Real Estate in 2025"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#26cece] outline-none rounded-[2px] text-slate-900 font-mono text-[13px] placeholder-slate-400 transition-colors"
                            />

                            {/* Keyword suggestions based on title */}
                            <KeywordSuggestions
                                query={newTitle}
                                token={token}
                                activeKws={newKeywords}
                                onAdd={(kw) => setNewKeywords(prev => {
                                    const existing = prev.split(',').map(k => k.trim()).filter(Boolean);
                                    if (existing.includes(kw)) return prev;
                                    return [...existing, kw].join(', ');
                                })}
                            />

                            <div>
                                <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1.5">
                                    Focus Keywords <span className="normal-case text-slate-400">(optional — comma separated)</span>
                                </p>
                                <input
                                    type="text"
                                    value={newKeywords}
                                    onChange={e => setNewKeywords(e.target.value)}
                                    placeholder="e.g. AI real estate, property automation, 2025"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#26cece] outline-none rounded-[2px] text-slate-900 font-mono text-[12px] placeholder-slate-400 transition-colors"
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1.5">Interlink URLs <span className="normal-case text-slate-400">(optional)</span></p>
                                <textarea
                                    value={newInterlinkUrls}
                                    onChange={e => setNewInterlinkUrls(e.target.value)}
                                    placeholder={"One URL per line to interlink in the article:\nhttps://yoursite.com/page-1\nhttps://yoursite.com/page-2"}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#26cece] outline-none rounded-[2px] text-slate-900 font-mono text-[12px] placeholder-slate-400 resize-none transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 bg-[#26cece] hover:bg-[#1fb8b8] text-white font-bold font-mono text-[11px] tracking-widest uppercase rounded-[2px] transition-all hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                                Add to Queue
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={addBulk} className="space-y-3">
                            <textarea
                                required
                                value={bulkTopics}
                                onChange={e => setBulkTopics(e.target.value)}
                                placeholder={"One title per line:\nHow AI is Changing Real Estate\n10 Best SEO Tips for 2025\nWhy Content Marketing Matters"}
                                rows={7}
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#26cece] outline-none rounded-[2px] text-slate-900 font-mono text-[12px] placeholder-slate-400 resize-none transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 bg-[#26cece] hover:bg-[#1fb8b8] text-white font-bold font-mono text-[11px] tracking-widest uppercase rounded-[2px] transition-all hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                                Queue All
                            </button>
                        </form>
                    )}

                    {submitMsg.text && (
                        <div className={`mt-3 p-2.5 rounded-[2px] text-[12px] font-mono flex items-center gap-2 ${submitMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {submitMsg.type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                            {submitMsg.text}
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                            AI auto-researches industry, keywords &amp; content strategy from the title alone. Each article is generated &amp; posted to WordPress automatically.
                        </p>
                    </div>
                </div>

                {/* Queue List */}
                <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[2px] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[11px] font-mono tracking-widest uppercase text-slate-400 flex items-center gap-2">
                            <Clock size={14} /> Queue
                        </h4>
                        <button
                            onClick={fetchQueue}
                            className="text-[11px] font-mono text-slate-400 hover:text-[#26cece] flex items-center gap-1 transition-colors"
                        >
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>

                    {queueLoading ? (
                        <div className="flex justify-center py-12"><Loader className="animate-spin text-[#26cece]" size={24} /></div>
                    ) : queue.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <BarChart2 size={32} className="text-slate-100 mb-3" />
                            <p className="text-[12px] font-mono text-slate-400">No topics in queue yet.</p>
                            <p className="text-[11px] font-mono text-slate-300 mt-1">Add titles on the left to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                            {queue.map(entry => (
                                <div key={entry.id} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-[2px] hover:border-slate-200 transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-mono text-slate-900 truncate">{entry.title}</p>
                                        {entry.niche && (
                                            <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">{entry.niche}</p>
                                        )}
                                    </div>
                                    <span className={`shrink-0 px-2 py-0.5 rounded-[2px] text-[10px] font-mono tracking-widest uppercase flex items-center gap-1 ${STATUS_COLORS[entry.status] || STATUS_COLORS.pending}`}>
                                        {entry.status === 'processing' && <Loader size={9} className="animate-spin" />}
                                        {entry.status}
                                    </span>
                                    {(entry.status === 'pending' || entry.status === 'failed') && (
                                        <button
                                            onClick={() => deleteEntry(entry.id)}
                                            className="shrink-0 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 p-1 rounded transition-all"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── How it works ───────────────────────────── */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-[2px]">
                <Zap size={14} className="text-[#26cece] shrink-0 mt-0.5" />
                <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
                    <span className="text-slate-900 font-bold">How it works:</span> Add article titles → select your WordPress site → turn Auto-Post ON. The scheduler generates one article every <span className="text-[#26cece]">{formatDelay(delayMinutes)}</span> and publishes it directly to your WordPress site. Queue runs in the background 24/7.
                </p>
            </div>
        </div>
    );
}

