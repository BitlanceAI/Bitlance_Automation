import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Send,
    Upload,
    FileSpreadsheet,
    Users,
    MessageSquare,
    Image,
    Video,
    File,
    X,
    CheckCircle2,
    AlertCircle,
    Info,
    Loader2,
    ChevronDown,
    Sparkles,
    Eye
} from 'lucide-react';

const BroadcastForm = () => {
    const { session } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        message: '',
        mediaUrl: '',
        mediaType: 'image',
        templateId: '',
        variables: []
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [uploadMode, setUploadMode] = useState('url');
    const [csvFile, setCsvFile] = useState(null);
    const [csvRecipients, setCsvRecipients] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [sendMode, setSendMode] = useState('direct'); // 'direct' (n8n) or 'template' (WhatsApp API)
    const [showPreview, setShowPreview] = useState(false);
    const csvInputRef = useRef(null);

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
            setTemplates(response.data || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, mediaUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCsvFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            // Skip header if first line contains 'phone'
            const startIndex = lines[0].toLowerCase().includes('phone') ? 1 : 0;
            const numbers = [];
            for (let i = startIndex; i < lines.length; i++) {
                const cols = lines[i].split(',');
                const phone = cols[0].trim().replace(/['"]/g, '');
                if (phone && phone.length >= 7) numbers.push(phone);
            }
            setCsvRecipients(numbers);
        };
        reader.readAsText(file);
    };

    const removeCsv = () => {
        setCsvFile(null);
        setCsvRecipients([]);
        if (csvInputRef.current) csvInputRef.current.value = '';
    };

    const handleTemplateSelect = (templateId) => {
        const template = templates.find(t => t.id === templateId);
        setSelectedTemplate(template);
        setFormData(prev => ({ ...prev, templateId }));

        // Extract variable placeholders
        if (template) {
            const matches = template.body_text.match(/\{\{(\d+)\}\}/g) || [];
            const vars = matches.map((_, idx) => '');
            setFormData(prev => ({ ...prev, variables: vars }));
        }
    };

    const handleVariableChange = (index, value) => {
        setFormData(prev => {
            const newVars = [...prev.variables];
            newVars[index] = value;
            return { ...prev, variables: newVars };
        });
    };

    const getPreviewText = () => {
        if (!selectedTemplate) return '';
        let text = selectedTemplate.body_text;
        formData.variables.forEach((val, idx) => {
            text = text.replace(`{{${idx + 1}}}`, val || `[Variable ${idx + 1}]`);
        });
        return text;
    };

    const getAllRecipients = () => {
        const manual = formData.phone.split(',').map(p => p.trim()).filter(Boolean);
        return [...new Set([...manual, ...csvRecipients])];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const allRecipients = getAllRecipients();

        if (allRecipients.length === 0) {
            setStatus({ type: 'error', message: 'Please enter at least one phone number or upload a CSV.' });
            setLoading(false);
            return;
        }

        try {
            if (sendMode === 'template') {
                // Use Meta WhatsApp Business API — Template Broadcast
                const token = session?.access_token;
                const payload = new FormData();
                payload.append('name', formData.name || `Broadcast ${new Date().toLocaleString()}`);
                payload.append('sendMode', 'template');
                payload.append('templateName', selectedTemplate?.name || '');
                payload.append('recipients', allRecipients.join(','));
                payload.append('variables', JSON.stringify(formData.variables));
                if (csvFile) payload.append('file', csvFile);

                const response = await axios.post('/api/whatsapp/broadcast', payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });

                const { stats } = response.data;
                setStatus({
                    type: 'success',
                    message: `Broadcast started! ${stats.valid} valid, ${stats.invalid} invalid out of ${stats.total} recipients.`
                });
            } else {
                // Direct send via Meta WhatsApp Business API
                const payload = new FormData();
                payload.append('name', formData.name || `Direct ${new Date().toLocaleString()}`);
                payload.append('sendMode', 'direct');
                payload.append('recipients', allRecipients.join(','));
                payload.append('message', formData.message);
                if (formData.mediaUrl) {
                    payload.append('mediaUrl', formData.mediaUrl);
                    payload.append('mediaType', formData.mediaType || 'image');
                }
                if (csvFile) payload.append('file', csvFile);

                const response = await axios.post('/api/whatsapp/broadcast', payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });

                const { stats } = response.data;
                setStatus({
                    type: 'success',
                    message: `Broadcast started! Sending to ${stats.valid} of ${stats.total} recipients.${stats.invalid > 0 ? ` ${stats.invalid} invalid.` : ''}`
                });
                setFormData(prev => ({ ...prev, message: '', mediaUrl: '' }));
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.error || 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const statusStyles = {
        success: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        error: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    };

    const statusIcons = {
        success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
        error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
        warning: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
        info: <Info className="w-5 h-5 flex-shrink-0" />
    };

    return (
        <div className="space-y-6">
            {/* Send Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-xl">
                <button
                    type="button"
                    onClick={() => setSendMode('direct')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${sendMode === 'direct'
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }`}
                >
                    <Send className="w-4 h-4" />
                    Direct Message
                </button>
                <button
                    type="button"
                    onClick={() => setSendMode('template')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${sendMode === 'template'
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Template Broadcast
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Broadcast Name (Template mode only) */}
                {sendMode === 'template' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Broadcast Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., February Promo Blast"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                )}

                {/* Recipients Section */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Users className="w-4 h-4 text-indigo-500" />
                        Recipients
                    </label>

                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g., 919876543210, 919876543211"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Comma-separated phone numbers. Include country code (e.g., 91 for India).</p>

                    {/* CSV Upload */}
                    <div className="relative">
                        <input
                            ref={csvInputRef}
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleCsvUpload}
                            className="hidden"
                            id="csv-upload"
                        />
                        {!csvFile ? (
                            <label
                                htmlFor="csv-upload"
                                className="flex items-center justify-center gap-3 w-full px-4 py-4 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all group"
                            >
                                <FileSpreadsheet className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    Or upload a CSV file with phone numbers
                                </span>
                            </label>
                        ) : (
                            <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                                    <div>
                                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{csvFile.name}</p>
                                        <p className="text-xs text-indigo-500 dark:text-indigo-400">{csvRecipients.length} recipients found</p>
                                    </div>
                                </div>
                                <button type="button" onClick={removeCsv} className="text-indigo-400 hover:text-red-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Recipient summary */}
                    {getAllRecipients().length > 0 && (
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg">
                            Total unique recipients: {getAllRecipients().length}
                        </div>
                    )}
                </div>

                {/* Template Selection (Template mode) */}
                {sendMode === 'template' && (
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <MessageSquare className="w-4 h-4 text-indigo-500" />
                            Message Template
                        </label>
                        <select
                            value={formData.templateId}
                            onChange={(e) => handleTemplateSelect(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                            required={sendMode === 'template'}
                        >
                            <option value="">Select a template...</option>
                            {templates.filter(t => t.status === 'APPROVED' || t.status === 'PENDING').map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                            ))}
                        </select>

                        {/* Variable Inputs */}
                        {selectedTemplate && formData.variables.length > 0 && (
                            <div className="space-y-2 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Template Variables</p>
                                {formData.variables.map((val, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-gray-400 w-10">{`{{${idx + 1}}}`}</span>
                                        <input
                                            type="text"
                                            value={val}
                                            onChange={(e) => handleVariableChange(idx, e.target.value)}
                                            placeholder={`Value for variable ${idx + 1}`}
                                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Preview */}
                        {selectedTemplate && (
                            <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                <Eye className="w-4 h-4" />
                                {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </button>
                        )}
                        {showPreview && selectedTemplate && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">Message Preview</p>
                                {selectedTemplate.header_text && (
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1">{selectedTemplate.header_text}</p>
                                )}
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{getPreviewText()}</p>
                                {selectedTemplate.footer_text && (
                                    <p className="text-xs text-gray-400 mt-2">{selectedTemplate.footer_text}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Direct Message Body (Direct mode only) */}
                {sendMode === 'direct' && (
                    <>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <MessageSquare className="w-4 h-4 text-indigo-500" />
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                required={sendMode === 'direct'}
                                placeholder="Type your message here..."
                            />
                        </div>

                        {/* Media Attachment */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Media Attachment
                                    </label>
                                    <div className="flex gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => { setUploadMode('url'); setFormData(prev => ({ ...prev, mediaUrl: '' })); }}
                                            className={`px-2 py-1 rounded ${uploadMode === 'url' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            URL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setUploadMode('file'); setFormData(prev => ({ ...prev, mediaUrl: '' })); }}
                                            className={`px-2 py-1 rounded ${uploadMode === 'file' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>

                                {uploadMode === 'url' ? (
                                    <input
                                        type="url"
                                        name="mediaUrl"
                                        value={formData.mediaUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    />
                                ) : (
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept={formData.mediaType === 'image' ? 'image/*' : formData.mediaType === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                )}
                                {uploadMode === 'file' && formData.mediaUrl && (
                                    <p className="mt-1 text-xs text-green-600 truncate">File loaded ✓</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Media Type
                                </label>
                                <select
                                    name="mediaType"
                                    value={formData.mediaType}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setFormData(prev => ({ ...prev, mediaUrl: '' }));
                                    }}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="document">Document</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {/* Status */}
                {status.message && (
                    <div className={`flex items-center gap-3 p-4 rounded-lg border ${statusStyles[status.type]}`}>
                        {statusIcons[status.type]}
                        <span className="text-sm">{status.message}</span>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-6 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            {sendMode === 'template' ? 'Start Broadcast' : 'Send Message'}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default BroadcastForm;
