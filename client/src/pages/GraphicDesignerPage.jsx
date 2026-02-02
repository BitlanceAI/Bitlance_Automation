import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import API_BASE_URL from '../config';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Palette,
    Sparkles,
    Building2,
    MapPin,
    IndianRupee,
    HardHat,
    Phone,
    Mail,
    MapPinned,
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
    ListChecks,
    Bed
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

// Input field component - defined outside to prevent re-creation on each render
const InputField = ({ icon: Icon, label, name, value, onChange, type = 'text', placeholder, required = true, colSpan = false }) => (
    <div className={colSpan ? 'md:col-span-2' : ''}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200 outline-none"
            />
        </div>
    </div>
);

const GraphicDesignerPage = () => {
    const navigate = useNavigate();
    const { user, credits, refreshCredits } = useAuth();
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [previewJob, setPreviewJob] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Available templates
    const TEMPLATES = [
        { id: 'classic', name: 'Classic Elegant', description: 'Timeless design with gradient overlay', color: 'from-rose-500 to-red-600', icon: '🏛️' },
        { id: 'modern', name: 'Modern Bold', description: 'Contemporary layout with bold typography', color: 'from-blue-500 to-indigo-600', icon: '🏢' },
        { id: 'minimal', name: 'Minimal Clean', description: 'Clean minimalist design', color: 'from-emerald-500 to-teal-600', icon: '✨' },
        { id: 'luxury', name: 'Premium Luxury', description: 'High-end luxury aesthetic', color: 'from-amber-500 to-orange-600', icon: '👑' },
        { id: 'random', name: 'Surprise Me!', description: 'Random template selection', color: 'from-violet-500 to-purple-600', icon: '🎲' }
    ];

    const [formData, setFormData] = useState({
        property_type: '',
        bhk: '',
        location: '',
        price: '',
        builder: '',
        phone: '',
        email: '',
        address: '',
        amenities: '',
        template_id: 'random'
    });

    const COST_PER_FLYER = 5;

    // Fetch jobs on mount
    useEffect(() => {
        fetchJobs();

        // Auto-refresh jobs every 30 seconds
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

            // Convert amenities string to array
            const submitData = {
                ...formData,
                amenities: formData.amenities
                    ? formData.amenities.split(',').map(a => a.trim()).filter(a => a)
                    : []
            };

            const response = await fetch(`${API_BASE_URL}/api/design/generate-flyer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Flyer generation started! Check the jobs below.');
                setFormData({
                    property_type: '',
                    bhk: '',
                    location: '',
                    price: '',
                    builder: '',
                    phone: '',
                    email: '',
                    address: '',
                    amenities: '',
                    template_id: 'random'
                });
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
                color: 'text-red-500',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                label: 'Failed'
            }
        };
        return configs[status] || configs.pending;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/agents')}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 transition-colors"
                                title="Back to Agents"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25">
                                    <Palette className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Graphic Designer AI
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        AI-powered flyer generation
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Credits Display */}
                            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                                    <Zap className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>
                                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 leading-none">
                                        {credits.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 mb-8">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi0yLTQgMi00IDItNGMwLTItMi00LTItNHMyLTIgMi00LTItNC0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTQgMi00IDItNGMwLTIgNCAyIDQgMnM0IDAgNC0yIDQgMiA0IDItMiA0LTIgNCAyIDQgMiA0cy0yIDItMiA0IDIgNCAyIDRjMCAyLTIgNC0yIDRzMiAyIDIgNC0yIDQtMiA0YzAgMi0yIDQtMiA0czIgMiAyIDQtMiA0LTIgNGMwIDItNCAyLTQgMnMtNCAwLTQgMi00LTItNC0yIDItNC0yLTQtMi00LTItNGMwLTIgMi00IDItNHMtMi0yLTItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                                    <Sparkles className="inline h-3 w-3 mr-1" />
                                    AI Powered
                                </span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                Create Stunning Real Estate Flyers
                            </h2>
                            <p className="text-purple-100 text-lg max-w-xl">
                                Generate professional marketing materials in seconds with our AI-powered design engine.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                                <p className="text-purple-200 text-sm">Cost per flyer</p>
                                <p className="text-3xl font-bold text-white">{COST_PER_FLYER}</p>
                                <p className="text-purple-200 text-xs">credits</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Designs', value: stats.total, icon: Image, color: 'from-blue-500 to-cyan-500' },
                        { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
                        { label: 'In Progress', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-500' },
                        { label: 'Success Rate', value: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) + '%' : '-', icon: TrendingUp, color: 'from-violet-500 to-purple-500' }
                    ].map((stat) => (
                        <div key={stat.label} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5">
                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
                            <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
                                <stat.icon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl shadow-gray-200/20 dark:shadow-slate-900/30 overflow-hidden">
                                <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                                            <Sparkles className="h-5 w-5 text-white" />
                                        </div>
                                        Create New Flyer
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the property details below</p>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <InputField
                                        icon={Building2}
                                        label="Property Type"
                                        name="property_type"
                                        value={formData.property_type}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Luxury Apartment"
                                    />

                                    <InputField
                                        icon={Bed}
                                        label="BHK Configuration"
                                        name="bhk"
                                        value={formData.bhk}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 2 & 3 BHK"
                                    />

                                    <InputField
                                        icon={MapPin}
                                        label="Location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Hinjewadi, Pune"
                                    />

                                    <InputField
                                        icon={IndianRupee}
                                        label="Price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="e.g., ₹1.35 Cr onwards"
                                    />

                                    <InputField
                                        icon={HardHat}
                                        label="Builder"
                                        name="builder"
                                        value={formData.builder}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Skyline Developers"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField
                                            icon={Phone}
                                            label="Phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                        />
                                        <InputField
                                            icon={Mail}
                                            label="Email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email"
                                            placeholder="sales@example.com"
                                        />
                                    </div>

                                    <InputField
                                        icon={MapPinned}
                                        label="Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Phase 2, Hinjewadi, Pune"
                                        colSpan
                                    />

                                    <InputField
                                        icon={ListChecks}
                                        label="Amenities"
                                        name="amenities"
                                        value={formData.amenities}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Swimming Pool, Gym, Clubhouse, Parking"
                                        required={false}
                                        colSpan
                                    />

                                    {/* Template Selector */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Choose Template Style
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {TEMPLATES.map((template) => (
                                                <button
                                                    key={template.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, template_id: template.id }))}
                                                    className={`group relative overflow-hidden rounded-xl p-3 text-left transition-all duration-200 border-2 ${formData.template_id === template.id
                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/20'
                                                        : 'border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-slate-800/50'
                                                        }`}
                                                >
                                                    <div className={`absolute top-0 right-0 w-12 h-12 bg-gradient-to-br ${template.color} opacity-20 rounded-full -translate-y-1/2 translate-x-1/2`} />
                                                    <div className="text-xl mb-1">{template.icon}</div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                        {template.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                        {template.description}
                                                    </p>
                                                    {formData.template_id === template.id && (
                                                        <div className="absolute top-2 right-2">
                                                            <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Credits Warning */}
                                    {credits < COST_PER_FLYER && (
                                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                                <XCircle className="h-4 w-4" />
                                                Insufficient credits. You need {COST_PER_FLYER} credits.
                                            </p>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || credits < COST_PER_FLYER}
                                        className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white py-4 px-6 font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span className="relative flex items-center justify-center gap-2">
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-5 w-5" />
                                                    Generate Flyer ({COST_PER_FLYER} Credits)
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Jobs History Section */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl shadow-gray-200/20 dark:shadow-slate-900/30 overflow-hidden">

                            {/* Header */}
                            <div className="p-6 border-b border-gray-200/50 dark:border-slate-700/50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Design History</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Your generated flyers</p>
                                    </div>

                                    <button
                                        onClick={handleRefresh}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                </div>

                                {/* Filter Pills */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {['all', 'completed', 'processing', 'pending', 'failed'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilter(status)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filter === status
                                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                                                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                                }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                            {status !== 'all' && (
                                                <span className="ml-2 text-xs opacity-75">
                                                    ({status === 'processing' || status === 'pending'
                                                        ? stats.pending
                                                        : status === 'completed'
                                                            ? stats.completed
                                                            : stats.failed})
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Jobs Grid */}
                            <div className="p-6">
                                {filteredJobs.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                                            <Image className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            No designs yet
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                            Create your first stunning real estate flyer using the form on the left.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {filteredJobs.map(job => {
                                            const statusConfig = getStatusConfig(job.status);
                                            const StatusIcon = statusConfig.icon;

                                            return (
                                                <div
                                                    key={job.id}
                                                    className="group relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-900/30 p-5 transition-all duration-300 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800/50"
                                                >
                                                    {/* Status Badge */}
                                                    <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                                                        <StatusIcon className={`h-3.5 w-3.5 ${statusConfig.animate ? 'animate-spin' : ''}`} />
                                                        {statusConfig.label}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="pr-28">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                                            {job.property_type || 'Property'}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {job.location || 'Location not specified'}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
                                                        <div>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500">Price</p>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {job.price || '-'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-400 dark:text-gray-500">Builder</p>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                                                                {job.builder || '-'}
                                                            </p>
                                                        </div>
                                                        <div className="ml-auto">
                                                            <p className="text-xs text-gray-400 dark:text-gray-500">Created</p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                {new Date(job.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    {job.status === 'completed' && job.flyer_url && (
                                                        <div className="flex items-center gap-2 mt-4">
                                                            <button
                                                                onClick={() => setPreviewJob(job)}
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                Preview
                                                            </button>
                                                            <a
                                                                href={job.flyer_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-colors text-sm font-medium shadow-lg shadow-purple-500/20"
                                                            >
                                                                <Download className="h-4 w-4" />
                                                                Download
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Preview Modal */}
            {previewJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Flyer Preview</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{previewJob.property_type}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewJob.flyer_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium hover:from-violet-500 hover:to-purple-500 transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </a>
                                <button
                                    onClick={() => setPreviewJob(null)}
                                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)] flex items-center justify-center bg-gray-100 dark:bg-slate-800/50">
                            <img
                                src={previewJob.flyer_url}
                                alt={`Flyer for ${previewJob.property_type}`}
                                className="max-w-full max-h-[calc(90vh-180px)] object-contain rounded-2xl shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GraphicDesignerPage;
