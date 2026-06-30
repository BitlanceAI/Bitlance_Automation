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
    UserCircle,
    Upload,
    Globe
} from 'lucide-react';
import { ElegantShape } from '../../components/ui/shape-landing-hero';

// Input field component
const InputField = ({ icon: Icon, label, name, value, onChange, type = 'text', placeholder, required = true, colSpan = false }) => (
    <div className={colSpan ? 'md:col-span-2' : ''}>
        <label className="block text-sm font-medium text-white/90 mb-2">
            {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-white/40 group-focus-within:text-[#26cece] transition-colors" />
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-[#26cece]/20 focus:border-[#26cece] transition-all duration-300 outline-none hover:border-white/20 shadow-sm font-sans"
            />
        </div>
    </div>
);

// Select field component
const SelectField = ({ icon: Icon, label, name, value, onChange, options, colSpan = false }) => (
    <div className={colSpan ? 'md:col-span-2' : ''}>
        <label className="block text-sm font-medium text-white/90 mb-2">
            {label}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Icon className="h-5 w-5 text-white/40 group-focus-within:text-[#26cece] transition-colors" />
            </div>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white appearance-none focus:ring-2 focus:ring-[#26cece]/20 focus:border-[#26cece] transition-all duration-300 outline-none hover:border-white/20 shadow-sm font-sans"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-teal-900">{opt.label}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        language: 'english',
        num_variants: 1,
        theme_color: '',
        reference_image: '',
        logo_image: ''
    });

    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const handleImageUpload = async (e, isCustomPrompt = false) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `reference-${Math.random()}.${fileExt}`;
            const filePath = `references/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            // Always set in formData so the submit handler can pick it up
            setFormData(prev => ({ ...prev, reference_image: data.publicUrl }));
            
            if (isCustomPrompt) {
                // Optionally append a note to the prompt text box so the user sees it
                setPromptText(prev => prev + `\n\n[Visual Subject Reference Uploaded]`);
            }
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingLogo(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Math.random()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, logo_image: data.publicUrl }));
            toast.success('Logo uploaded successfully');
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error('Failed to upload logo. Please try again.');
        } finally {
            setIsUploadingLogo(false);
        }
    };

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

        if (credits < COST_PER_FLYER) {
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
                    language: formData.language,
                    num_variants: parseInt(formData.num_variants, 10),
                    theme_color: formData.theme_color,
                    reference_image: formData.reference_image || null,
                    logo_image: formData.logo_image || null,
                    amenities: formData.amenities
                        ? formData.amenities.split(',').map(a => a.trim()).filter(a => a)
                        : []
                };
                endpoint = '/api/design/generate-flyer';
            } else {
                submitData = {
                    prompt: promptText,
                    image_size: formData.image_size,
                    image_quality: formData.image_quality,
                    language: formData.language,
                    logo_image: formData.logo_image || null,
                    reference_image: formData.reference_image || null
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
                        language: 'english',
                        num_variants: 1,
                        theme_color: '',
                        reference_image: '',
                        logo_image: ''
                    });
                } else {
                    setPromptText('');
                    setFormData(prev => ({ ...prev, logo_image: '' }));
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
        <div className="relative min-h-screen w-full overflow-x-hidden bg-teal-900 text-white transition-colors duration-300 font-['Space_Grotesk']">
            {/* Global ambient glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[180px] animate-float"
                    style={{ background: 'rgba(38,206,206,0.15)' }} />
                <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px] animate-pulse-slow"
                    style={{ background: 'rgba(45,212,191,0.1)' }} />
                <div className="absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full blur-[140px] animate-float"
                    style={{ background: 'rgba(15,118,110,0.2)' }} />
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle, #26CECE 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <ElegantShape delay={0.3} width={600} height={140} rotate={12} gradient="from-teal-400/[0.15]" className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />
                <ElegantShape delay={0.5} width={500} height={120} rotate={-15} gradient="from-cyan-400/[0.1]" className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]" />
                <ElegantShape delay={0.4} width={300} height={80} rotate={-8} gradient="from-teal-300/[0.12]" className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]" />
                <ElegantShape delay={0.6} width={200} height={60} rotate={20} gradient="from-cyan-500/[0.15]" className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]" />
            </div>

            {/* Premium Header */}
            <header className="sticky top-0 z-50 bg-teal-900/80 backdrop-blur-md border-b border-teal-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => navigate('/agents')}
                                className="relative z-10 p-2.5 rounded-xl hover:bg-white/10 text-white/60 transition-colors border border-transparent hover:border-white/20"
                                title="Back to Agents"
                            >
                                <ArrowLeft size={22} />
                            </button>
                            <div className="flex items-center gap-3.5">
                                <div className="p-2.5 rounded-xl bg-[#26cece] shadow-lg shadow-[#26cece]/20">
                                    <Palette className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white uppercase tracking-tight">
                                        Graphic AI Studio
                                    </h1>
                                    <p className="text-[10px] text-teal-100/50 font-mono uppercase tracking-widest">
                                        Visual Generation
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Credits Display */}
                            <div className="hidden sm:flex relative z-10 items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                                <div className="p-1.5 rounded-xl bg-[#26cece]">
                                    <Zap className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold font-mono tracking-widest uppercase text-teal-100/50">Balance</p>
                                    <p className="text-base font-bold text-white leading-none mt-0.5">
                                        {credits.toLocaleString()} <span className="text-xs font-normal text-[#26cece]">CR</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 relative z-10">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-6 py-4 text-[12px] font-mono tracking-widest uppercase font-bold transition-all border-b-2 ${activeTab === 'create'
                                ? 'border-[#26cece] text-[#26cece]'
                                : 'border-transparent text-white/50 hover:text-white'
                                }`}
                        >
                            Create Design
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-4 text-[12px] font-mono tracking-widest uppercase font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'history'
                                ? 'border-[#26cece] text-[#26cece]'
                                : 'border-transparent text-white/50 hover:text-white'
                                }`}
                        >
                            Gallery History
                            <span className="bg-white/10 text-white/70 py-0.5 px-2 rounded-xl text-[10px]">
                                {jobs.length}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {activeTab === 'create' ? (
                    <div className="max-w-3xl mx-auto">
                        <div className="relative z-10 bg-teal-950/40 backdrop-blur-[16px] rounded-xl border border-white/10 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#26cece]">
                                        <Image className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Design Parameters</h2>
                                        <p className="text-xs text-teal-100/50 font-sans tracking-tight">Configure your AI generation</p>
                                    </div>
                                </div>
                                
                                {/* Creation Mode Toggle */}
                                <div className="flex bg-black/20 border border-white/10 p-1 rounded-xl shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setCreationMode('form')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase font-bold transition-all ${creationMode === 'form' ? 'bg-[#26cece] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
                                    >
                                        Details Form
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCreationMode('prompt')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase font-bold transition-all ${creationMode === 'prompt' ? 'bg-[#26cece] text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
                                    >
                                        Custom Prompt
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                {creationMode === 'form' ? (
                                    <>
                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold tracking-widest text-teal-100/50 uppercase font-mono">Core Details</h3>
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

                                        <div className="h-px bg-white/10" />

                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold tracking-widest text-teal-100/50 uppercase font-mono">Contact & Business Details</h3>
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

                                        <div className="h-px bg-white/10" />

                                        <div className="space-y-6">
                                            <h3 className="text-[10px] font-bold tracking-widest text-teal-100/50 uppercase font-mono">Style Preferences</h3>
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
                                            <div>
                                                <div className="flex justify-between items-end mb-2">
                                                    <label className="block text-sm font-medium text-white/90">
                                                        Reference Image URL or Context (Optional)
                                                    </label>
                                                    <label className="cursor-pointer text-xs font-medium text-[#26cece] hover:text-[#35dfdf] flex items-center gap-1">
                                                        {isUploadingImage ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Image className="h-3 w-3" />
                                                        )}
                                                        Upload from Computer
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*" 
                                                            onChange={(e) => handleImageUpload(e, false)} 
                                                            disabled={isUploadingImage}
                                                        />
                                                    </label>
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Image className="h-5 w-5 text-white/40 group-focus-within:text-[#26cece] transition-colors" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="reference_image"
                                                        value={formData.reference_image}
                                                        onChange={handleInputChange}
                                                        placeholder="https://example.com/image.jpg or 'A hospital lobby with green accents'"
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-[#26cece]/20 focus:border-[#26cece] transition-all duration-300 outline-none hover:border-white/20 shadow-sm font-sans"
                                                    />
                                                </div>
                                            </div>

                                            {/* Custom Upload Logo Field */}
                                            <div>
                                                <div className="flex justify-between items-end mb-2">
                                                    <label className="block text-sm font-medium text-white/90">
                                                        Brand Logo URL (Optional)
                                                    </label>
                                                    <label className="cursor-pointer text-xs font-medium text-[#26cece] hover:text-[#35dfdf] flex items-center gap-1">
                                                        {isUploadingLogo ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Upload className="h-3 w-3" />
                                                        )}
                                                        Upload Logo
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*" 
                                                            onChange={handleLogoUpload} 
                                                            disabled={isUploadingLogo}
                                                        />
                                                    </label>
                                                </div>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <Upload className="h-5 w-5 text-white/40 group-focus-within:text-[#26cece] transition-colors" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="logo_image"
                                                        value={formData.logo_image}
                                                        onChange={handleInputChange}
                                                        placeholder="https://example.com/logo.jpg or upload logo from computer"
                                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-[#26cece]/20 focus:border-[#26cece] transition-all duration-300 outline-none hover:border-white/20 shadow-sm font-sans"
                                                    />
                                                </div>
                                                {formData.logo_image && (
                                                    <div className="mt-2 flex items-center gap-3 bg-white/5 p-2 rounded border border-white/10">
                                                        <img src={formData.logo_image} alt="Logo preview" className="h-10 w-10 object-contain rounded bg-white border border-slate-200" />
                                                        <span className="text-xs text-white/70 truncate flex-1">{formData.logo_image}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setFormData(prev => ({ ...prev, logo_image: '' }))}
                                                            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold tracking-widest text-teal-100/50 uppercase font-mono">Custom Design Prompt</h3>
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <label className="block text-sm font-medium text-white/90">
                                                    Describe your concept <span className="text-rose-400">*</span>
                                                </label>
                                                <label className="cursor-pointer text-xs font-medium text-[#26cece] hover:text-[#35dfdf] flex items-center gap-1">
                                                    {isUploadingImage ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Image className="h-3 w-3" />
                                                    )}
                                                    Upload Reference Image
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*" 
                                                        onChange={(e) => handleImageUpload(e, true)} 
                                                        disabled={isUploadingImage}
                                                    />
                                                </label>
                                            </div>
                                            <textarea
                                                value={promptText}
                                                onChange={(e) => setPromptText(e.target.value)}
                                                placeholder="e.g. A hyper-realistic 8k render of a modern beachfront villa or a vibrant tech startup office with neon lighting..."
                                                required
                                                rows={8}
                                                className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-[#26cece]/20 focus:border-[#26cece] transition-all duration-300 outline-none hover:border-white/20 shadow-sm resize-none font-sans"
                                            />
                                        </div>

                                        {/* Custom Upload Logo Field for Prompt Mode */}
                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <label className="block text-sm font-medium text-white/90">
                                                    Brand Logo URL (Optional)
                                                </label>
                                                <label className="cursor-pointer text-xs font-medium text-[#26cece] hover:text-[#35dfdf] flex items-center gap-1">
                                                    {isUploadingLogo ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Upload className="h-3 w-3" />
                                                    )}
                                                    Upload Logo
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*" 
                                                        onChange={handleLogoUpload} 
                                                        disabled={isUploadingLogo}
                                                    />
                                                </label>
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Upload className="h-5 w-5 text-white/40 group-focus-within:text-[#26cece] transition-colors" />
                                                </div>
                                                <input
                                                    type="text"
                                                    name="logo_image"
                                                    value={formData.logo_image}
                                                    onChange={handleInputChange}
                                                    placeholder="https://example.com/logo.jpg or upload logo from computer"
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:ring-2 focus:ring-[#26cece]/20 focus:border-[#26cece] transition-all duration-300 outline-none hover:border-white/20 shadow-sm font-sans"
                                                />
                                            </div>
                                            {formData.logo_image && (
                                                <div className="mt-2 flex items-center gap-3 bg-white/5 p-2 rounded border border-white/10">
                                                    <img src={formData.logo_image} alt="Logo preview" className="h-10 w-10 object-contain rounded bg-white border border-slate-200" />
                                                    <span className="text-xs text-white/70 truncate flex-1">{formData.logo_image}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setFormData(prev => ({ ...prev, logo_image: '' }))}
                                                        className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="h-px bg-slate-200" />

                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">Output Settings</h3>
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
                                        <SelectField
                                            icon={Globe}
                                            label="Language"
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            options={[
                                                { value: 'english', label: 'English' },
                                                { value: 'hindi_marathi', label: 'Hindi + Marathi Approach' }
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading || (!isAdmin && credits < COST_PER_FLYER)}
                                        className="w-full relative group overflow-hidden rounded-xl bg-white/10 border border-white/20 text-white py-4 px-6 font-bold text-[14px] uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_20px_rgba(38,206,206,0.3)] hover:border-[#26cece] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:hover:border-white/20"
                                    >
                                        <div className="absolute inset-0 bg-[#26cece] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-black transition-colors">
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                {[
                                    { label: 'Generations', value: stats.total, color: 'text-[#26cece]' },
                                    { label: 'Completed', value: stats.completed, color: 'text-[#35dfdf]' },
                                    { label: 'In Progress', value: stats.pending, color: 'text-amber-400' },
                                    { label: 'Failed', value: stats.failed, color: 'text-rose-400' }
                                ].map((stat) => (
                                    <div key={stat.label} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
                                        <p className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</p>
                                        <p className="text-[10px] font-bold font-mono tracking-widest uppercase text-white/50">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Gallery Header */}
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Studio Gallery</h2>
                                    <p className="text-xs text-teal-100/50 font-sans tracking-tight">Review your recent AI generations</p>
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 text-white/60 transition-colors group"
                                    title="Refresh Gallery"
                                >
                                    <RefreshCw className={`h-5 w-5 group-hover:text-[#26cece] transition-colors ${refreshing ? 'animate-spin text-[#26cece]' : ''}`} />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 relative z-10">
                                {['all', 'completed', 'processing', 'pending', 'failed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-mono tracking-widest uppercase font-bold transition-all duration-300 ${filter === status
                                            ? 'bg-white/20 text-white shadow-md border-white/30 border'
                                            : 'bg-white/5 border border-white/10 text-white/50 hover:border-white/20 hover:text-white'
                                            }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>

                            {/* Gallery Grid */}
                            {filteredJobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-16 bg-white/5 rounded-xl border border-dashed border-white/20 relative z-10">
                                    <div className="w-24 h-24 mb-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <Image className="h-10 w-10 text-[#26cece]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">
                                        Your Gallery is Empty
                                    </h3>
                                    <p className="text-teal-100/70 text-center max-w-md font-sans tracking-tight">
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
                                                    className="group flex flex-col bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-sm hover:shadow-xl hover:border-[#26cece] hover:bg-white/10 transition-all duration-300 overflow-hidden relative z-10"
                                                >
                                                    <div className="relative aspect-[4/3] bg-black/20 overflow-hidden">
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                                            <StatusIcon className={`h-10 w-10 mb-4 ${statusConfig.color} ${statusConfig.animate ? 'animate-spin' : ''}`} />
                                                            <p className={`text-[10px] font-bold font-mono tracking-widest uppercase ${statusConfig.color}`}>{statusConfig.label}</p>
                                                        </div>
                                                        <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-bold uppercase tracking-widest bg-black/40 ${statusConfig.color} border border-white/10`}>
                                                            {statusConfig.label}
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 uppercase tracking-tight">
                                                            {job.property_type || 'Custom Design'}
                                                        </h3>
                                                        <p className="text-xs text-white/60 flex items-center gap-1.5 line-clamp-1 font-sans">
                                                            <MapPin className="h-4 w-4 shrink-0 text-[#26cece]" />
                                                            <span className="truncate">{job.location || 'Custom Prompt'}</span>
                                                        </p>
                                                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                                                            <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-xl text-[#26cece]">
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
                                                className="group flex flex-col bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-sm hover:shadow-xl hover:border-[#26cece] hover:bg-white/10 transition-all duration-300 overflow-hidden relative z-10"
                                            >
                                                <div className="relative aspect-[4/3] bg-black/20 overflow-hidden">
                                                    <img src={url} alt={job.property_type || 'Generated concept'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1e]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    
                                                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                        <button
                                                            onClick={() => setPreviewJob({ ...job, flyer_url: url, metadata: { flyer_urls: [url] } })}
                                                            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white py-2.5 rounded-xl text-[10px] tracking-widest font-bold uppercase transition-colors flex justify-center items-center gap-1.5"
                                                        >
                                                            <Eye className="w-4 h-4" /> View
                                                        </button>
                                                        <button
                                                            onClick={() => forceDownload(url, `concept_${job.property_type?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'design'}_var${index+1}.png`)}
                                                            className="flex-1 bg-[#26cece] hover:bg-[#35dfdf] text-[#0a1f1e] py-2.5 rounded-xl text-[10px] tracking-widest font-bold uppercase shadow-[0_0_15px_rgba(38,206,206,0.3)] transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Download className="w-4 h-4" /> Save
                                                        </button>
                                                    </div>
                                                    
                                                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-bold uppercase tracking-wider bg-black/40 ${statusConfig.color} border border-white/10 backdrop-blur-md`}>
                                                        {statusConfig.label}
                                                    </div>

                                                    {urls.length > 1 && (
                                                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-bold uppercase tracking-wider bg-black/40 text-white/90 backdrop-blur-md border border-white/10">
                                                            Variant {index + 1}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-5">
                                                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 uppercase tracking-tight">
                                                        {job.property_type || 'Custom Design'}
                                                    </h3>
                                                    <p className="text-xs text-white/60 flex items-center gap-1.5 line-clamp-1 font-sans">
                                                        <MapPin className="h-4 w-4 shrink-0 text-[#26cece]" />
                                                        <span className="truncate">{job.location || 'Custom Prompt'}</span>
                                                    </p>
                                                    
                                                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                                                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-xl text-[#26cece]">
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