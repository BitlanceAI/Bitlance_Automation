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
    LogOut,
    Bell,
    Code,
    Clock,
    CheckCircle,
    Layers
} from 'lucide-react';

import blogService from '../services/blogService';
import API_BASE_URL from '../config.js';
import ProfileSelection from '../components/dashboard/ProfileSelection';
import WordPressProfileSelection from '../components/dashboard/WordPressProfileSelection';

// Panel components for tabs
import PushNotificationPanel from '../components/seo/PushNotificationPanel';

import BlogManagerPanel from '../components/seo/BlogManagerPanel';
import SEOHead from '../components/layout/SEOHead';
import WpAutoQueuePanel from '../components/seo/WpAutoQueuePanel';

const SeoAgentPage = () => {
    const navigate = useNavigate();
    const { user, credits, isAdmin, refreshCredits } = useAuth();

    // Tab State
    const [activeTab, setActiveTab] = useState('generate');

    const tabs = [
        { id: 'generate', label: 'Generate', icon: Zap },
        { id: 'blogs', label: 'Blog Manager', icon: FileText },
        { id: 'queue', label: 'Auto Queue', icon: Clock },
        { id: 'push', label: 'Send Push', icon: Bell },
    ];

    // Mode State — removed (now always auto-research mode)

    // Form State
    const [topic, setTopic] = useState('');
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
    const [selectedWpProfile, setSelectedWpProfile] = useState(null);
    const [interlinkUrl, setInterlinkUrl] = useState('');

    const handleWpProfileSelect = (selection) => {
        setSelectedWpProfile(selection);
        const profile = selection.profileData;
        if (profile) {
            setInterlinkUrl(profile.interlink_url || profile.wp_url || '');
        }
    };

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



    // Admin check
    const ADMIN_ID = '0d396440-7d07-407c-89da-9cb93e353347';
    const [isCompanyBlog, setIsCompanyBlog] = useState(false);

    useEffect(() => {
        if (user?.id === ADMIN_ID) {
            setIsCompanyBlog(true);
        }
    }, [user]);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            alert('Please enter an article title');
            return;
        }

        // Check credits
        const CREDIT_COST = 5;
        if (!isAdmin && credits < CREDIT_COST) {
            alert(`⚠️ Insufficient credits! You need ${CREDIT_COST} credits to generate an article. Current balance: ${credits}`);
            return;
        }

        // Validate WordPress credentials if WordPress source is selected
        if (sourceType === 'wordpress' && !selectedWpProfile) {
            alert('Please select or provide WordPress credentials');
            return;
        }

        setIsGenerating(true);
        try {
            const payload = {
                topic,           // Article title provided by user
                industry: null,  // AI auto-researches industry from the title
                keywords: null,  // AI auto-researches best keywords
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
                wp_url: sourceType === 'wordpress' && selectedWpProfile ? selectedWpProfile.profileData?.wp_url : '',
                wp_api_url: interlinkUrl || null,  // custom interlinking URL — Python fetches existing posts from here
                wp_username: '',
                wp_password: '',
                // Image
                image_option: imageOption,
                custom_image_url: customImageUrl,
                // Admin Target Table (Prevent company blog save if WordPress is selected for a client)
                target_table: (user?.id === ADMIN_ID && isCompanyBlog && sourceType !== 'wordpress') ? 'company_articles' : 'articles'
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

            // Refresh session first to prevent stale token 401 errors
            await supabase.auth.refreshSession();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                alert('❌ Session expired. Please log in again.');
                navigate('/login');
                return;
            }


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
                        // Extract profile data
                        let targetWpUrl = '';
                        let targetWpUser = '';
                        let targetWpPassword = '';

                        if (selectedWpProfile) {
                            if (selectedWpProfile.type === 'existing') {
                                // Assuming we pass the full profile data or the backend resolves it
                                targetWpUrl = selectedWpProfile.profileData.wp_url;
                                targetWpUser = selectedWpProfile.profileData.wp_username;
                                targetWpPassword = selectedWpProfile.profileData.wp_app_password; // Ensure API handles this safely
                            } else if (selectedWpProfile.type === 'manual') {
                                targetWpUrl = selectedWpProfile.profileData.wp_url;
                                targetWpUser = selectedWpProfile.profileData.wp_username;
                                targetWpPassword = selectedWpProfile.profileData.wp_app_password;

                                // Save new WordPress profile if requested
                                if (selectedWpProfile.saveAsNew) {
                                    try {
                                        await fetch(`${API_BASE_URL}/api/wordpress/profiles`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${token}`
                                            },
                                            body: JSON.stringify(selectedWpProfile.profileData)
                                        });
                                    } catch (err) {
                                        console.error('Failed to save WP profile:', err);
                                    }
                                }
                            }
                        }

                        // Upload to WordPress
                        console.log('Uploading to WordPress...');
                        const wpResponse = await fetch(`${API_BASE_URL}/api/wordpress/upload`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                wpUrl: targetWpUrl,
                                wpUser: targetWpUser,
                                wpPassword: targetWpPassword,
                                profileId: selectedWpProfile?.type === 'existing' ? selectedWpProfile.profileId : null,
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
                    } catch (wpError) {
                        console.error('Error with WordPress:', wpError);
                        alert('⚠️ Article generated but WordPress upload failed: ' + wpError.message);
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
                    keywords: data.keywords || '',
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

                // Reset WordPress profile selection
                setSelectedWpProfile(null);

                let message = sourceType === 'wordpress'
                    ? '✅ Article Generated & Uploaded to WordPress!'
                    : '✅ Article Generated & Saved!';
                // Show auto-upload result if WordPress credentials are saved in settings
                if (data.wpPostLink) {
                    message = `✅ Article Generated & Auto-Uploaded to WordPress!\n\nDraft URL: ${data.wpPostLink}`;
                }
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
        if (!selectedWpProfile) {
            alert('Please select or provide WordPress credentials');
            return;
        }
        if (!currentArticle) {
            alert('No article to upload');
            return;
        }

        setIsUploading(true);
        try {
            // Get session token for authentication
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            let targetWpUrl = '';
            let targetWpUser = '';
            let targetWpPassword = '';

            if (selectedWpProfile.type === 'existing') {
                targetWpUrl = selectedWpProfile.profileData.wp_url;
                targetWpUser = selectedWpProfile.profileData.wp_username;
                targetWpPassword = selectedWpProfile.profileData.wp_app_password;
            } else if (selectedWpProfile.type === 'manual') {
                targetWpUrl = selectedWpProfile.profileData.wp_url;
                targetWpUser = selectedWpProfile.profileData.wp_username;
                targetWpPassword = selectedWpProfile.profileData.wp_app_password;
            }

            const response = await fetch(`${API_BASE_URL}/api/wordpress/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    wpUrl: targetWpUrl,
                    wpUser: targetWpUser,
                    wpPassword: targetWpPassword,
                    profileId: selectedWpProfile.type === 'existing' ? selectedWpProfile.profileId : null,
                    title: currentSeoTitle || currentArticle.substring(0, 50),
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
        <div className="min-h-screen bg-[#070707] text-white font-sans transition-colors duration-300">
            <SEOHead canonicalUrl="https://www.bitlancetechhub.com/dashboard/agents/seo" noIndex={true} />

            {/* Header / Navbar */}
            <header className="bg-[#111111] border-b border-[#1E1E1E] sticky top-0 z-10 transition-colors duration-300">
                <div className="px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/agents')}
                            className="p-2 rounded-[2px] hover:bg-[#1A1A1A] text-gray-400 transition-colors border border-transparent hover:border-[#333]"
                            title="Back to Agents"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Bot className="text-[#26cece]" size={24} />
                            <h1 className="text-xl font-bold text-[#26cece] font-['Space_Grotesk'] tracking-tight">
                                SEO AutoGen
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Credit Display */}
                        <div className="hidden md:flex flex-col items-end group relative">
                            <div className="text-2xl font-bold font-mono text-[#26cece]">
                                {credits.toLocaleString()}
                            </div>
                            <div className="text-[10px] uppercase font-mono tracking-widest text-gray-500">
                                Available Credits
                            </div>
                            {agentStats && (
                                <div className="absolute top-full mt-2 right-0 bg-[#111111] border border-[#1E1E1E] rounded-[2px] p-4 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-56 z-20">
                                    <div className="text-xs space-y-2 font-mono">
                                        <div className="font-bold text-[#26cece] mb-3 uppercase tracking-widest text-[10px]">SEO Agent Stats</div>
                                        <div className="flex justify-between items-center bg-[#070707] p-2 rounded-[2px] border border-[#333]">
                                            <span className="text-gray-500 uppercase text-[10px]">Total Used:</span>
                                            <span className="text-[#26cece] font-bold">{agentStats.totalCreditsUsed.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#070707] p-2 rounded-[2px] border border-[#333]">
                                            <span className="text-gray-500 uppercase text-[10px]">Articles:</span>
                                            <span className="text-[#26cece] font-bold">{agentStats.totalUsageCount}</span>
                                        </div>
                                        <div className="text-gray-500 uppercase tracking-widest text-[10px] pt-2 mt-2 border-t border-[#333] text-center">
                                            Cost: 5 credits/word
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-6 w-px bg-[#1E1E1E] hidden md:block"></div>
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
                                className={`flex items-center gap-2 px-4 py-3 text-[12px] font-mono tracking-widest uppercase whitespace-nowrap border-b-2 transition-all duration-200 ${activeTab === tab.id
                                    ? 'border-[#26cece] text-[#26cece]'
                                    : 'border-transparent text-gray-500 hover:text-white hover:border-[#333]'
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
                <div className="bg-[rgba(234,179,8,0.1)] border-b border-[rgba(234,179,8,0.3)] px-6 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="text-[12px] font-bold font-mono tracking-widest uppercase text-yellow-400">Low Credit Balance</p>
                                <p className="text-xs text-yellow-500/80 font-mono mt-1">
                                    You have {credits} credits remaining. Consider purchasing more credits to continue using this agent.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowLowCreditAlert(false)}
                            className="text-yellow-600 hover:text-yellow-400 hover:rotate-90 transition-all p-2"
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
                {activeTab === 'queue' && <WpAutoQueuePanel />}
                {activeTab === 'push' && <PushNotificationPanel />}


                {/* Generate tab content */}
                {activeTab === 'generate' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Generator Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-[#111111] rounded-[2px] border border-[#1E1E1E] p-6 md:p-8">
                                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3 font-['Space_Grotesk'] tracking-tight">
                                    <Bot className="text-[#26cece]" size={24} />
                                    AI SEO Article Generator
                                </h2>
                                <div className="mb-6 flex items-start gap-3 p-4 bg-[#070707] rounded-[2px] border border-[#333]">
                                    <Bot className="w-5 h-5 mt-0.5 text-[#26cece] shrink-0" />
                                    <p className="text-[13px] text-gray-400 leading-relaxed font-sans">
                                        Just enter a title — our AI automatically researches the best <strong>industry positioning</strong>, <strong>SEO keywords</strong>, and <strong className="text-white">content strategy</strong> using AI SEO best practices (E-E-A-T, authority signals, structured content for AI citation).
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Source Type Selector */}
                                    <div>
                                        <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-3">Source Type *</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setSourceType('manual')}
                                                className={`px-4 py-3 rounded-[2px] border font-bold font-mono tracking-widest uppercase text-[10px] transition-all ${sourceType === 'manual'
                                                    ? 'border-[#26cece] bg-[#070707] text-[#26cece] shadow-[2px_2px_0_0_#26cece]'
                                                    : 'border-[#333] hover:border-[#555] text-gray-500 hover:text-white'
                                                    }`}
                                            >
                                                📝 Manual Entry
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSourceType('wordpress')}
                                                className={`px-4 py-3 rounded-[2px] border font-bold font-mono tracking-widest uppercase text-[10px] transition-all ${sourceType === 'wordpress'
                                                    ? 'border-[#26cece] bg-[#070707] text-[#26cece] shadow-[2px_2px_0_0_#26cece]'
                                                    : 'border-[#333] hover:border-[#555] text-gray-500 hover:text-white'
                                                    }`}
                                            >
                                                🌐 WordPress Website
                                            </button>
                                        </div>
                                    </div>

                                    {/* WordPress Credentials (conditional) */}
                                    {sourceType === 'wordpress' && (
                                        <WordPressProfileSelection onProfileSelect={handleWpProfileSelect} />
                                    )}

                                    {/* Interlinking Section (Available for all modes) */}
                                    <div className="space-y-3 mt-4">
                                        <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500">
                                            Website URL for Interlinking (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={interlinkUrl}
                                            onChange={(e) => setInterlinkUrl(e.target.value)}
                                            placeholder="https://yourwebsite.com (Auto-fetches posts)"
                                            className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                                        />
                                        <p className="text-[10px] text-gray-500 font-mono mt-1">
                                            Providing this URL allows the AI to read your recent posts and intelligently link to them in the article.
                                        </p>
                                    </div>

                                    {/* Article Title — only required input */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-mono tracking-widest uppercase text-gray-500">
                                            Article Title <span className="text-[#26cece]">*</span>
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder="e.g. How AI is Transforming Real Estate Lead Generation in 2025"
                                                className="w-full h-32 px-4 py-4 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all resize-none text-white font-mono text-[14px] placeholder-gray-600"
                                            />
                                            <Edit3 className="absolute bottom-4 right-4 text-[#333]" size={16} />
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-mono">
                                            AI will automatically determine the best industry, keywords, and content angle for this title.
                                        </p>
                                    </div>

                                    {/* Dropdowns Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-mono tracking-widest uppercase text-gray-500">Language</label>
                                            <div className="relative">
                                                <select
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all appearance-none text-white font-mono text-[14px]"
                                                >
                                                    <option>English</option>
                                                    <option>Hindi</option>
                                                </select>
                                                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-mono tracking-widest uppercase text-gray-500">Writing Style</label>
                                            <div className="relative">
                                                <select
                                                    value={writingStyle}
                                                    onChange={(e) => setWritingStyle(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all appearance-none text-white font-mono text-[14px]"
                                                >
                                                    <option>Professional</option>
                                                    <option>Casual</option>
                                                    <option>Technical</option>
                                                    <option>Storytelling</option>
                                                </select>
                                                <PenTool className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-mono tracking-widest uppercase text-gray-500">Article Length</label>
                                            <div className="relative">
                                                <select
                                                    value={articleLength}
                                                    onChange={(e) => setArticleLength(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all appearance-none text-white font-mono text-[14px]"
                                                >
                                                    <option>Short (300-500 words)</option>
                                                    <option>Medium (500-1000 words)</option>
                                                    <option>Long (1000-2000 words)</option>
                                                </select>
                                                <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-mono tracking-widest uppercase text-gray-500">Target Audience</label>
                                            <div className="relative">
                                                <select
                                                    value={targetAudience}
                                                    onChange={(e) => setTargetAudience(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all appearance-none text-white font-mono text-[14px]"
                                                >
                                                    <option>General Public</option>
                                                    <option>Beginners</option>
                                                    <option>Experts</option>
                                                    <option>Decision Makers</option>
                                                </select>
                                                <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-[10px] font-mono tracking-widest uppercase text-gray-500">Variants</label>
                                            <div className="relative">
                                                <select
                                                    value={variants}
                                                    onChange={(e) => setVariants(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all appearance-none text-white font-mono text-[14px]"
                                                >
                                                    <option>1 Variant</option>
                                                    <option>2 Variants</option>
                                                    <option>Max 3 for demo</option>
                                                </select>
                                                <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                                            </div>
                                        </div>

                                        {/* Image Settings */}
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500">Featured Image Source</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setImageOption('auto')}
                                                    className={`px-3 py-3 rounded-[2px] border font-bold font-mono tracking-widest uppercase text-[10px] transition-all ${imageOption === 'auto'
                                                        ? 'border-[#26cece] bg-[#070707] text-[#26cece] shadow-[2px_2px_0_0_#26cece]'
                                                        : 'border-[#333] hover:border-[#555] text-gray-500 hover:text-white'
                                                        }`}
                                                >
                                                    ✨ AI Auto
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setImageOption('custom')}
                                                    className={`px-3 py-3 rounded-[2px] border font-bold font-mono tracking-widest uppercase text-[10px] transition-all ${imageOption === 'custom'
                                                        ? 'border-[#26cece] bg-[#070707] text-[#26cece] shadow-[2px_2px_0_0_#26cece]'
                                                        : 'border-[#333] hover:border-[#555] text-gray-500 hover:text-white'
                                                        }`}
                                                >
                                                    🔗 Custom URL
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setImageOption('none')}
                                                    className={`px-3 py-3 rounded-[2px] border font-bold font-mono tracking-widest uppercase text-[10px] transition-all ${imageOption === 'none'
                                                        ? 'border-[#26cece] bg-[#070707] text-[#26cece] shadow-[2px_2px_0_0_#26cece]'
                                                        : 'border-[#333] hover:border-[#555] text-gray-500 hover:text-white'
                                                        }`}
                                                >
                                                    🚫 None
                                                </button>
                                            </div>
                                            {imageOption === 'custom' && (
                                                <div className="mt-3">
                                                    <input
                                                        type="url"
                                                        value={customImageUrl}
                                                        onChange={(e) => setCustomImageUrl(e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* New Fields: Author & Category */}
                                        <div className="space-y-3">
                                            <ProfileSelection onProfileSelect={handleProfileSelect} />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500">Category</label>
                                            <input
                                                type="text"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                placeholder="e.g. Technology"
                                                className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                                            />
                                        </div>

                                        <div className="space-y-3 md:col-span-2">
                                            <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500">Tags (Comma Separated)</label>
                                            <input
                                                type="text"
                                                value={tags}
                                                onChange={(e) => setTags(e.target.value)}
                                                placeholder="e.g. AI, Tech, Future"
                                                className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                                            />
                                        </div>

                                        {user?.id === ADMIN_ID && sourceType !== 'wordpress' && (
                                            <div className="md:col-span-2 flex items-start gap-4 p-5 bg-[#111111] rounded-[2px] border border-[#333]">
                                                <input
                                                    type="checkbox"
                                                    id="isCompanyBlog"
                                                    checked={isCompanyBlog}
                                                    onChange={(e) => setIsCompanyBlog(e.target.checked)}
                                                    className="mt-0.5 h-4 w-4 bg-[#070707] border-[#333] text-[#26cece] focus:ring-0 rounded-[2px]"
                                                />
                                                <div>
                                                    <label htmlFor="isCompanyBlog" className="block text-[12px] font-mono tracking-widest uppercase text-[#26cece] font-bold cursor-pointer select-none">
                                                        Generate as Company Blog Post (Public)
                                                    </label>
                                                    <p className="text-[10px] font-mono text-gray-500 mt-2">
                                                        If checked, this article will be published to the main company blog. Uncheck to save as a personal client article.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className={`w-full bg-[#26cece] text-[#070707] font-bold py-4 rounded-[2px] transition-all font-['Space_Grotesk'] tracking-widest uppercase hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333] text-[16px] flex items-center justify-center gap-3 ${isGenerating ? 'opacity-50 cursor-not-allowed hover:-translate-y-0 hover:shadow-none hover:bg-[#26cece]' : ''}`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-6 h-6 border-2 border-[#070707]/30 border-t-[#070707] rounded-full animate-spin"></div>
                                                Generating (Takes 1-3 mins)...
                                            </>
                                        ) : (
                                            <>
                                                <Zap fill="currentColor" size={24} />
                                                Generate SEO Content
                                                <span className="text-[12px] font-mono ml-2 opacity-70 border-l border-[#070707]/30 pl-2">
                                                    Cost ~5,000 credits
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Generated Article Display */}
                            {currentArticle && (
                                <div className="bg-[#070707] rounded-[2px] border border-[#333] p-6 md:p-8 transition-colors duration-300">
                                    <h2 className="text-xl font-bold mb-4 text-[#26cece] font-['Space_Grotesk'] tracking-tight flex items-center gap-3">
                                        <CheckCircle size={28} />
                                        Article Generated Successfully
                                    </h2>

                                    {currentSeoTitle && (
                                        <div className="mb-6 p-5 bg-[#111111] border border-[#333] rounded-[2px]">
                                            <strong className="text-gray-500 uppercase tracking-widest text-[10px] block mb-1 font-mono">SEO Optimized Title (H1)</strong>
                                            <p className="text-white font-mono text-[14px]">{currentSeoTitle}</p>
                                        </div>
                                    )}

                                    {currentImageUrl && (
                                        <img
                                            src={currentImageUrl}
                                            alt="Blog featured image"
                                            className="mb-6 w-full rounded-[2px] border border-[#333]"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}

                                    <div
                                        className="bg-[#111111] rounded-[2px] border border-[#1E1E1E] p-6 md:p-8 prose prose-invert font-mono max-w-none prose-headings:font-['Space_Grotesk'] prose-a:text-[#26cece] prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 mb-6"
                                        dangerouslySetInnerHTML={{ __html: currentArticle }}
                                    />

                                    <button
                                        onClick={handleUploadToWordPress}
                                        disabled={isUploading || !selectedWpProfile}
                                        className="w-full bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] tracking-widest uppercase px-6 py-4 rounded-[2px] hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-[#26cece] disabled:hover:shadow-none transition-all flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-[#070707]/30 border-t-[#070707] rounded-full animate-spin"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            '⬆️ Upload to WordPress as Draft'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Column: History */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#111111] rounded-[2px] border border-[#1E1E1E] overflow-hidden sticky top-24 transition-colors duration-300">
                                <div className="p-4 bg-[#070707] border-b border-[#1E1E1E] flex justify-between items-center">
                                    <h3 className="font-bold text-white font-['Space_Grotesk'] tracking-widest uppercase text-[14px] flex items-center gap-2">
                                        <Clock size={16} />
                                        Article History
                                    </h3>
                                    <button
                                        onClick={loadArticles}
                                        className="text-[10px] font-mono tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
                                        title="Refresh articles"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                    {loadingArticles ? (
                                        <div className="flex justify-center items-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#26cece]"></div>
                                        </div>
                                    ) : articles.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 font-mono text-[12px]">
                                            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>No articles yet</p>
                                            <p className="text-[10px] uppercase tracking-widest mt-2">Generate your first article!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {articles.slice(0, 10).map((article) => (
                                                <div
                                                    key={article.id}
                                                    className="p-3 rounded-[2px] border border-[#333] hover:border-[#26cece] bg-[#070707] transition-all cursor-pointer group"
                                                    onClick={() => {
                                                        setCurrentArticle(article.content);
                                                        setCurrentSeoTitle(article.seoTitle);
                                                        setCurrentImageUrl(article.imageUrl);
                                                    }}
                                                >
                                                    <h4 className="font-bold text-white font-['Space_Grotesk'] mb-2 group-hover:text-[#26cece] line-clamp-2 leading-snug transition-colors">
                                                        {article.seoTitle || article.topic}
                                                    </h4>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500">
                                                            {new Date(article.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            {(article.category || article.tags) && (
                                                                <span className="text-[10px] font-mono tracking-widest text-[#26cece] bg-[#111111] border border-[#333] px-2 py-1 rounded-[2px] flex items-center">
                                                                    View
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
