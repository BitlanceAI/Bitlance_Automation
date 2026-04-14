import React, { useState, useEffect, useCallback } from 'react';
import {
    Mail, Send, RefreshCw, Users, CheckCircle2, Clock,
    XCircle, Zap, UserPlus, Trash2, ChevronDown, ChevronUp,
    Activity, BarChart3, AlertCircle, Loader2, Eye
} from 'lucide-react';
import API_BASE_URL from '../config';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEQUENCE_COLORS = {
    welcome: { bg: 'bg-blue-50 dark:bg-blue-900/20', badge: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    nurture: { bg: 'bg-purple-50 dark:bg-purple-900/20', badge: 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
    reengagement: { bg: 'bg-amber-50 dark:bg-amber-900/20', badge: 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    seo_marketing: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', badge: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
};

const SEQ_STEPS = { welcome: 7, nurture: 8, reengagement: 4, seo_marketing: 5 };

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

// ─── Stats Card ───────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
        </div>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const EmailAutomationPage = () => {
    const [sequences, setSequences] = useState([]);
    const [loading, setLoading] = useState(false);
    const [triggering, setTriggering] = useState(false);
    const [sending, setSending] = useState(false);
    const [expandedId, setExpandedId] = useState(null);

    // Send test email form
    const [testForm, setTestForm] = useState({ to: '', subject: 'Test Email from Bitlance 🚀', html: '<p>Hello! This is a test email from <strong>Bitlance</strong>.</p>' });

    // Enrol form
    const [enrolForm, setEnrolForm] = useState({ email: '', name: '', sequence_type: 'welcome' });
    const [enrolling, setEnrolling] = useState(false);

    // Import SEO leads form
    const [seoImportForm, setSeoImportForm] = useState({ sheetId: '', emailColumn: 'email', nameColumn: 'name' });
    const [importingSeo, setImportingSeo] = useState(false);

    // ── Fetch sequences ──────────────────────────────────────────────────────

    const fetchSequences = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/email-sequences/list`);
            const data = await res.json();
            if (data.success) setSequences(data.sequences || []);
            else toast.error('Failed to load sequences');
        } catch {
            toast.error('Cannot reach server');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSequences(); }, [fetchSequences]);

    // ── Stats ────────────────────────────────────────────────────────────────

    const stats = {
        total: sequences.length,
        active: sequences.filter(s => !s.completed && !s.unsubscribed).length,
        completed: sequences.filter(s => s.completed).length,
        unsubscribed: sequences.filter(s => s.unsubscribed).length,
    };

    // ── Trigger full cycle ───────────────────────────────────────────────────

    const handleTrigger = async () => {
        setTriggering(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/email-sequences/trigger`, { method: 'POST' });
            const data = await res.json();
            if (data.success) { toast.success('Sequence cycle triggered! Due emails sent.'); fetchSequences(); }
            else toast.error(data.error || 'Trigger failed');
        } catch { toast.error('Cannot reach server'); }
        finally { setTriggering(false); }
    };

    // ── Send test email ──────────────────────────────────────────────────────

    const handleSendTest = async (e) => {
        e.preventDefault();
        if (!testForm.to || !testForm.subject) return toast.error('To and Subject are required');
        setSending(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/mailtrap/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testForm),
            });
            const data = await res.json();
            if (data.success) toast.success(`✅ Sent! ID: ${data.messageId}`);
            else toast.error(data.error || 'Send failed');
        } catch { toast.error('Cannot reach server'); }
        finally { setSending(false); }
    };

    // ── Enrol email ──────────────────────────────────────────────────────────

    const handleEnrol = async (e) => {
        e.preventDefault();
        if (!enrolForm.email) return toast.error('Email is required');
        setEnrolling(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/email-sequences/enrol`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrolForm),
            });
            const data = await res.json();
            if (data.success) { toast.success(data.message); setEnrolForm(p => ({ ...p, email: '', name: '' })); fetchSequences(); }
            else toast.error(data.error || 'Enrol failed');
        } catch { toast.error('Cannot reach server'); }
        finally { setEnrolling(false); }
    };

    // ── Delete single sequence ────────────────────────────────────────────────

    const handleDelete = async (email) => {
        if (!window.confirm(`Reset all sequences for ${email}?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/email-sequences/reset`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) { toast.success(data.message); fetchSequences(); }
            else toast.error(data.error || 'Delete failed');
        } catch { toast.error('Cannot reach server'); }
    };

    // ── Import SEO leads from Google Sheets ───────────────────────────────────

    const handleImportSeoLeads = async (e) => {
        e.preventDefault();
        if (!seoImportForm.sheetId) return toast.error('Sheet ID is required');
        setImportingSeo(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/email-sequences/import-seo-leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seoImportForm),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`✅ Imported ${data.enrolled} emails for SEO marketing sequence`);
                setSeoImportForm({ sheetId: '', emailColumn: 'email', nameColumn: 'name' });
                fetchSequences();
                if (data.skippedRows?.length > 0) {
                    console.log('Skipped rows:', data.skippedRows);
                }
            } else {
                toast.error(data.error || 'Import failed');
            }
        } catch { toast.error('Cannot reach server'); }
        finally { setImportingSeo(false); }
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-8 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Automation</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage sequences · Send emails · Monitor delivery</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchSequences}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handleTrigger}
                            disabled={triggering}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-md hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60"
                        >
                            {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Run Sequence Cycle
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={Users} label="Total Enrolled" value={stats.total} color="bg-indigo-500" />
                    <StatCard icon={Activity} label="Active" value={stats.active} color="bg-emerald-500" />
                    <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="bg-blue-500" />
                    <StatCard icon={XCircle} label="Unsubscribed" value={stats.unsubscribed} color="bg-rose-500" />
                </div>

                {/* Two-col actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Send Test Email */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <Send className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send Test Email</h2>
                        </div>
                        <form onSubmit={handleSendTest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                                <input type="email" required value={testForm.to}
                                    onChange={e => setTestForm(p => ({ ...p, to: e.target.value }))}
                                    placeholder="recipient@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                <input type="text" required value={testForm.subject}
                                    onChange={e => setTestForm(p => ({ ...p, subject: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HTML Body</label>
                                <textarea rows={4} value={testForm.html}
                                    onChange={e => setTestForm(p => ({ ...p, html: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none font-mono" />
                            </div>
                            <button type="submit" disabled={sending}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md hover:shadow-indigo-500/40 transition-all disabled:opacity-60">
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {sending ? 'Sending…' : 'Send Email'}
                            </button>
                        </form>
                    </div>

                    {/* Enrol to Sequence */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <UserPlus className="w-5 h-5 text-purple-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Enrol to Sequence</h2>
                        </div>
                        <form onSubmit={handleEnrol} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                                <input type="email" required value={enrolForm.email}
                                    onChange={e => setEnrolForm(p => ({ ...p, email: e.target.value }))}
                                    placeholder="user@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                <input type="text" value={enrolForm.name}
                                    onChange={e => setEnrolForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Optional display name"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sequence</label>
                                <select value={enrolForm.sequence_type}
                                    onChange={e => setEnrolForm(p => ({ ...p, sequence_type: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm">
                                    <option value="welcome">Welcome (7 emails / 14 days)</option>
                                    <option value="nurture">Nurture (8 emails / 21 days)</option>
                                    <option value="reengagement">Re-engagement (4 emails / 14 days)</option>
                                    <option value="seo_marketing">SEO Marketing (5 emails / 14 days)</option>
                                </select>
                            </div>
                            <button type="submit" disabled={enrolling}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold shadow-md hover:shadow-purple-500/40 transition-all disabled:opacity-60">
                                {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                {enrolling ? 'Enrolling…' : 'Enrol & Schedule'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Import SEO Leads from Google Sheets */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl shadow-sm border border-emerald-200 dark:border-emerald-800 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import SEO Marketing Leads</h2>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Bulk import emails from Google Sheets to send SEO AI agent marketing sequence</p>
                        </div>
                    </div>
                    <form onSubmit={handleImportSeoLeads} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Google Sheet ID *</label>
                                <input type="text" required value={seoImportForm.sheetId}
                                    onChange={e => setSeoImportForm(p => ({ ...p, sheetId: e.target.value }))}
                                    placeholder="1a2b3c4d5e6f7g8h9i0j..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Column Name</label>
                                <input type="text" value={seoImportForm.emailColumn}
                                    onChange={e => setSeoImportForm(p => ({ ...p, emailColumn: e.target.value }))}
                                    placeholder="email"
                                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name Column Name</label>
                                <input type="text" value={seoImportForm.nameColumn}
                                    onChange={e => setSeoImportForm(p => ({ ...p, nameColumn: e.target.value }))}
                                    placeholder="name"
                                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                Make sure your Google Sheet has email and name columns. First row will be treated as headers. After import, run "Run Sequence Cycle" to send the first email immediately.
                            </p>
                        </div>
                        <button type="submit" disabled={importingSeo}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-md hover:shadow-emerald-500/40 transition-all disabled:opacity-60">
                            {importingSeo ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                            {importingSeo ? 'Importing…' : 'Import & Enrol'}
                        </button>
                    </form>
                </div>

                {/* Sequence List */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Sequences</h2>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-medium text-gray-500 dark:text-gray-400">{sequences.length}</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading sequences…
                        </div>
                    ) : sequences.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                            <Mail className="w-10 h-10 mb-3 opacity-40" />
                            <p>No email sequences yet. Enrol someone to get started.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-slate-700">
                            {sequences.map((seq) => {
                                const colors = SEQUENCE_COLORS[seq.sequence_type] || SEQUENCE_COLORS.welcome;
                                const totalSteps = SEQ_STEPS[seq.sequence_type] || 7;
                                const progress = Math.round((seq.current_step / totalSteps) * 100);
                                const isExpanded = expandedId === seq.id;

                                return (
                                    <div key={seq.id} className={`transition-colors ${colors.bg}`}>
                                        <div
                                            className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                            onClick={() => setExpandedId(isExpanded ? null : seq.id)}
                                        >
                                            {/* Dot */}
                                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${seq.completed ? 'bg-blue-500' : seq.unsubscribed ? 'bg-rose-500' : colors.dot}`} />

                                            {/* Email + badge */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{seq.email}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>{seq.sequence_type}</span>
                                                    {seq.completed && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300">✓ completed</span>}
                                                    {seq.unsubscribed && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-300">✗ unsub</span>}
                                                </div>
                                                {/* Progress bar */}
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">Step {seq.current_step}/{totalSteps}</span>
                                                </div>
                                            </div>

                                            {/* Next send */}
                                            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                                <Clock className="w-3.5 h-3.5" />
                                                {seq.completed ? 'Done' : seq.next_send_at ? formatDate(seq.next_send_at) : '—'}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(seq.email); }}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                                    title="Reset sequences for this email"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                            </div>
                                        </div>

                                        {/* Expanded details */}
                                        {isExpanded && (
                                            <div className="px-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                                {[
                                                    { label: 'Created', value: formatDate(seq.created_at) },
                                                    { label: 'Next Send', value: formatDate(seq.next_send_at) },
                                                    { label: 'Metadata', value: JSON.stringify(seq.metadata || {}) },
                                                    { label: 'User ID', value: seq.user_id || 'anonymous' },
                                                ].map(({ label, value }) => (
                                                    <div key={label} className="bg-white/60 dark:bg-slate-900/40 rounded-lg p-2.5">
                                                        <p className="text-gray-400 dark:text-gray-500 font-medium mb-0.5">{label}</p>
                                                        <p className="text-gray-700 dark:text-gray-300 break-all">{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Info box */}
                <div className="flex gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-sm text-indigo-700 dark:text-indigo-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>The email sequence cron runs automatically every <strong>30 minutes</strong> in the background. Use "Run Sequence Cycle" to trigger it manually for testing.</p>
                </div>
            </div>
        </div>
    );
};

export default EmailAutomationPage;
