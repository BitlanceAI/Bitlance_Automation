import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import API_BASE_URL from '../../config';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Palette,
    Sparkles,
    Building2,
    MapPin,
    IndianRupee,
    Bed,
    ListChecks,
    Tag,
    FileText,
    Maximize,
    Settings2,
    Download,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Eye,
    X,
    RefreshCw,
    Image,
    Zap,
    TrendingUp,
    Info,
    Phone,
    Mail,
    Navigation,
    UserCircle
} from 'lucide-react';


// Input field component
const InputField = ({ icon: Icon, label, name, value, onChange, type = 'text', placeholder, required = true, colSpan = false }) => (
    <div className={colSpan ? 'md:col-span-2' : ''}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-300 outline-none hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
            />
        </div>
    </div>
);

// Select field component
const SelectField = ({ icon: Icon, label, name, value, onChange, options, colSpan = false }) => (
    <div className={colSpan ? 'md:col-span-2' : ''}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
            </div>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-300 outline-none appearance-none shadow-sm cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    </div>
);

const GraphicDesignerPage = () => {
    const navigate = useNavigate();
    const { user, credits, isAdmin, refreshCredits } = useAuth();
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [previewJob, setPreviewJob] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('create');
    const [creationMode, setCreationMode] = useState('form');
    const [promptText, setPromptText] = useState('');

    // Helper to force download instead of opening in new tab
    const forceDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'design.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(url, '_blank');
        }
    };

    const [formData, setFormData] = useState({
        property_type: '',
        location: '',
        bhk: '',
        price: '',
        builder: '',
        phone: '',
        email: '',
        address: '',
        amenities: '',
        extra_details: '',
        niche: '',
        image_size: '1024x1024',
        image_quality: 'low',
        num_variants: 1,
        theme_color: ''
    });

    const COST_PER_FLYER = 5;

    // Fetch jobs on mount
    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchJobs = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/design/jobs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setJobs(data.jobs || []);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchJobs();
        await refreshCredits();
        setTimeout(() => setRefreshing(false), 500);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAdmin && credits < COST_PER_FLYER) {
            toast.error(`Insufficient credits. You need ${COST_PER_FLYER} credits to generate a flyer.`);
            return;
        }

        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                toast.error('Please login to generate flyers');
                return;
            }

            // Clean up payload
            let submitData;
            let endpoint;
            
            if (creationMode === 'form') {
                submitData = {
                    property_type: formData.property_type,
                    location: formData.location,
                    price: formData.price || null,
                    bhk: formData.bhk || null,
                    builder: formData.builder || null,
                    phone: formData.phone || null,
                    email: formData.email || null,
                    address: formData.address || null,
                    extra_details: formData.extra_details || null,
                    niche: formData.niche || null,
                    image_size: formData.image_size,
                    image_quality: formData.image_quality,
                    num_variants: parseInt(formData.num_variants, 10),
                    theme_color: formData.theme_color,
                    amenities: formData.amenities
                        ? formData.amenities.split(',').map(a => a.trim()).filter(a => a)
                        : []
                };
                endpoint = '/api/design/generate-flyer';
            } else {
                submitData = {
                    prompt: promptText,
                    image_size: formData.image_size,
                    image_quality: formData.image_quality
                };
                endpoint = '/api/design/generate-from-prompt';
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Flyer generation started! Check the history tab.');
                if (creationMode === 'form') {
                    setFormData({
                        property_type: '',
                        location: '',
                        bhk: '',
                        price: '',
                        builder: '',
                        phone: '',
                        email: '',
                        address: '',
                        amenities: '',
                        extra_details: '',
                        niche: '',
                        image_size: '1024x1024',
                        image_quality: 'low',
                        num_variants: 1,
                        theme_color: ''
                    });
                } else {
                    setPromptText('');
                }
                setActiveTab('history');
                refreshCredits();
                fetchJobs();
            } else {
                toast.error(data.error || 'Failed to generate flyer');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to generate flyer');
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.status === filter;
    });

    const stats = {
        total: jobs.length,
        completed: jobs.filter(j => j.status === 'completed').length,
        pending: jobs.filter(j => j.status === 'pending' || j.status === 'processing').length,
        failed: jobs.filter(j => j.status === 'failed').length
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                icon: Clock,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                label: 'Pending'
            },
            processing: {
                icon: Loader2,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                label: 'Processing',
                animate: true
            },
            completed: {
                icon: CheckCircle2,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                label: 'Completed'
            },
            failed: {
                icon: XCircle,
                color: 'text-rose-500',
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/20',
                label: 'Failed'
            }
        };
        return configs[status] || configs.pending;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F19]">

            {/* Premium Header */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-[#0B0F19]/70 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => navigate('/agents')}
                                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                                title="Back to Agents"
                            >
                                <ArrowLeft size={22} />
                            </button>
                            <div className="flex items-center gap-3.5">
                                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
                                    <Palette className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                                        Graphic AI Studio
                                    </h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        Hyper-realistic visual generation
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Credits Display */}
                            <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                                <div className="p-1.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                                    <Zap className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">Balance</p>
                                    <p className="text-base font-bold text-gray-900 dark:text-white leading-none mt-0.5">
                                        {credits.toLocaleString()} <span className="text-sm font-normal text-gray-500">cr</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-6 py-4 font-semibold text-sm tracking-wide transition-all border-b-2 ${activeTab === 'create'
                            ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                            }`}
                    >
                        Create Design
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-4 font-semibold text-sm tracking-wide transition-all border-b-2 flex items-center gap-2 ${activeTab === 'history'
                            ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                            }`}
                    >
                        Gallery History
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                            {jobs.length}
                        </span>
                    </button>
                </div>

                {activeTab === 'create' ? (
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-200/60 dark:border-gray-800 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                                        <Image className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Design Parameters</h2>
                                        <p className="text-sm text-gray-500 mt-1">Configure your AI generation</p>
                                    </div>
                                </div>
                                
                                {/* Creation Mode Toggle */}
                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setCreationMode('form')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${creationMode === 'form' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        Details Form
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCreationMode('prompt')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${creationMode === 'prompt' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        Custom Prompt
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {creationMode === 'form' ? (
                                    <>
                                        <div className="space-y-6">
                                            <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Core Details</h3>
                                            <InputField
                                                icon={Building2}
                                                label="Business / Property Type"
                                                name="property_type"
                                                value={formData.property_type}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Luxury Villa, Tech Startup, Cafe"
                                            />
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    icon={MapPin}
                                                    label="Location"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Dubai"
                                                />
                                                <InputField
                                                    icon={Bed}
                                                    label="Specifics (BHK, Size, etc.)"
                                                    name="bhk"
                                                    value={formData.bhk}
                                                    onChange={handleInputChange}
                                                    placeholder="3 BHK, 50 Seats, etc."
                                                    required={false}
                                                />
                                            </div>

                                            <InputField
                                                icon={IndianRupee}
                                                label="Price / Starting Cost"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="e.g., ₹2.5 Cr Onwards, ₹500/meal"
                                                required={false}
                                            />
                                        </div>

                                        <div className="h-px bg-gray-100 dark:bg-gray-800" />

                                        <div className="space-y-6">
                                            <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Contact & Business Details</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    icon={UserCircle}
                                                    label="Business / Builder Name"
                                                    name="builder"
                                                    value={formData.builder}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Emaar Properties"
                                                    required={false}
                                                />
                                                <InputField
                                                    icon={Phone}
                                                    label="Phone Number"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+971 50..."
                                                    required={false}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    icon={Mail}
                                                    label="Email Address"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="contact@business.com"
                                                    required={false}
                                                />
                                                <InputField
                                                    icon={Navigation}
                                                    label="Full Address / Website"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    placeholder="Downtown Dubai / www.business.com"
                                                    required={false}
                                                />
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-100 dark:bg-gray-800" />

                                        <div className="space-y-6">
                                            <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Context & Details</h3>
                                            <InputField
                                                icon={ListChecks}
                                                label="Features / Amenities"
                                                name="amenities"
                                                value={formData.amenities}
                                                onChange={handleInputChange}
                                                placeholder="Pool, WiFi, 24/7 Support..."
                                                required={false}
                                            />

                                            <InputField
                                                icon={FileText}
                                                label="Extra Details"
                                                name="extra_details"
                                                value={formData.extra_details}
                                                onChange={handleInputChange}
                                                placeholder="Sea facing, modern architecture"
                                                required={false}
                                            />
                                            
                                            <InputField
                                                icon={Tag}
                                                label="Design Niche (For Trend AI)"
                                                name="niche"
                                                value={formData.niche}
                                                onChange={handleInputChange}
                                                placeholder="luxury real estate, cyber cafe"
                                                required={false}
                                            />
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <SelectField
                                                    icon={Image}
                                                    label="Number of Variants (Optional)"
                                                    name="num_variants"
                                                    value={formData.num_variants}
                                                    onChange={handleInputChange}
                                                    options={[
                                                        { value: 1, label: '1 Variant' },
                                                        { value: 2, label: '2 Variants' },
                                                        { value: 3, label: '3 Variants' },
                                                        { value: 4, label: '4 Variants' }
                                                    ]}
                                                />
                                                <InputField
                                                    icon={Palette}
                                                    label="Theme Color (Optional)"
                                                    name="theme_color"
                                                    value={formData.theme_color}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Midnight Blue, Gold"
                                                    required={false}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Custom Design Prompt</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Describe your concept <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                value={promptText}
                                                onChange={(e) => setPromptText(e.target.value)}
                                                placeholder="e.g. A hyper-realistic 8k render of a modern beachfront villa or a vibrant tech startup office with neon lighting..."
                                                required
                                                rows={8}
                                                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-300 outline-none hover:border-gray-300 dark:hover:border-gray-600 shadow-sm resize-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Output Settings</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField
                                            icon={Maximize}
                                            label="Dimensions"
                                            name="image_size"
                                            value={formData.image_size}
                                            onChange={handleInputChange}
                                            options={[
                                                { value: '512x512', label: '512 x 512' },
                                                { value: '1024x1024', label: '1024 x 1024' },
                                                { value: '1536x1024', label: '1536 x 1024' },
                                                { value: '1024x1536', label: '1024 x 1536' }
                                            ]}
                                        />
                                        <SelectField
                                            icon={Settings2}
                                            label="Quality"
                                            name="image_quality"
                                            value={formData.image_quality}
                                            onChange={handleInputChange}
                                            options={[
                                                { value: 'low', label: 'Low (Fast)' },
                                                { value: 'medium', label: 'Medium' },
                                                { value: 'high', label: 'High (Detailed)' },
                                                { value: 'auto', label: 'Auto' }
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading || (!isAdmin && credits < COST_PER_FLYER)}
                                        className="w-full relative group overflow-hidden rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 px-6 font-bold text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Processing via AI...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-5 w-5" />
                                                    Generate Concept
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto">
                        {/* Gallery Section */}
                        <div className="flex flex-col gap-8">
                            
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Generations', value: stats.total, color: 'text-violet-600 dark:text-violet-400' },
                                    { label: 'Completed', value: stats.completed, color: 'text-emerald-600 dark:text-emerald-400' },
                                    { label: 'In Progress', value: stats.pending, color: 'text-amber-600 dark:text-amber-400' },
                                    { label: 'Failed', value: stats.failed, color: 'text-rose-600 dark:text-rose-400' }
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-gray-200/60 dark:border-gray-800 shadow-sm">
                                        <p className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</p>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Gallery Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Studio Gallery</h2>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">Review your recent AI generations</p>
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    className="p-3 rounded-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors group"
                                    title="Refresh Gallery"
                                >
                                    <RefreshCw className={`h-5 w-5 group-hover:text-violet-500 transition-colors ${refreshing ? 'animate-spin text-violet-500' : ''}`} />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2">
                                {['all', 'completed', 'processing', 'pending', 'failed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${filter === status
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                                            : 'bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Gallery Grid */}
                            {filteredJobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-16 bg-white/50 dark:bg-[#111827]/50 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-800">
                                    <div className="w-24 h-24 mb-6 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                                        <Image className="h-10 w-10 text-violet-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Your Gallery is Empty
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                                        Configure parameters on the left and hit "Generate Concept" to start creating stunning architectural visuals.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredJobs.flatMap(job => {
                                        const statusConfig = getStatusConfig(job.status);
                                        const StatusIcon = statusConfig.icon;

                                        // If job is not completed or has no images, just render the status card
                                        if (job.status !== 'completed' || (!job.flyer_url && !job.metadata?.flyer_urls)) {
                                            return [(
                                                <div
                                                    key={job.id}
                                                    className="group flex flex-col bg-white dark:bg-[#111827] rounded-[1.5rem] border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-800/50 transition-all duration-300 overflow-hidden"
                                                >
                                                    <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                                            <StatusIcon className={`h-10 w-10 mb-4 ${statusConfig.color} ${statusConfig.animate ? 'animate-spin' : ''}`} />
                                                            <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                                                        </div>
                                                        <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} backdrop-blur-md`}>
                                                            {statusConfig.label}
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                                                            {job.property_type || 'Custom Design'}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 line-clamp-1">
                                                            <MapPin className="h-4 w-4 shrink-0" />
                                                            <span className="truncate">{job.location || 'Custom Prompt'}</span>
                                                        </p>
                                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                            <span>{new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md font-medium">
                                                                {job.price || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )];
                                        }

                                        // Render a card for EACH variant
                                        const urls = job.metadata?.flyer_urls || [job.flyer_url];
                                        return urls.map((url, index) => (
                                            <div
                                                key={`${job.id}-${index}`}
                                                className="group flex flex-col bg-white dark:bg-[#111827] rounded-[1.5rem] border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-800/50 transition-all duration-300 overflow-hidden"
                                            >
                                                <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                                    <img src={url} alt={job.property_type || 'Generated concept'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    
                                                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                        <button
                                                            onClick={() => setPreviewJob({ ...job, flyer_url: url, metadata: { flyer_urls: [url] } })}
                                                            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex justify-center items-center gap-1.5"
                                                        >
                                                            <Eye className="w-4 h-4" /> View
                                                        </button>
                                                        <button
                                                            onClick={() => forceDownload(url, `concept_${job.property_type?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'design'}_var${index+1}.png`)}
                                                            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Download className="w-4 h-4" /> Save
                                                        </button>
                                                    </div>
                                                    
                                                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} backdrop-blur-md`}>
                                                        {statusConfig.label}
                                                    </div>

                                                    {urls.length > 1 && (
                                                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider bg-black/50 text-white backdrop-blur-md border border-white/10">
                                                            Variant {index + 1}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-5">
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                                                        {job.property_type || 'Custom Design'}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 line-clamp-1">
                                                        <MapPin className="h-4 w-4 shrink-0" />
                                                        <span className="truncate">{job.location || 'Custom Prompt'}</span>
                                                    </p>
                                                    
                                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md font-medium">
                                                            {job.price || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ));
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Preview Modal */}
            {previewJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative max-w-5xl w-full bg-[#111827] rounded-[2rem] shadow-2xl overflow-hidden border border-gray-800">

                        <div className="flex items-center justify-between p-6 border-b border-gray-800">
                            <div>
                                <h3 className="text-xl font-bold text-white">High-Res Concept</h3>
                                <p className="text-sm text-gray-400">{previewJob.property_type}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setPreviewJob(null)}
                                    className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className={`p-8 overflow-auto max-h-[85vh] ${(previewJob.metadata?.flyer_urls || []).length > 1 ? 'grid grid-cols-1 md:grid-cols-2' : 'flex flex-col items-center justify-center'} gap-8 bg-black/50`}>
                            {(previewJob.metadata?.flyer_urls || [previewJob.flyer_url]).map((url, index, arr) => (
                                <div key={index} className={`flex flex-col items-center gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800 ${arr.length === 1 ? 'w-full max-w-3xl' : 'w-full'}`}>
                                    <img
                                        src={url}
                                        alt={`Concept ${index + 1} for ${previewJob.property_type}`}
                                        className="w-full aspect-auto max-h-[60vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
                                    />
                                    <button
                                        onClick={() => forceDownload(url, `concept_${previewJob.property_type.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_var${index+1}.png`)}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 transition-colors shadow-lg"
                                    >
                                        <Download className="h-5 w-5" /> Download {arr.length === 1 ? 'Design' : `Variant ${index + 1}`}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GraphicDesignerPage;
