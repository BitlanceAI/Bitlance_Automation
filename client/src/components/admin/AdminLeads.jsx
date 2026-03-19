import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, CalendarCheck, BookOpen, Activity, Search, Filter, Check,
    List, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight,
    Clock, Tag, ExternalLink, Phone, Mail, TrendingUp, CheckCircle,
    MoreHorizontal, RefreshCw
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import API_BASE_URL from '../../config.js';
import { supabase } from '../../lib/supabase.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
};

const authFetch = async (url) => {
    const token = await getToken();
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return res.json();
};

const TAG_STYLES = {
    'Booked Demo': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    'Downloaded Guide': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'New Lead': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{value ?? '—'}</p>
        </div>
    </div>
);

const FilterCheckbox = ({ label, active, onClick }) => (
    <label
        className="flex items-center gap-3 cursor-pointer group py-1"
        onClick={(e) => { e.preventDefault(); onClick(); }}
    >
        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors
            ${active ? 'bg-blue-500 border-blue-500' : 'border-neutral-600 bg-neutral-950 group-hover:border-neutral-400'}`}>
            {active && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
        <span className={`text-sm ${active ? 'text-white font-medium' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
            {label}
        </span>
    </label>
);

// ─── Lead Detail Modal ─────────────────────────────────────────────────────────

const LeadModal = ({ lead, onClose, onMarkBooked }) => {
    if (!lead) return null;
    const isBooked = lead.booked || lead.tag === 'Booked Demo';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 p-6 flex justify-between items-start z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-white">{lead.name}</h2>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${TAG_STYLES[lead.tag] || TAG_STYLES['New Lead']}`}>
                                {lead.tag}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-neutral-400">
                            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {lead.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {lead.phone || '—'}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Qualification Answers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-4">
                            <p className="text-xs text-neutral-500 mb-1">Monthly Budget</p>
                            <p className="text-base font-semibold text-white">{lead.monthly_budget || '—'}</p>
                        </div>
                        <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-4">
                            <p className="text-xs text-neutral-500 mb-1">Business Type</p>
                            <p className="text-base font-semibold text-white">{lead.business_type || '—'}</p>
                        </div>
                        <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-4">
                            <p className="text-xs text-neutral-500 mb-1">Ready to Automate</p>
                            <p className="text-base font-semibold text-white capitalize">{lead.ready_to_automate || '—'}</p>
                        </div>
                        <div className="bg-neutral-800/30 border border-neutral-800 rounded-xl p-4">
                            <p className="text-xs text-neutral-500 mb-1">Lead Source</p>
                            <p className="text-base font-semibold text-white">{lead.source || 'Direct'}</p>
                        </div>
                    </div>

                    <hr className="border-neutral-800" />

                    {/* UTM Attribution */}
                    <div>
                        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-blue-400" /> Attribution & UTMs
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {[
                                { label: 'Source', value: lead.utm_source },
                                { label: 'Medium', value: lead.utm_medium },
                                { label: 'Campaign', value: lead.utm_campaign },
                                { label: 'Content', value: lead.utm_content },
                                { label: 'Term', value: lead.utm_term },
                                { label: 'fbclid', value: lead.fbclid ? 'Captured' : null },
                                { label: 'Referrer', value: lead.referrer },
                            ].map(({ label, value }) => (
                                <div key={label} className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
                                    <p className="text-xs text-neutral-500 mb-1">{label}</p>
                                    <p className="text-xs font-medium text-white truncate" title={value}>{value || 'None'}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Calendly Booking */}
                    {isBooked && (lead.booking_start_time || lead.booking_end_time) && (
                        <>
                            <hr className="border-neutral-800" />
                            <div>
                                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CalendarIcon className="w-3.5 h-3.5 text-purple-400" /> Calendly Booking
                                </h3>
                                <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        <span className="text-neutral-400 w-20">Start</span>
                                        <span className="text-white font-medium">{fmtTime(lead.booking_start_time)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                                        <span className="text-neutral-400 w-20">End</span>
                                        <span className="text-white font-medium">{fmtTime(lead.booking_end_time)}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <hr className="border-neutral-800" />

                    {/* Footer actions */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-600">
                            ID: {lead.id} &nbsp;·&nbsp; Created: {fmtDate(lead.created_at)}
                        </span>
                        {!isBooked && (
                            <button
                                onClick={() => onMarkBooked(lead.id)}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                <CheckCircle className="w-4 h-4" /> Mark Booked
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const AdminLeads = () => {
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({ totalLeads: 0, downloadedGuide: 0, bookedDemo: 0, conversionRate: 0 });
    const [viewMode, setViewMode] = useState('list');
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({ tag: [], monthlyBudget: [], businessType: [] });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedLead, setSelectedLead] = useState(null);
    const LIMIT = 20;

    // ── Fetch data ──
    const fetchLeads = useCallback(async (resetPage = false) => {
        setFetching(true);
        try {
            const currentPage = resetPage ? 1 : page;
            const params = new URLSearchParams();
            params.set('page', currentPage);
            params.set('limit', LIMIT);
            if (filters.tag.length) params.set('tag', filters.tag.join(','));
            if (filters.monthlyBudget.length) params.set('monthlyBudget', filters.monthlyBudget.join(','));
            if (filters.businessType.length) params.set('businessType', filters.businessType.join(','));
            if (search) params.set('search', search);

            const data = await authFetch(`${API_BASE_URL}/api/leads?${params}`);
            if (data.success) {
                setLeads(data.data || []);
                setTotal(data.total || 0);
                setTotalPages(data.totalPages || 1);
                if (resetPage) setPage(1);
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setLoading(false);
            setFetching(false);
        }
    }, [page, filters, search]);

    const fetchStats = useCallback(async () => {
        try {
            const data = await authFetch(`${API_BASE_URL}/api/leads/stats`);
            if (data.success) setStats(data.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    useEffect(() => { fetchLeads(); fetchStats(); }, []);
    useEffect(() => { fetchLeads(true); }, [filters, search]);
    useEffect(() => { if (!loading) fetchLeads(); }, [page]);

    // ── Debounce search ──
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const toggleFilter = (category, value) => {
        setFilters(prev => {
            const current = prev[category] || [];
            return {
                ...prev,
                [category]: current.includes(value)
                    ? current.filter(i => i !== value)
                    : [...current, value],
            };
        });
    };

    const markBooked = async (id) => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_BASE_URL}/api/leads/${id}/book`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (data.success) {
                setLeads(prev => prev.map(l => l.id === id ? { ...l, tag: 'Booked Demo', booked: true } : l));
                if (selectedLead?.id === id) setSelectedLead(prev => ({ ...prev, tag: 'Booked Demo', booked: true }));
                setStats(prev => ({
                    ...prev,
                    bookedDemo: prev.bookedDemo + 1,
                    conversionRate: (((prev.bookedDemo + 1) / prev.totalLeads) * 100).toFixed(2),
                }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const clearFilters = () => setFilters({ tag: [], monthlyBudget: [], businessType: [] });
    const hasFilters = filters.tag.length || filters.monthlyBudget.length || filters.businessType.length;

    // ── Calendar events ──
    const calendarEvents = leads
        .filter(l => l.booking_start_time)
        .map(l => ({
            id: l.id,
            title: l.name,
            start: l.booking_start_time,
            end: l.booking_end_time || l.booking_start_time,
            backgroundColor: new Date(l.booking_start_time) < new Date() ? '#ef4444' : '#2563eb',
            borderColor: 'transparent',
            textColor: '#fff',
            extendedProps: { lead: l },
        }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">Lead Pipeline</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">{total} leads total</p>
                </div>
                <button
                    onClick={() => { fetchLeads(); fetchStats(); }}
                    className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Leads" value={stats.totalLeads} icon={<Users className="w-5 h-5" />} color="bg-blue-500/10 text-blue-400" />
                <StatCard title="Downloaded Guide" value={stats.downloadedGuide} icon={<BookOpen className="w-5 h-5" />} color="bg-emerald-500/10 text-emerald-400" />
                <StatCard title="Booked Demo" value={stats.bookedDemo} icon={<CalendarCheck className="w-5 h-5" />} color="bg-purple-500/10 text-purple-400" />
                <StatCard title="Conversion Rate" value={`${stats.conversionRate}%`} icon={<TrendingUp className="w-5 h-5" />} color="bg-amber-500/10 text-amber-400" />
            </div>

            {/* Main layout: sidebar + content */}
            <div className="flex gap-6">

                {/* ── Filter Sidebar ── */}
                <aside className="w-56 flex-shrink-0 hidden lg:block">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sticky top-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                                <Filter className="w-4 h-4 text-blue-400" /> Filters
                            </span>
                            {hasFilters > 0 && (
                                <button onClick={clearFilters} className="text-xs text-blue-400 hover:text-blue-300">
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Stage</p>
                                {['New Lead', 'Downloaded Guide', 'Booked Demo'].map(t => (
                                    <FilterCheckbox key={t} label={t} active={filters.tag.includes(t)} onClick={() => toggleFilter('tag', t)} />
                                ))}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Budget</p>
                                {['Below ₹1L', '₹1–5L', '₹5–15L', '₹15L+'].map(b => (
                                    <FilterCheckbox key={b} label={b} active={filters.monthlyBudget.includes(b)} onClick={() => toggleFilter('monthlyBudget', b)} />
                                ))}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Industry</p>
                                {['E-commerce', 'B2B SaaS', 'Agency', 'Professional Services', 'Real Estate', 'Other'].map(t => (
                                    <FilterCheckbox key={t} label={t} active={filters.businessType.includes(t)} onClick={() => toggleFilter('businessType', t)} />
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Right Content ── */}
                <div className="flex-1 min-w-0 space-y-4">

                    {/* Search + View Toggle */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                placeholder="Search by name or email…"
                                className="w-full bg-neutral-900 border border-neutral-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {[
                                { id: 'list', icon: <List className="w-4 h-4" />, label: 'List' },
                                { id: 'calendar', icon: <CalendarIcon className="w-4 h-4" />, label: 'Calendar' },
                            ].map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setViewMode(v.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${viewMode === v.id
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                                        }`}
                                >
                                    {v.icon} {v.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {fetching && !loading && (
                        <p className="text-xs text-blue-400 animate-pulse">Updating…</p>
                    )}

                    {/* ── List View ── */}
                    {viewMode === 'list' && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-neutral-400">
                                    <thead className="text-xs uppercase text-neutral-600 border-b border-neutral-800 bg-neutral-900/80">
                                        <tr>
                                            <th className="px-5 py-3.5 text-left font-semibold">Lead</th>
                                            <th className="px-5 py-3.5 text-left font-semibold">Budget</th>
                                            <th className="px-5 py-3.5 text-left font-semibold">Stage</th>
                                            <th className="px-5 py-3.5 text-left font-semibold">Source</th>
                                            <th className="px-5 py-3.5 text-left font-semibold">Received</th>
                                            <th className="px-5 py-3.5 text-right font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/60">
                                        {leads.map(lead => (
                                            <tr
                                                key={lead.id}
                                                onClick={() => setSelectedLead(lead)}
                                                className="hover:bg-neutral-800/40 transition-colors cursor-pointer"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-400 text-xs font-bold flex-shrink-0">
                                                            {lead.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white text-sm">{lead.name}</p>
                                                            <p className="text-xs text-neutral-500">{lead.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 font-medium text-white">{lead.monthly_budget || '—'}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${TAG_STYLES[lead.tag] || TAG_STYLES['New Lead']}`}>
                                                        {lead.tag}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-xs text-neutral-400">{lead.utm_source || 'Direct'}</span>
                                                    {lead.utm_campaign && (
                                                        <p className="text-[10px] text-neutral-600 mt-0.5 truncate max-w-[100px]">{lead.utm_campaign}</p>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap text-xs">{fmtDate(lead.created_at)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    {!lead.booked && lead.tag !== 'Booked Demo' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); markBooked(lead.id); }}
                                                            className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Mark Booked
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {leads.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-5 py-12 text-center text-neutral-500">
                                                    No leads found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-5 py-4 border-t border-neutral-800 flex items-center justify-between">
                                    <span className="text-xs text-neutral-500">
                                        Page {page} of {totalPages} &nbsp;·&nbsp; {total} leads
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const p = page <= 3 ? i + 1
                                                : page >= totalPages - 2 ? totalPages - 4 + i
                                                    : page - 2 + i;
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setPage(p)}
                                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="p-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Calendar View ── */}
                    {viewMode === 'calendar' && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                                <h4 className="font-bold text-white">Demo Bookings</h4>
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Upcoming</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Past</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <style>{`
                                    /* FullCalendar dark theme overrides */
                                    .fc { font-family: inherit; }
                                    .fc-theme-standard td, .fc-theme-standard th { border-color: #262626 !important; }
                                    .fc-theme-standard .fc-scrollgrid { border-color: #262626 !important; }
                                    .fc .fc-toolbar-title { color: #fff; font-size: 1.1rem; font-weight: 700; }
                                    .fc .fc-button-primary { background: #3730a3 !important; border: none !important; border-radius: 8px !important; font-weight: 600; font-size: 0.8rem; text-transform: capitalize; padding: 6px 14px; }
                                    .fc .fc-button-primary:hover { background: #4338ca !important; }
                                    .fc .fc-button-primary:not(:disabled).fc-button-active { background: #6366f1 !important; }
                                    .fc .fc-button-primary:disabled { opacity: 0.5; }
                                    .fc .fc-daygrid-day-number { color: #a3a3a3; text-decoration: none; font-weight: 500; font-size: 0.85rem; }
                                    .fc .fc-col-header-cell-cushion { color: #737373; text-decoration: none; font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; }
                                    .fc-day-today { background: rgba(99,102,241,0.05) !important; }
                                    .fc-day-today .fc-daygrid-day-number { color: #818cf8; font-weight: 700; }
                                    .fc-daygrid-day-bg .fc-highlight { background: rgba(99,102,241,0.1) !important; }
                                    .fc-event { border-radius: 6px !important; font-size: 0.78rem; font-weight: 600; padding: 2px 6px; cursor: pointer; transition: filter 0.15s, transform 0.15s; }
                                    .fc-event:hover { filter: brightness(1.15); transform: translateY(-1px); }
                                    .fc-event-main { color: #fff !important; }
                                    .fc-daygrid-event-dot { display: none; }
                                    /* Time grid */
                                    .fc-timegrid-slot { height: 2.5em !important; }
                                    .fc-timegrid-slot-label { color: #525252; font-size: 0.72rem; }
                                    .fc-timegrid-now-indicator-line { border-color: #ef4444; }
                                    .fc-timegrid-now-indicator-arrow { border-color: #ef4444; }
                                    /* Popover (many events on same day) */
                                    .fc-popover { background: #171717 !important; border: 1px solid #404040 !important; border-radius: 12px !important; box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important; z-index: 9999 !important; }
                                    .fc-popover-header { background: #262626 !important; color: #fff !important; font-weight: 700; border-radius: 12px 12px 0 0 !important; padding: 10px 12px !important; }
                                    .fc-popover-close { color: #737373 !important; }
                                    .fc-popover-body { padding: 8px !important; }
                                    /* More link */
                                    .fc-daygrid-more-link { color: #818cf8 !important; font-weight: 700; font-size: 0.72rem; }
                                    .fc-toolbar { flex-wrap: wrap; gap: 8px; }
                                `}</style>
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    height="auto"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                                    }}
                                    dayMaxEvents={3}
                                    moreLinkClick="popover"
                                    nowIndicator
                                    eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                                    events={calendarEvents}
                                    eventClick={(info) => setSelectedLead(info.event.extendedProps.lead)}
                                    eventContent={(arg) => (
                                        <div className="flex items-center gap-1 px-1 overflow-hidden">
                                            <span className="truncate font-semibold text-white text-[11px]">{arg.event.title}</span>
                                        </div>
                                    )}
                                />
                            </div>
                            {calendarEvents.length === 0 && (
                                <div className="py-8 text-center text-neutral-500 text-sm border-t border-neutral-800">
                                    No booked demos yet. Bookings with confirmed times will appear here.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Lead Detail Modal */}
            <LeadModal
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onMarkBooked={(id) => { markBooked(id); setSelectedLead(null); }}
            />
        </div>
    );
};

export default AdminLeads;
