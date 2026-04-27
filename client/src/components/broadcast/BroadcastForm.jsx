import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API_BASE_URL from '../../config';
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
} from "lucide-react";

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

            const response = await axios.get(`${API_BASE_URL}/api/whatsapp/templates`, {
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
                const phone = cols[0].trim().replace(/[""]/g, '');
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
            const token = session?.access_token;

            // Trigger n8n Webhook
            const response = await fetch('https://bitlancetechhub.app.n8n.cloud/webhook/broadcast-bitlance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name || `Broadcast ${new Date().toLocaleString()}`,
                    sendMode: sendMode,
                    recipients: allRecipients,
                    message: formData.message,
                    mediaUrl: formData.mediaUrl,
                    mediaType: formData.mediaType,
                    templateName: selectedTemplate?.name || '',
                    variables: formData.variables
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to send to webhook: ${response.statusText}`);
            }

            setStatus({
                type: 'success',
                message: `Broadcast data successfully sent to webhook for ${allRecipients.length} recipients.`
            });

            if (sendMode !== 'template') {
                setFormData(prev => ({ ...prev, message: '', mediaUrl: '' }));
            }
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.error || 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const statusStyles = {
        success: 'bg-[#26cece]/10 text-[#26cece] border-[#26cece] shadow-[0_2px_16px_0_rgba(0,0,0,0.4)]',
        error: 'bg-red-500/10 text-red-500 border-red-500 shadow-[4px_4px_0_0_#ef4444]',
        warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500 shadow-[4px_4px_0_0_#eab308]',
        info: 'bg-blue-500/10 text-blue-500 border-blue-500 shadow-[4px_4px_0_0_#3b82f6]'
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
            <div className="flex flex-col sm:flex-row gap-2 border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111111] p-1">
                <button
                    type="button"
                    onClick={() => setSendMode('direct')}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-[10px] sm:text-xs font-bold font-mono tracking-widest uppercase transition-all ${sendMode === 'direct'
                        ? 'bg-[#26cece] text-[#070707] shadow-[2px_2px_0_0_#333] -translate-y-0.5'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-[#333] bg-transparent'
                        }`}
                >
                    <Send className="w-4 h-4" />
                    Direct Message
                </button>
                <button
                    type="button"
                    onClick={() => setSendMode('template')}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-[10px] sm:text-xs font-bold font-mono tracking-widest uppercase transition-all ${sendMode === 'template'
                        ? 'bg-[#26cece] text-[#070707] shadow-[2px_2px_0_0_#333] -translate-y-0.5'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-[#333] bg-transparent'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    Template Broadcast
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Broadcast Name (Template mode only) */}
                {sendMode === 'template' && (
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] p-6">
                        <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-4">
                            Broadcast Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="> e.g., February Promo Blast"
                            className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none"
                        />
                    </div>
                )}

                {/* Recipients Section */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] p-6 space-y-4">
                    <label className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#26cece] uppercase">
                        <Users className="w-4 h-4 text-[#26cece]" />
                        Recipients Vector
                    </label>

                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="> e.g., 919876543210, 919876543211"
                        className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600 rounded-none"
                    />
                    <p className="text-[10px] tracking-widest uppercase text-gray-500">&gt; Comma-separated numbers. Include country code.</p>

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
                                className="flex flex-col items-center justify-center gap-3 w-full px-4 py-8 border border-dashed border-gray-300 dark:border-[#333] bg-gray-50 dark:bg-[#070707] cursor-pointer hover:border-[#26cece] hover:bg-[#26cece]/5 transition-all group rounded-none"
                            >
                                <div className="mb-2 p-4 border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111111] inline-flex group-hover:bg-[#26cece] group-hover:border-[#26cece] transition-colors">
                                    <FileSpreadsheet className="w-6 h-6 text-[#26cece] group-hover:text-[#070707]" />
                                </div>
                                <span className="text-xs font-bold tracking-widest uppercase text-gray-700 dark:text-white group-hover:text-[#26cece]">
                                    Upload CSV Payload
                                </span>
                            </label>
                        ) : (
                            <div className="flex items-center justify-between px-4 py-4 bg-[#26cece]/10 border border-[#26cece] shadow-[0_2px_16px_0_rgba(0,0,0,0.4)] rounded-none">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 dark:bg-[#070707] border border-[#26cece]">
                                        <FileSpreadsheet className="w-5 h-5 text-[#26cece]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold font-mono text-[#26cece] tracking-widest uppercase">{csvFile.name}</p>
                                        <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">&gt; {csvRecipients.length} targets extracted</p>
                                    </div>
                                </div>
                                <button type="button" onClick={removeCsv} className="p-2 border border-transparent hover:border-red-500 hover:bg-red-500/10 text-red-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Recipient summary */}
                    {getAllRecipients().length > 0 && (
                        <div className="text-[10px] text-[#26cece] font-bold font-mono tracking-widest uppercase bg-[#26cece]/10 border border-[#26cece] px-4 py-3 mt-4">
                            &gt; Active Targets: {getAllRecipients().length}
                        </div>
                    )}
                </div>

                {/* Template Selection (Template mode) */}
                {sendMode === 'template' && (
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] p-6 space-y-6">
                        <label className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#26cece] uppercase">
                            <MessageSquare className="w-4 h-4 text-[#26cece]" />
                            Template Matrix
                        </label>
                        <select
                            value={formData.templateId}
                            onChange={(e) => handleTemplateSelect(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm rounded-none appearance-none"
                            required={sendMode === 'template'}
                        >
                            <option value="">&gt; SELECT TEMPLATE BASE...</option>
                            {templates.filter(t => t.status === 'APPROVED' || t.status === 'PENDING').map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                            ))}
                        </select>

                        {/* Variable Inputs */}
                        {selectedTemplate && formData.variables.length > 0 && (
                            <div className="space-y-4 p-5 bg-gray-50 dark:bg-[#070707] border border-gray-200 dark:border-[#333]">
                                <p className="text-[10px] font-bold font-mono tracking-widest text-[#26cece] uppercase mb-4">Injection Variables</p>
                                {formData.variables.map((val, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className="text-[10px] font-mono font-bold text-[#26cece] bg-[#26cece]/10 px-2 py-1 border border-[#26cece]">{`{{${idx + 1}}}`}</span>
                                        <input
                                            type="text"
                                            value={val}
                                            onChange={(e) => handleVariableChange(idx, e.target.value)}
                                            placeholder={`> Value for {{${idx + 1}}}`}
                                            className="flex-1 px-4 py-3 text-sm border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none font-mono rounded-none placeholder-gray-400 dark:placeholder-gray-600"
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
                                className="flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-gray-500 hover:text-[#26cece] transition-colors mt-4"
                            >
                                <Eye className="w-4 h-4" />
                                {showPreview ? 'DISABLE PREVIEW' : 'ENABLE PREVIEW'}
                            </button>
                        )}
                        {showPreview && selectedTemplate && (
                            <div className="p-5 bg-gray-50 dark:bg-[#070707] border border-gray-200 dark:border-[#333] shadow-[0_2px_16px_0_rgba(0,0,0,0.4)] mt-4">
                                <p className="text-[10px] font-bold tracking-widest text-[#26cece] uppercase mb-4 border-b border-gray-200 dark:border-[#333] pb-2">Simulation Output</p>
                                {selectedTemplate.header_text && (
                                    <p className="font-bold font-['Space_Grotesk'] tracking-widest uppercase text-gray-900 dark:text-white mb-2">{selectedTemplate.header_text}</p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">{getPreviewText()}</p>
                                {selectedTemplate.footer_text && (
                                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-4 border-t border-gray-200 dark:border-[#333] pt-2">{selectedTemplate.footer_text}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Direct Message Body (Direct mode only) */}
                {sendMode === 'direct' && (
                    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] p-6 space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-4">
                                <MessageSquare className="w-4 h-4 text-[#26cece]" />
                                Payload Body
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="6"
                                className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none resize-none transition-colors rounded-none font-mono text-sm placeholder-gray-400 dark:placeholder-gray-600"
                                required={sendMode === 'direct'}
                                placeholder="> Type your message here..."
                            />
                        </div>

                        {/* Media Attachment */}
                        <div className="pt-6 border-t border-gray-200 dark:border-[#333]">
                            <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-4">
                                Attached Assets
                            </label>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-widest mb-3">Asset Type</label>
                                    <select
                                        name="mediaType"
                                        value={formData.mediaType}
                                        onChange={(e) => {
                                            handleChange(e);
                                            setFormData(prev => ({ ...prev, mediaUrl: '' }));
                                        }}
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm rounded-none appearance-none"
                                    >
                                        <option value="image">IMAGE VECTOR</option>
                                        <option value="video">VIDEO STREAM</option>
                                        <option value="document">DOCUMENT BINARY</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-[10px] text-gray-500 uppercase font-mono tracking-widest">Source</label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { setUploadMode('url'); setFormData(prev => ({ ...prev, mediaUrl: '' })); }}
                                                className={`px-3 py-1 font-mono text-[10px] tracking-widest uppercase border transition-colors ${uploadMode === 'url' ? 'bg-[#26cece] text-[#070707] border-[#26cece] font-bold shadow-[2px_2px_0_0_#26cece] -translate-y-0.5' : 'border-gray-300 dark:border-[#333] text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-[#26cece]'}`}
                                            >
                                                URL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setUploadMode('file'); setFormData(prev => ({ ...prev, mediaUrl: '' })); }}
                                                className={`px-3 py-1 font-mono text-[10px] tracking-widest uppercase border transition-colors ${uploadMode === 'file' ? 'bg-[#26cece] text-[#070707] border-[#26cece] font-bold shadow-[2px_2px_0_0_#26cece] -translate-y-0.5' : 'border-gray-300 dark:border-[#333] text-gray-500 hover:text-gray-900 dark:hover:text-white hover:border-[#26cece]'}`}
                                            >
                                                DISK
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {uploadMode === 'url' ? (
                                        <input
                                            type="url"
                                            name="mediaUrl"
                                            value={formData.mediaUrl}
                                            onChange={handleChange}
                                            placeholder="> https://example.com/asset.jpg"
                                            className="w-full px-4 py-3 border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono text-sm rounded-none placeholder-gray-400 dark:placeholder-gray-600"
                                        />
                                    ) : (
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept={formData.mediaType === 'image' ? 'image/*' : formData.mediaType === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
                                            className="w-full px-4 py-3 border border-[#333] bg-[#070707] text-gray-400 focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors text-sm font-mono rounded-none file:mr-4 file:py-1 file:px-3 file:border file:border-[#26cece] file:text-[10px] file:uppercase file:tracking-widest file:bg-[#26cece]/10 file:font-bold file:text-[#26cece] hover:file:bg-[#26cece] hover:file:text-[#070707] file:transition-colors file:cursor-pointer"
                                        />
                                    )}
                                    {uploadMode === 'file' && formData.mediaUrl && (
                                        <p className="mt-2 text-[10px] font-mono font-bold tracking-widest text-[#26cece] uppercase">&gt; Asset mapped to buffer</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status */}
                {status.message && (
                    <div className={`p-4 border font-mono tracking-widest text-[10px] uppercase font-bold flex items-start gap-4 ${statusStyles[status.type]}`}>
                        <div className="mt-0.5">{statusIcons[status.type]}</div>
                        <span className="leading-relaxed">{status.message}</span>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-[#26cece] border border-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[#070707] hover:shadow-[4px_4px_0_0_#333] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none text-sm md:text-base"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            EXECUTING TRANSMISSION...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            {sendMode === 'template' ? 'EXECUTE BROADCAST' : 'DISPATCH MESSAGE'}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default BroadcastForm;
