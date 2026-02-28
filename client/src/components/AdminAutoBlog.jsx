import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Calendar, Settings, Plus, Trash2, Clock } from 'lucide-react';
import * as xlsx from 'xlsx';

const AdminAutoBlog = () => {
    const { user, token } = useAuth();

    // Tabs state
    const [activeTab, setActiveTab] = useState('bulk'); // 'bulk' or 'schedule'

    // --- BULK UPLOAD STATE ---
    const [file, setFile] = useState(null);
    const [bulkStatus, setBulkStatus] = useState('idle'); // idle, uploading, success, error
    const [bulkMessage, setBulkMessage] = useState('');

    // --- SCHEDULE STATE ---
    const [isCronEnabled, setIsCronEnabled] = useState(false);
    const [cronLoading, setCronLoading] = useState(false);
    const [scheduledBlogs, setScheduledBlogs] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(true);

    // New schedule form
    const [newSchedule, setNewSchedule] = useState({ niche: '', title: '', keywords: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (activeTab === 'schedule') {
            fetchSettings();
            fetchScheduledBlogs();
        }
    }, [activeTab]);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/auto-blog/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.settings) {
                setIsCronEnabled(data.settings.is_enabled);
            }
        } catch (err) {
            console.error('Failed to fetch cron settings:', err);
        }
    };

    const fetchScheduledBlogs = async () => {
        setScheduleLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/auto-blog/schedule`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setScheduledBlogs(data.entries);
            }
        } catch (err) {
            console.error('Failed to fetch scheduled blogs:', err);
        } finally {
            setScheduleLoading(false);
        }
    };

    const toggleCron = async () => {
        setCronLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/auto-blog/settings/toggle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_enabled: !isCronEnabled })
            });
            const data = await res.json();
            if (data.success) {
                setIsCronEnabled(!isCronEnabled);
            }
        } catch (err) {
            console.error('Failed to toggle cron:', err);
        } finally {
            setCronLoading(false);
        }
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/auto-blog/schedule`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSchedule)
            });
            const data = await res.json();

            if (data.success) {
                setSubmitMessage({ type: 'success', text: 'Scheduled successfully!' });
                setNewSchedule({ niche: '', title: '', keywords: '' });
                fetchScheduledBlogs();
            } else {
                setSubmitMessage({ type: 'error', text: data.error || 'Failed to schedule' });
            }
        } catch (err) {
            setSubmitMessage({ type: 'error', text: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteSchedule = async (id) => {
        if (!window.confirm('Are you sure you want to delete this scheduled blog?')) return;
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/admin/auto-blog/schedule/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchScheduledBlogs();
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };


    // --- BULK UPLOAD HANDLERS ---
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && (selected.name.endsWith('.xlsx') || selected.name.endsWith('.xls'))) {
            setFile(selected);
            setBulkStatus('idle');
            setBulkMessage('');
        } else {
            setFile(null);
            setBulkStatus('error');
            setBulkMessage('Please select a valid Excel file (.xlsx or .xls)');
        }
    };

    const handleDownloadTemplate = () => {
        const ws = xlsx.utils.json_to_sheet([
            {
                'Niche / Industry': 'Real Estate',
                'Title / Topic': 'How AI is Transforming Property Management in 2025',
                'Keywords': 'AI real estate, property management, smart homes'
            },
            {
                'Niche / Industry': 'Cybersecurity',
                'Title / Topic': 'Top 10 Cyber Threats SMBs Face in 2025',
                'Keywords': 'cybersecurity, SMB, data breach, ransomware'
            },
            {
                'Niche / Industry': 'E-Commerce',
                'Title / Topic': 'How to Increase Conversions with Personalisation',
                'Keywords': 'e-commerce, conversion rate, personalisation, UX'
            }
        ]);
        // Set column widths for readability
        ws['!cols'] = [{ wch: 22 }, { wch: 52 }, { wch: 45 }];
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Blog Queue');
        xlsx.writeFile(wb, 'AutoBlog_Template.xlsx');
    };


    const handleUpload = async () => {
        if (!file) return;
        setBulkStatus('uploading');
        setBulkMessage('Uploading and starting bulk generation...');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/articles/bulk-generate`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setBulkStatus('success');
                setBulkMessage(data.message || 'Bulk processing started successfully!');
                setFile(null);
            } else {
                throw new Error(data.error || 'Failed to upload file');
            }
        } catch (error) {
            setBulkStatus('error');
            setBulkMessage(error.message || 'An error occurred during upload.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Auto Blog Management</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Upload bulk entries or schedule regular automated posts</p>
                </div>

                {activeTab === 'bulk' && (
                    <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
                        <FileText size={16} /> Download Template
                    </button>
                )}
                {activeTab === 'schedule' && (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">5-Hour Cron:</span>
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

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('bulk')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bulk' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                    <Upload size={16} className="inline mr-2" /> Bulk Upload Matrix
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                    <Calendar size={16} className="inline mr-2" /> Scheduled Queue (Cron)
                </button>
            </div>

            {/* Content Container */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-slate-700 shadow-sm">

                {/* BULK UPLOAD TAB */}
                {activeTab === 'bulk' && (
                    <div className="max-w-xl mx-auto">
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-12 text-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={bulkStatus === 'uploading'}
                            />
                            <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                                <div className="p-4 bg-indigo-50 dark:bg-slate-700 rounded-full text-indigo-600 dark:text-indigo-400">
                                    <Upload size={32} />
                                </div>
                                <div>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                        {file ? file.name : 'Click or drag Excel file to upload'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Supports .xlsx and .xls (Max 5MB)</p>
                                </div>
                            </div>
                        </div>

                        {bulkStatus === 'error' && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm text-red-800 dark:text-red-300 font-medium">{bulkMessage}</p>
                            </div>
                        )}

                        {/* Column format legend */}
                        <div className="mt-5 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-3 uppercase tracking-wide">Required Excel Column Headers</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                {[
                                    { col: 'Niche / Industry', example: 'Real Estate', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
                                    { col: 'Title / Topic', example: 'How AI changes X…', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
                                    { col: 'Keywords', example: 'AI, automation, X', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
                                ].map(({ col, example, color }) => (
                                    <div key={col} className={`px-3 py-2 rounded-lg ${color}`}>
                                        <p className="font-semibold text-xs">{col}</p>
                                        <p className="text-xs opacity-70 mt-0.5 italic">{example}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 text-center">
                                Column names must match exactly. <button onClick={handleDownloadTemplate} className="underline font-semibold hover:text-indigo-800">Download template</button> to get started.
                            </p>
                        </div>


                        {bulkStatus === 'success' && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
                                <CheckCircle className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" size={18} />
                                <div className="text-sm text-green-800 dark:text-green-300 font-medium whitespace-pre-line">{bulkMessage}</div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleUpload}
                                disabled={!file || bulkStatus === 'uploading'}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium transition-colors ${!file || bulkStatus === 'uploading' ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {bulkStatus === 'uploading' ? <><Loader size={18} className="animate-spin" /> Uploading...</> : <><Upload size={18} /> Upload & Process</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* SCHEDULED QUEUE TAB */}
                {activeTab === 'schedule' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Queue List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Clock size={18} /> Scheduled Queue
                            </h4>

                            {scheduleLoading ? (
                                <div className="flex justify-center p-8"><Loader className="animate-spin text-indigo-500" /></div>
                            ) : scheduledBlogs.length === 0 ? (
                                <div className="text-center p-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl text-gray-500 dark:text-gray-400 text-sm">
                                    No scheduled blogs found.
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                        <thead className="bg-gray-50 dark:bg-slate-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Title & Niche</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                            {scheduledBlogs.map(blog => (
                                                <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{blog.title}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{blog.niche} • {blog.keywords.substring(0, 30)}...</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${blog.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            blog.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                                blog.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                    'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300'
                                                            }`}>
                                                            {blog.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {(blog.status === 'pending' || blog.status === 'failed') && (
                                                            <button onClick={() => deleteSchedule(blog.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                                                <Trash2 size={16} />
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
                                <Plus size={18} /> Schedule New Blog
                            </h4>

                            <form onSubmit={handleScheduleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Niche / Industry</label>
                                    <input
                                        type="text" required
                                        value={newSchedule.niche} onChange={e => setNewSchedule({ ...newSchedule, niche: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        placeholder="E.g., Cybersecurity"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title / Topic</label>
                                    <input
                                        type="text" required
                                        value={newSchedule.title} onChange={e => setNewSchedule({ ...newSchedule, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        placeholder="Focus on specific topic"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords</label>
                                    <input
                                        type="text" required
                                        value={newSchedule.keywords} onChange={e => setNewSchedule({ ...newSchedule, keywords: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        placeholder="Comma separated keywords"
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
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center"
                                >
                                    {isSubmitting ? <Loader size={16} className="animate-spin mr-2" /> : 'Add to Queue'}
                                </button>

                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 text-center">
                                    The global cron process generates one pending blog every 5 hours when enabled.
                                </p>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAutoBlog;
