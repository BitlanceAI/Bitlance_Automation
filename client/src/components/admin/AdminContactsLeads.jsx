import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, RefreshCw, Mail, Phone, Calendar as CalendarIcon, Tag, Clock } from 'lucide-react';
import API_BASE_URL from '../../config.js';
import { supabase } from '../../lib/supabase.js';

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

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '—';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-colors duration-300">
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
        <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value ?? '—'}</p>
        </div>
    </div>
);

const AdminContactsLeads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 20;

    const fetchLeads = useCallback(async (resetPage = false) => {
        setFetching(true);
        try {
            const currentPage = resetPage ? 1 : page;
            const params = new URLSearchParams();
            params.set('page', currentPage);
            params.set('limit', LIMIT);
            if (search) params.set('search', search);

            const data = await authFetch(`${API_BASE_URL}/api/leads/contacts?${params}`);
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
    }, [page, search]);

    useEffect(() => { fetchLeads(); }, []);
    useEffect(() => { fetchLeads(true); }, [search]);
    useEffect(() => { if (!loading) fetchLeads(); }, [page]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Contact Submissions</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{total} total submissions</p>
                </div>
                <button
                    onClick={() => fetchLeads()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Leads" value={total} icon={<Users className="w-5 h-5" />} color="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
            </div>

            {/* Main content */}
            <div className="space-y-4">
                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            placeholder="Search by name or email…"
                            className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60"
                        />
                    </div>
                </div>

                {fetching && !loading && (
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 animate-pulse">Updating…</p>
                )}

                {/* List View */}
                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-gray-600 dark:text-gray-400">
                            <thead className="text-xs uppercase text-gray-500 dark:text-gray-500 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-5 py-3.5 text-left font-semibold">Lead Details</th>
                                    <th className="px-5 py-3.5 text-left font-semibold">Contact Info</th>
                                    <th className="px-5 py-3.5 text-left font-semibold">Message</th>
                                    <th className="px-5 py-3.5 text-right font-semibold">Received Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                                {leads.map(lead => {
                                    // Parse company to get phone and service
                                    const parts = lead.company ? lead.company.split('|') : [];
                                    const phone = parts[0] ? parts[0].trim() : 'No phone';
                                    const service = parts[1] ? parts[1].trim() : 'General';

                                    return (
                                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0">
                                                        {lead.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{lead.name}</p>
                                                        <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                                            {service}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-gray-700 dark:text-gray-300">{lead.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-gray-700 dark:text-gray-300">{phone}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 max-w-xs">
                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={lead.message}>
                                                    {lead.message || <span className="italic text-gray-400">No message</span>}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex flex-col items-end text-xs">
                                                    <span className="text-gray-900 dark:text-white font-medium">{fmtDate(lead.created_at)}</span>
                                                    <span className="text-gray-500 mt-0.5">{fmtTime(lead.created_at)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-gray-500 dark:text-gray-500">
                                            No contact submissions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Page <span className="font-medium text-gray-900 dark:text-white">{page}</span> of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminContactsLeads;
