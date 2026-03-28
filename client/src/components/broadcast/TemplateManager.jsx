import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import { Plus, Search, FileText, CheckCircle, XCircle, Clock, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";
import API_BASE_URL from '../../config';

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

            const response = await axios.get(`${API_BASE_URL}/api/whatsapp/templates`, {
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

            await axios.post(`${API_BASE_URL}/api/whatsapp/templates`, newTemplate, {
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

            const response = await axios.post(`${API_BASE_URL}/api/whatsapp/sync-templates`, {}, {
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
            case "APPROVED":
                return <span className="inline-flex items-center px-2 py-1 border border-[#26cece] bg-[#26cece]/10 text-[#26cece] text-[10px] uppercase font-bold tracking-widest font-mono"><CheckCircle className="w-3 h-3 mr-1" /> APPROVED</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2 py-1 border border-red-500 bg-red-500/10 text-red-500 text-[10px] uppercase font-bold tracking-widest font-mono"><XCircle className="w-3 h-3 mr-1" /> REJECTED</span>;
            default:
                return <span className="inline-flex items-center px-2 py-1 border border-yellow-500 bg-yellow-500/10 text-yellow-500 text-[10px] uppercase font-bold tracking-widest font-mono"><Clock className="w-3 h-3 mr-1" /> PENDING</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-[#333] pb-4">
                <div>
                    <h3 className="text-xl font-bold font-['Space_Grotesk'] text-gray-900 dark:text-white uppercase tracking-widest">Template Matrix</h3>
                    <p className="text-[10px] uppercase tracking-widest text-[#26cece] font-mono mt-1">&gt; System Templates & Assets</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={syncFromMeta}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] hover:border-[#26cece] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-mono text-[10px] font-bold tracking-widest uppercase disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-[#26cece]' : ''}`} />
                        {syncing ? 'SYNCING...' : 'PULL META ENV'}
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-[#26cece] text-[#070707] hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-0.5 border border-[#070707] px-4 py-2 font-bold font-mono text-[10px] tracking-widest uppercase transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        INIT NEW_TPL
                    </button>
                </div>
            </div>

            {/* Template List */}
            {loading ? (
                <div className="text-center py-10 font-mono text-[#26cece] text-[10px] uppercase tracking-widest flex justify-center items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> FETCHING TEMPLATES...
                </div>
            ) : templates.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333]">
                    <FileText className="w-10 h-10 text-gray-300 dark:text-[#333] mx-auto mb-4" />
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest max-w-sm mx-auto">&gt; NO TEMPLATES REGISTERED. INITIALIZE A NEW MATRIX TO PROCEED.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] hover:border-[#26cece] transition-colors flex flex-col h-full group">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold font-mono text-gray-900 dark:text-white text-sm" title={template.name}>{template.name}</h4>
                                    {getStatusBadge(template.status)}
                                </div>
                                <div className="mb-4">
                                    <span className="inline-block px-2 py-1 text-[8px] font-mono font-bold tracking-widest uppercase bg-[#26cece]/10 text-[#26cece] border border-[#26cece]">
                                        {template.category}
                                    </span>
                                    <span className="text-[8px] font-mono tracking-widest text-gray-500 uppercase ml-2 border border-gray-200 dark:border-[#333] px-2 py-1">
                                        LANG: {template.language}
                                    </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#070707] border border-gray-200 dark:border-[#333] p-4 text-sm font-mono group-hover:border-[#26cece] transition-colors relative overflow-hidden flex-1 h-32 overflow-y-auto">
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gray-200 dark:bg-[#333] group-hover:bg-[#26cece] transition-colors"></div>
                                    {template.header_text && <div className="font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase text-[10px] tracking-widest border-b border-gray-200 dark:border-[#333] pb-2">{template.header_text}</div>}
                                    <div className="text-gray-500 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                        {template.body_text}
                                    </div>
                                    {template.footer_text && <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 uppercase tracking-widest border-t border-gray-200 dark:border-[#333] pt-2">{template.footer_text}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Template Modal */}
            {showCreateModal && (
                <div className="bg-gray-900/80 dark:bg-black/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#070707] border border-gray-200 dark:border-[#333] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[4px_4px_0_0_#26cece] animate-fade-in-up">
                        <div className="p-6 border-b border-gray-200 dark:border-[#333] flex justify-between items-center bg-gray-50 dark:bg-[#111111]">
                            <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#26cece] uppercase tracking-widest">Construct New Template</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-red-500 border border-transparent hover:border-red-500 hover:bg-red-500/10 p-1 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTemplate} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-2">Matrix Identifier</label>
                                    <input
                                        type="text"
                                        value={newTemplate.name}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none shrink-0"
                                        placeholder="> welcome_message"
                                        required
                                    />
                                    <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase tracking-widest">&gt; Lowercase &amp; underscores only</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-2">Matrix Classification</label>
                                    <select
                                        value={newTemplate.category}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm appearance-none rounded-none"
                                    >
                                        <option value="MARKETING">MARKETING VECTOR</option>
                                        <option value="TRANSACTIONAL">UTILITY NODE</option>
                                        <option value="AUTHENTICATION">AUTH PROTOCOL</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-2">Header Block (Optional)</label>
                                <input
                                    type="text"
                                    value={newTemplate.header_text}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, header_text: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none"
                                    placeholder="> ALERT: Order Update"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase">Body Payload Vector <span className="text-red-500">*</span></label>
                                    <span className="text-[10px] font-mono tracking-widest text-[#26cece]">&gt; USE {"{{1}}"}, {"{{2}}"} FOR INJECTION</span>
                                </div>
                                <textarea
                                    value={newTemplate.body_text}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body_text: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none resize-none"
                                    placeholder="> Hello {{1}}, your order #{{2}} is confirmed."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-2">Footer Block (Optional)</label>
                                <input
                                    type="text"
                                    value={newTemplate.footer_text}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, footer_text: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none"
                                    placeholder="> Reply STOP to break connection"
                                />
                            </div>

                            <div className="pt-6 border-t border-gray-200 dark:border-[#333] flex justify-end gap-4 bg-gray-50 dark:bg-[#111111] -mx-6 -mb-6 p-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-3 font-bold font-mono tracking-widest text-[10px] uppercase text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    ABORT
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-[#26cece] text-[#070707] px-8 py-3 font-bold font-mono uppercase tracking-widest text-[10px] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#333] border border-[#070707]"
                                >
                                    SUBMIT FOR APPROVAL
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
