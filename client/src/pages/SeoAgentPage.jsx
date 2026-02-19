import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import {
    LayoutDashboard,
    History,
    Settings,
    User,
    ArrowLeft,
    Edit3,
    Zap,
    Bot,
    ChevronRight,
    Globe,
    PenTool,
    FileText,
    Users,
    Layers,
    LogOut,
    Bell,
    Smartphone,
    Code
} from 'lucide-react';

import blogService from '../services/blogService';
import API_BASE_URL from '../config.js';
import ProfileSelection from '../components/ProfileSelection';

// Panel components for tabs
import PushNotificationPanel from '../components/seo/PushNotificationPanel';
import DeviceTokensPanel from '../components/seo/DeviceTokensPanel';
import BlogManagerPanel from '../components/seo/BlogManagerPanel';


const SeoAgentPage = () => {
    const navigate = useNavigate();
    const { user, credits, refreshCredits } = useAuth();

    // Tab State
    const [activeTab, setActiveTab] = useState('generate');

    const tabs = [
        { id: 'generate', label: 'Generate', icon: Zap },
        { id: 'blogs', label: 'Blog Manager', icon: FileText },
        { id: 'push', label: 'Send Push', icon: Bell },
        { id: 'tokens', label: 'Devices', icon: Smartphone },

    ];

    // Mode State
    const [generationMode, setGenerationMode] = useState('topic'); // 'topic' or 'industry'
    const [industry, setIndustry] = useState('');

    // Form State
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [language, setLanguage] = useState('English');
    const [writingStyle, setWritingStyle] = useState('Professional');
    const [articleLength, setArticleLength] = useState('Medium (500-1000 words)');
    const [targetAudience, setTargetAudience] = useState('General Public');
    const [variants, setVariants] = useState('Max 3 for demo');

    // New Fields State
    const [authorName, setAuthorName] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');

    // Profile State
    const [selectedProfile, setSelectedProfile] = useState(null);

    const handleProfileSelect = (selection) => {
        setSelectedProfile(selection);
        // Optional: Sync simple name field if needed for UI feedback elsewhere
        if (selection.profileData?.name) {
            setAuthorName(selection.profileData.name);
        }
    };

    // Image Options State
    const [imageOption, setImageOption] = useState('auto'); // 'auto', 'custom', 'none'
    const [customImageUrl, setCustomImageUrl] = useState('');

    // Source Type State
    const [sourceType, setSourceType] = useState('manual'); // 'manual' or 'wordpress'

    // WordPress Integration State
    const [wpUrl, setWpUrl] = useState('');
    const [wpUsername, setWpUsername] = useState('');
    const [wpPassword, setWpPassword] = useState('');

    // Firebase Article State
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [currentSeoTitle, setCurrentSeoTitle] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    // State for generation status
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Agent-specific stats
    const [agentStats, setAgentStats] = useState(null);
    const [showLowCreditAlert, setShowLowCreditAlert] = useState(false);

    // Load articles and agent stats on mount
    useEffect(() => {
        if (user) {
            loadArticles();
            loadAgentStats();
        }
    }, [user]);

    const loadArticles = async () => {
        if (!user) return;
        try {
            setLoadingArticles(true);
            const fetchedArticles = await blogService.getArticles(user.id);
            setArticles(fetchedArticles);
        } catch (error) {
            console.error('Error loading articles:', error);
            // alert('Failed to load articles from Firebase');
        } finally {
            setLoadingArticles(false);
        }
    };

    const loadAgentStats = async () => {
        if (!user) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${API_BASE_URL}/api/credits/stats/blog`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setAgentStats(data.stats);

                // Show low credit alert if balance is less than 50 credits
                if (data.stats.currentBalance < 50) {
                    setShowLowCreditAlert(true);
                }
            }
        } catch (error) {
            console.error('Error loading agent stats:', error);
        }
    };



    const handleGenerate = async () => {
        if (generationMode === 'topic' && !topic.trim()) {
            alert('Please enter a topic');
            return;
        }
        if (generationMode === 'industry' && !industry.trim()) {
            alert('Please enter an industry');
            return;
        }

        // Check credits
        const CREDIT_COST = 5;
        if (credits < CREDIT_COST) {
            alert(`⚠️ Insufficient credits! You need ${CREDIT_COST} credits to generate an article. Current balance: ${credits}`);
            return;
        }

        // Validate WordPress credentials if WordPress source is selected
        if (sourceType === 'wordpress' && !wpUrl.trim()) {
            alert('Please enter WordPress website URL');
            return;
        }

        if (sourceType === 'wordpress' && (!wpUsername.trim() || !wpPassword.trim())) {
            alert('Please enter WordPress username and password');
            return;
        }

        setIsGenerating(true);
        try {
            const payload = {
                topic: generationMode === 'topic' ? topic : null,
                industry: generationMode === 'industry' ? industry : null,
                keywords: generationMode === 'topic' ? keywords : null, // Keywords auto-generated in industry mode
                language,
                style: writingStyle,
                length: articleLength,
                audience: targetAudience,
                variants: variants === 'Max 3 for demo' ? 3 : 1,
                // New fields
                author_name: authorName,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                source_type: sourceType,
                // WordPress
                wp_url: wpUrl,
                wp_username: wpUsername,
                wp_password: wpPassword,
                // Image
                image_option: imageOption,
                custom_image_url: customImageUrl
            };

            // Handle Profile Logic (Insert into payload)
            let authorProfileId = null;
            let authorDetails = null;

            if (selectedProfile) {
                if (selectedProfile.type === 'existing') {
                    authorProfileId = selectedProfile.profileId;
                    // Override author_name with the profile's name to ensure consistency
                    payload.author_name = selectedProfile.profileData?.name;
                    payload.author_bio = selectedProfile.profileData?.bio; // Add bio if supported by API
                } else if (selectedProfile.type === 'manual') {
                    authorDetails = selectedProfile.profileData;
                    payload.author_name = authorDetails.name;
                    payload.author_bio = authorDetails.bio;

                    if (selectedProfile.saveAsNew) {
                        const { data: { session } } = await supabase.auth.getSession();
                        const token = session?.access_token;
                        try {
                            const profileRes = await fetch(`${API_BASE_URL}/api/profiles`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(authorDetails)
                            });
                            const profileData = await profileRes.json();
                            if (profileData.success) {
                                authorProfileId = profileData.profile.id;
                            }
                        } catch (err) {
                            console.error('Failed to create profile:', err);
                        }
                    }
                }
            }

            payload.author_profile_id = authorProfileId;
            payload.author_details = authorDetails;

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${API_BASE_URL}/api/articles/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                // Deduct credits - handled by backend now
                refreshCredits(); // Update local credit state via context

                // If WordPress source, upload to WordPress and send to Google Sheets
                if (sourceType === 'wordpress') {
                    try {
                        // Upload to WordPress
                        console.log('Uploading to WordPress...');
                        const wpResponse = await fetch(`${API_BASE_URL}/api/upload-to-wordpress`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                wpUrl: wpUrl,
                                wpUser: wpUsername,
                                wpPassword: wpPassword,
                                title: data.seoTitle || topic,
                                content: data.article,
                                imageUrl: data.imageUrl
                            })
                        });

                        const wpData = await wpResponse.json();

                        if (wpData.success) {
                            console.log('✅ Article uploaded to WordPress:', wpData.link);
                        } else {
                            console.error('❌ WordPress upload failed:', wpData.error);
                            alert('⚠️ Article generated but WordPress upload failed: ' + wpData.error);
                        }

                        // Send to Google Sheets for tracking
                        await fetch(`${API_BASE_URL}/api/add-to-google-sheet`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                niche: topic,
                                keywords: keywords,
                                title: data.seoTitle || topic,
                                wordpressUrl: wpUrl,
                                userId: user.id // Use real authenticated user ID
                            })
                        });
                        console.log('✅ Data sent to Google Sheets');
                    } catch (wpError) {
                        console.error('Error with WordPress/Sheets:', wpError);
                        alert('⚠️ Article generated but WordPress upload or Sheets tracking failed: ' + wpError.message);
                    }
                }

                // 2. Save to Firebase (SKIPPED - Backend already saves to Supabase)
                // Construct article object for local state update
                const newArticle = {
                    id: data.id,
                    topic: topic,
                    seoTitle: data.seoTitle || topic,
                    content: data.article,
                    imageUrl: data.imageUrl || null,
                    keywords: keywords,
                    language: language,
                    style: writingStyle,
                    length: articleLength,
                    audience: targetAudience,
                    userId: user.id,
                    slug: data.slug,
                    createdAt: new Date().toISOString(),
                    // New fields
                    authorName: authorName,
                    category: category,
                    tags: tags ? tags.split(',').map(t => t.trim()) : []
                };

                // 3. Update UI
                setCurrentArticle(newArticle.content);
                setCurrentSeoTitle(newArticle.seoTitle);
                setCurrentImageUrl(newArticle.imageUrl);
                setArticles([newArticle, ...articles]);

                // Reset WordPress fields
                setWpUrl('');
                setWpUsername('');
                setWpPassword('');

                const message = sourceType === 'wordpress'
                    ? '✅ Article Generated, Uploaded to WordPress & Tracked in Google Sheets!'
                    : '✅ Article Generated & Saved!';
                alert(message);
            } else {
                alert("Error: " + data.error);
            }

        } catch (error) {
            console.error("Generation Error:", error);
            alert("Failed to generate article: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUploadToWordPress = async () => {
        if (!wpUrl || !wpUsername || !wpPassword) {
            alert('Please provide WordPress credentials');
            return;
        }
        if (!currentArticle) {
            alert('No article to upload');
            return;
        }

        setIsUploading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/upload-to-wordpress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wpUrl,
                    wpUser: wpUsername,
                    wpPassword,
                    title: currentSeoTitle,
                    content: currentArticle,
                    imageUrl: currentImageUrl
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ Uploaded to WordPress: ${data.link}`);
            } else {
                alert('❌ Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('WordPress Upload Error:', error);
            alert('❌ Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">

            {/* Header / Navbar */}
            <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-300">
                <div className="px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/agents')}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
                            title="Back to Agents"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Bot className="text-indigo-600 dark:text-indigo-400" size={24} />
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                SEO AutoGen
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Credit Display */}
                        <div className="hidden md:flex flex-col items-end group relative">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {credits.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Available Credits
                            </div>
                            {agentStats && (
                                <div className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 z-20">
                                    <div className="text-xs space-y-1">
                                        <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">SEO Agent Stats</div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Total Used:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{agentStats.totalCreditsUsed.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500 dark:text-gray-400">Articles:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{agentStats.totalUsageCount}</span>
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs pt-1 border-t border-gray-200 dark:border-slate-700 mt-2">
                                            Cost: 5 credits/word
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden md:block"></div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="px-6 flex gap-1 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${activeTab === tab.id
                                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <TabIcon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Low Credit Alert */}
            {showLowCreditAlert && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b dark:border-yellow-800 px-6 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Low Credit Balance</p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                    You have {credits} credits remaining. Consider purchasing more credits to continue using this agent.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowLowCreditAlert(false)}
                            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6 md:p-8">

                {/* Non-generate tab content */}
                {activeTab === 'blogs' && <BlogManagerPanel />}
                {activeTab === 'push' && <PushNotificationPanel />}
                {activeTab === 'tokens' && <DeviceTokensPanel />}


                {/* Generate tab content */}
                {activeTab === 'generate' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Generator Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 md:p-8 transition-colors duration-300">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                                    Create SEO Optimized Article
                                </h2>

                                <div className="space-y-6">
                                    {/* Source Type Selector */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Source Type *</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSourceType('manual')}
                                                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${sourceType === 'manual'
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                📝 Manual Entry
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSourceType('wordpress')}
                                                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${sourceType === 'wordpress'
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                    : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                🌐 WordPress Website
                                            </button>
                                        </div>
                                    </div>

                                    {/* WordPress Credentials (conditional) */}
                                    {sourceType === 'wordpress' && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-2xl">🌐</span>
                                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">WordPress Auto-Upload Settings</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
                                                        WordPress Username *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={wpUsername}
                                                        onChange={(e) => setWpUsername(e.target.value)}
                                                        placeholder="admin"
                                                        className="w-full px-4 py-3 text-base rounded-lg bg-white dark:bg-slate-900/50 border border-blue-300 dark:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
                                                        Application Password *
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={wpPassword}
                                                        onChange={(e) => setWpPassword(e.target.value)}
                                                        placeholder="xxxx xxxx xxxx xxxx"
                                                        className="w-full px-4 py-3 text-base rounded-lg bg-white dark:bg-slate-900/50 border border-blue-300 dark:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-blue-100 dark:bg-blue-800/30 rounded-lg p-3 mt-3">
                                                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                                    <span className="text-lg">ℹ️</span>
                                                    <span>
                                                        <strong>Auto-Upload Enabled:</strong> Article will be automatically uploaded to WordPress as a draft and tracked in Google Sheets (Niche | Keywords | Title).
                                                        <br />
                                                        Ensure you have configured Google Sheets in <Link to="/settings" className="underline font-bold hover:text-blue-600">Settings</Link>.
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Interlinking Section (Available for all modes) */}
                                    <div className="space-y-2 mt-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Website URL for Interlinking (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={wpUrl}
                                            onChange={(e) => setWpUrl(e.target.value)}
                                            placeholder="https://yourwebsite.com (Auto-fetches posts for interlinking)"
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Providing this URL allows the AI to read your recent posts and intelligently link to them in the article.
                                        </p>
                                    </div>

                                    {/* Mode Selection */}
                                    <div className="mb-6 grid grid-cols-2 gap-4 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setGenerationMode('topic')}
                                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${generationMode === 'topic'
                                                ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Edit3 className="w-4 h-4" />
                                                <span>Manual Entry</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setGenerationMode('industry')}
                                            className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${generationMode === 'industry'
                                                ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Bot className="w-4 h-4" />
                                                <span>Auto-Generate from Industry</span>
                                            </div>
                                        </button>
                                    </div>

                                    {generationMode === 'topic' ? (
                                        <>
                                            {/* Topic */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
                                                <div className="relative">
                                                    <textarea
                                                        value={topic}
                                                        onChange={(e) => setTopic(e.target.value)}
                                                        placeholder="Enter your article topic or provide a brief description..."
                                                        className="w-full h-32 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                                    />
                                                    <Edit3 className="absolute bottom-3 right-3 text-gray-400" size={16} />
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Provide a clear topic or description for your article</p>
                                            </div>

                                            {/* Keywords */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Keywords (Comma Separated)</label>
                                                <input
                                                    type="text"
                                                    value={keywords}
                                                    onChange={(e) => setKeywords(e.target.value)}
                                                    placeholder="e.g. Reactjs, Hook, Context"
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Add relevant keywords to optimize your content</p>
                                            </div>
                                        </>
                                    ) : (
                                        /* Industry Input */
                                        <div className="mb-6 space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Industry / Niche
                                            </label>
                                            <input
                                                type="text"
                                                value={industry}
                                                onChange={(e) => setIndustry(e.target.value)}
                                                placeholder="E.g., Real Estate, Digital Marketing, SaaS, Crypto"
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
                                            />
                                            <div className="mt-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                                                <p className="text-sm text-indigo-700 dark:text-indigo-400 flex items-start gap-2">
                                                    <Bot className="w-4 h-4 mt-0.5 shrink-0" />
                                                    <span>
                                                        AI will analyze this industry to find a high-ranking, trending topic and the best keywords automatically.
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dropdowns Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                                            <div className="relative">
                                                <select
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all appearance-none text-gray-900 dark:text-gray-100"
                                                >
                                                    <option>English</option>
                                                    <option>Hindi</option>
                                                </select>
                                                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Writing Style</label>
                                            <div className="relative">
                                                <select
                                                    value={writingStyle}
                                                    onChange={(e) => setWritingStyle(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all appearance-none text-gray-900 dark:text-gray-100"
                                                >
                                                    <option>Professional</option>
                                                    <option>Casual</option>
                                                    <option>Technical</option>
                                                    <option>Storytelling</option>
                                                </select>
                                                <PenTool className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Article Length</label>
                                            <div className="relative">
                                                <select
                                                    value={articleLength}
                                                    onChange={(e) => setArticleLength(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all appearance-none text-gray-900 dark:text-gray-100"
                                                >
                                                    <option>Short (300-500 words)</option>
                                                    <option>Medium (500-1000 words)</option>
                                                    <option>Long (1000-2000 words)</option>
                                                </select>
                                                <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Audience</label>
                                            <div className="relative">
                                                <select
                                                    value={targetAudience}
                                                    onChange={(e) => setTargetAudience(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all appearance-none text-gray-900 dark:text-gray-100"
                                                >
                                                    <option>General Public</option>
                                                    <option>Beginners</option>
                                                    <option>Experts</option>
                                                    <option>Decision Makers</option>
                                                </select>
                                                <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Variants</label>
                                            <div className="relative">
                                                <select
                                                    value={variants}
                                                    onChange={(e) => setVariants(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all appearance-none text-gray-900 dark:text-gray-100"
                                                >
                                                    <option>1 Variant</option>
                                                    <option>2 Variants</option>
                                                    <option>Max 3 for demo</option>
                                                </select>
                                                <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        {/* Image Settings */}
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Image Source</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setImageOption('auto')}
                                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${imageOption === 'auto'
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                        : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    ✨ AI Auto
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setImageOption('custom')}
                                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${imageOption === 'custom'
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                        : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    🔗 Custom URL
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setImageOption('none')}
                                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${imageOption === 'none'
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                        : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    🚫 None
                                                </button>
                                            </div>
                                            {imageOption === 'custom' && (
                                                <div className="mt-2">
                                                    <input
                                                        type="url"
                                                        value={customImageUrl}
                                                        onChange={(e) => setCustomImageUrl(e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* New Fields: Author & Category */}
                                        <div className="space-y-2">
                                            <ProfileSelection onProfileSelect={handleProfileSelect} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                            <input
                                                type="text"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                placeholder="e.g. Technology"
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags (Comma Separated)</label>
                                            <input
                                                type="text"
                                                value={tags}
                                                onChange={(e) => setTags(e.target.value)}
                                                placeholder="e.g. AI, Tech, Future"
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className={`w-full bg-slate-700 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2 ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={20} className="fill-current" /> Generate Article
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Generated Article Display */}
                            {currentArticle && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl shadow-sm border border-indigo-200 dark:border-indigo-700 p-6 md:p-8 transition-colors duration-300">
                                    <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                                        📝 Generated Article
                                    </h2>

                                    {currentSeoTitle && (
                                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                                            <strong className="text-gray-900 dark:text-gray-100">SEO Optimized Title:</strong>
                                            <p className="text-gray-700 dark:text-gray-300 mt-1 font-medium">{currentSeoTitle}</p>
                                        </div>
                                    )}

                                    {currentImageUrl && (
                                        <img
                                            src={currentImageUrl}
                                            alt="Blog featured image"
                                            className="mb-4 w-full rounded-md shadow-md border border-gray-200 dark:border-gray-700"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}

                                    <div
                                        className="prose dark:prose-invert max-w-none mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg"
                                        dangerouslySetInnerHTML={{ __html: currentArticle }}
                                    />

                                    <button
                                        onClick={handleUploadToWordPress}
                                        disabled={isUploading || !wpUrl || !wpUsername || !wpPassword}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            '⬆️ Upload to WordPress'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Column: History */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden sticky top-24 transition-colors duration-300">
                                <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Article History</h3>
                                    <button
                                        onClick={loadArticles}
                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                        title="Refresh articles"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                                    {loadingArticles ? (
                                        <div className="flex justify-center items-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        </div>
                                    ) : articles.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <p>No articles yet</p>
                                            <p className="text-xs mt-1">Generate your first article!</p>
                                        </div>
                                    ) : (
                                        articles.slice(0, 10).map((article) => (
                                            <div
                                                key={article.id}
                                                className="p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-gray-50 dark:bg-slate-900/30 hover:shadow-md transition-all cursor-pointer group"
                                                onClick={() => {
                                                    setCurrentArticle(article.content);
                                                    setCurrentSeoTitle(article.seoTitle);
                                                    setCurrentImageUrl(article.imageUrl);
                                                }}
                                            >
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {article.seoTitle || article.topic}
                                                </h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(article.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
};

export default SeoAgentPage;
