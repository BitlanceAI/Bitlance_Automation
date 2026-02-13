import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Plus, Search, FileText, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const TemplateManager = () => {
    const { session } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        category: 'MARKETING',
        language: 'en',
        body_text: '',
        header_text: '',
        footer_text: ''
    });

    useEffect(() => {
        if (session) {
            fetchTemplates();
        }
    }, [session]);

    const fetchTemplates = async () => {
        try {
            const token = session?.access_token;
            if (!token) return;

            const response = await axios.get('/api/whatsapp/templates', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            const token = session?.access_token;
            if (!token) return;

            await axios.post('/api/whatsapp/templates', newTemplate, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Template submitted for approval');
            setShowCreateModal(false);
            setNewTemplate({
                name: '',
                category: 'MARKETING',
                language: 'en',
                body_text: '',
                header_text: '',
                footer_text: ''
            });
            fetchTemplates();
        } catch (error) {
            console.error('Error creating template:', error);
            toast.error('Failed to create template');
        }
    };

    const syncFromMeta = async () => {
        setSyncing(true);
        try {
            const token = session?.access_token;
            if (!token) return;

            const response = await axios.post('/api/whatsapp/sync-templates', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(response.data.message || 'Templates synced!');
            fetchTemplates();
        } catch (error) {
            console.error('Sync error:', error);
            toast.error('Failed to sync templates from Meta');
        } finally {
            setSyncing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Message Templates</h3>
                <div className="flex gap-2">
                    <button
                        onClick={syncFromMeta}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync from Meta'}
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Template
                    </button>
                </div>
            </div>

            {/* Template List */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : templates.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No templates found. Create your first one!</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={template.name}>{template.name}</h4>
                                {getStatusBadge(template.status)}
                            </div>
                            <div className="mb-3">
                                <span className="text-xs font-mono bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{template.category}</span>
                                <span className="text-xs text-gray-500 ml-2">{template.language}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg text-sm text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {template.header_text && <div className="font-bold mb-1">{template.header_text}</div>}
                                {template.body_text}
                                {template.footer_text && <div className="text-xs text-gray-400 mt-2">{template.footer_text}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Template Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Template</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-500">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
                                    <input
                                        type="text"
                                        value={newTemplate.name}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        placeholder="welcome_message"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Lowercase, underscores only</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <select
                                        value={newTemplate.category}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="MARKETING">Marketing</option>
                                        <option value="TRANSACTIONAL">Utility/Transactional</option>
                                        <option value="AUTHENTICATION">Authentication</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Header (Optional)</label>
                                <input
                                    type="text"
                                    value={newTemplate.header_text}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, header_text: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Order Update"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body Text</label>
                                <textarea
                                    value={newTemplate.body_text}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body_text: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Hello {{1}}, your order #{{2}} is confirmed."
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Use <code>{`{{1}}`}</code>, <code>{`{{2}}`}</code> for variables.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Footer (Optional)</label>
                                <input
                                    type="text"
                                    value={newTemplate.footer_text}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, footer_text: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Reply STOP to unsubscribe"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    Submit for Approval
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplateManager;
