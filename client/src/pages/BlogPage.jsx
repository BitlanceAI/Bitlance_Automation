import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, Plus, Upload, Trash2, Eye, RefreshCw, Home, LayoutDashboard, Bot, Radio, FileText } from 'lucide-react';

import blogService from '../services/blogService';
import API_BASE_URL from '../config.js';
import ProfileSelection from '../components/ProfileSelection';

const BlogPage = () => {
    const { user, credits, isAdmin, refreshCredits } = useAuth();
    const navigate = useNavigate();

    // Article state
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [sourceType, setSourceType] = useState('manual'); // 'manual' or 'wordpress'
    const [wordpressUrl, setWordpressUrl] = useState('');
    const [wordpressUsername, setWordpressUsername] = useState('');
    const [wordpressPassword, setWordpressPassword] = useState('');
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [language, setLanguage] = useState('English');
    const [writingStyle, setWritingStyle] = useState('Professional');
    const [articleLength, setArticleLength] = useState('Medium (500-1000 words)');
    const [targetAudience, setTargetAudience] = useState('General Public');

    // WordPress state
    const [wpUrl, setWpUrl] = useState('');
    const [wpUsername, setWpUsername] = useState('');
    const [wpPassword, setWpPassword] = useState('');

    // Loading states
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showNav, setShowNav] = useState(false);

    // Profile State
    const [selectedProfile, setSelectedProfile] = useState(null);

    const handleProfileSelect = (selection) => {
        setSelectedProfile(selection);
    };

    // Load articles on mount
    useEffect(() => {
        if (user) {
            loadArticles();
        }
    }, [user]);

    const loadArticles = async () => {
        try {
            setLoadingArticles(true);
            const fetchedArticles = await blogService.getArticles(user?.id);
            setArticles(fetchedArticles);
        } catch (error) {
            console.error('Error loading articles:', error);
            alert('Failed to load articles');
        } finally {
            setLoadingArticles(false);
        }
    };

    const handleGenerateArticle = async () => {
        if (!topic.trim()) {
            alert('Please enter a topic');
            return;
        }

        // Check credits
        const CREDIT_COST = 5;
        if (!isAdmin && credits < CREDIT_COST) {
            alert(`⚠️ Insufficient credits! You need ${CREDIT_COST} credits to generate an article. Current balance: ${credits}`);
            return;
        }

        setIsGenerating(true);
        try {
            // 1. Generate Article
            // Get token from auth context (assuming it stored in localStorage or handled by helper, 
            // but useAuth usually exposes token or we get session. simpler to assume session management via supabase client in frontend matches backend expectation if using cookie or header. 
            // Wrapper: we need to pass Authorization: Bearer <token>.
            // Let's get session from supabase or user object? 
            // user object from useAuth might be Supabase user.
            // Let's assume global supabase client usage or we need to get session.

            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // Handle Profile Logic
            let authorProfileId = null;
            let authorDetails = null;
            let finalAuthorName = '';
            let finalAuthorBio = '';

            if (selectedProfile) {
                if (selectedProfile.type === 'existing') {
                    authorProfileId = selectedProfile.profileId;
                    finalAuthorName = selectedProfile.profileData?.name;
                    finalAuthorBio = selectedProfile.profileData?.bio;
                } else if (selectedProfile.type === 'manual') {
                    authorDetails = selectedProfile.profileData;
                    finalAuthorName = authorDetails.name;
                    finalAuthorBio = authorDetails.bio;

                    if (selectedProfile.saveAsNew) {
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
                            // Fallback to manual details
                        }
                    }
                }
            }

            const response = await fetch(`${API_BASE_URL}/api/articles/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic,
                    keywords,
                    language,
                    style: writingStyle,
                    length: articleLength,
                    audience: targetAudience,
                    author_name: finalAuthorName, // Legacy fallback
                    author_bio: finalAuthorBio, // Legacy fallback
                    author_profile_id: authorProfileId,
                    author_details: authorDetails
                })
            });

            const data = await response.json();

            if (data.success) {
                // Credits are deducted atomically by the Python backend
                refreshCredits(); // Update local credit state

                // If WordPress source selected, upload to WordPress
                if (sourceType === 'wordpress') {
                    if (!wordpressUrl || !wordpressUsername || !wordpressPassword) {
                        alert('Please provide all WordPress credentials');
                        return;
                    }

                    try {
                        // 1. Upload to WordPress
                        console.log('Uploading to WordPress...');
                        const wpResponse = await fetch(`${API_BASE_URL}/api/upload-to-wordpress`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                wpUrl: wordpressUrl,
                                wpUser: wordpressUsername,
                                wpPassword: wordpressPassword,
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

                        // 2. Send to Google Sheets for tracking
                        await fetch(`${API_BASE_URL}/api/add-to-google-sheet`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                niche: topic,
                                keywords: keywords,
                                title: data.seoTitle || topic,
                                wordpressUrl: wordpressUrl,
                                userId: user.id
                            })
                        });
                        console.log('✅ Data sent to Google Sheets');
                    } catch (wpError) {
                        console.error('Error with WordPress/Sheets:', wpError);
                        alert('⚠️ Article generated but WordPress upload or Sheets tracking failed: ' + wpError.message);
                    }
                }

                const savedArticle = await blogService.saveArticle({
                    topic,
                    seoTitle: data.seoTitle || topic,
                    content: data.article,
                    imageUrl: data.imageUrl || null,
                    keywords,
                    language,
                    style: writingStyle,
                    length: articleLength,
                    audience: targetAudience
                });

                console.log('Article saved to Supabase:', savedArticle);

                // Add to articles list and select it
                const newArticles = [savedArticle.article, ...articles];
                setArticles(newArticles);
                setSelectedArticle(savedArticle.article);
                setShowForm(false);

                // Reset form
                setTopic('');
                setKeywords('');
                setWordpressUrl('');
                setWordpressUsername('');
                setWordpressPassword('');

                const message = sourceType === 'wordpress'
                    ? '✅ Article Generated, Uploaded to WordPress & Tracked in Google Sheets!'
                    : '✅ Article Generated & Saved to Supabase!';
                alert(message);
            } else {
                alert('❌ Error: ' + data.error);
            }
        } catch (error) {
            console.error('Generation Error:', error);
            alert('❌ Failed to generate article: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUploadToWordPress = async (article) => {
        if (!wpUrl || !wpUsername || !wpPassword) {
            alert('Please provide WordPress credentials');
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
                    title: article.seoTitle,
                    content: article.content,
                    imageUrl: article.imageUrl
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

    const handleDeleteArticle = async (articleId) => {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            await blogService.deleteArticle(articleId);
            setArticles(articles.filter(a => a.id !== articleId));
            if (selectedArticle?.id === articleId) {
                setSelectedArticle(null);
            }
            alert('✅ Article deleted');
        } catch (error) {
            console.error('Delete Error:', error);
            alert('❌ Failed to delete article');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Navigation Sidebar */}
            <div className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 z-20 ${showNav ? 'w-64' : 'w-16'}`}>
                <div className="flex flex-col h-full">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setShowNav(!showNav)}
                        className="p-4 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border-b border-gray-200 dark:border-slate-700"
                    >
                        <FileText size={24} className="text-gray-600 dark:text-gray-300" />
                    </button>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-4 space-y-2">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors text-base font-medium"
                            title="Home"
                        >
                            <Home size={22} />
                            {showNav && <span>Home</span>}
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors text-base font-medium"
                            title="Sales Dashboard"
                        >
                            <LayoutDashboard size={22} />
                            {showNav && <span>Dashboard</span>}
                        </button>

                        <button
                            onClick={() => navigate('/seo-agent')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors text-base font-medium"
                            title="SEO Agent"
                        >
                            <Bot size={22} />
                            {showNav && <span>SEO Agent</span>}
                        </button>

                        <button
                            onClick={() => navigate('/broadcast')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors text-base font-medium"
                            title="Broadcast"
                        >
                            <Radio size={22} />
                            {showNav && <span>Broadcast</span>}
                        </button>

                        <div className="border-t border-gray-200 dark:border-slate-700 my-4"></div>

                        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-2 border-indigo-300 dark:border-indigo-600">
                            <FileText size={22} className="text-indigo-600 dark:text-indigo-400 mx-auto" />
                            {showNav && <span className="text-base font-semibold text-indigo-600 dark:text-indigo-400 block mt-2">Blog Manager</span>}
                        </div>
                    </nav>
                </div>
            </div>

            {/* Header */}
            <header className={`h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 flex items-center justify-between sticky top-0 z-10 transition-all duration-300 ${showNav ? 'ml-64' : 'ml-16'}`}>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Back to Home"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        📝 Blog Manager
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        <Plus size={18} />
                        New Article
                    </button>

                </div>
            </header>

            {/* Main Content */}
            <main className={`max-w-7xl mx-auto p-6 transition-all duration-300 ${showNav ? 'ml-64' : 'ml-16'}`}>
                {/* New Article Form */}
                {showForm && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6 transition-colors duration-300">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Generate New Article</h2>

                        <div className="space-y-4">
                            {/* Source Type Selector */}
                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">Source Type *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSourceType('manual')}
                                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${sourceType === 'manual'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                            : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                            }`}
                                    >
                                        📝 Manual Entry
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSourceType('wordpress')}
                                        className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${sourceType === 'wordpress'
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                            : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
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

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
                                            WordPress Website URL *
                                        </label>
                                        <input
                                            type="url"
                                            value={wordpressUrl}
                                            onChange={(e) => setWordpressUrl(e.target.value)}
                                            placeholder="https://yourwebsite.com"
                                            className="w-full px-4 py-3 text-base rounded-lg bg-white dark:bg-slate-900/50 border border-blue-300 dark:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-blue-900 dark:text-blue-300">
                                                WordPress Username *
                                            </label>
                                            <input
                                                type="text"
                                                value={wordpressUsername}
                                                onChange={(e) => setWordpressUsername(e.target.value)}
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
                                                value={wordpressPassword}
                                                onChange={(e) => setWordpressPassword(e.target.value)}
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

                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">Topic *</label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Benefits of AI in Modern Healthcare"
                                    className="w-full px-4 py-3 text-base rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">Keywords</label>
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="e.g., AI, healthcare, machine learning, automation"
                                    className="w-full px-4 py-3 text-base rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Separate keywords with commas</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">Language</label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full px-4 py-3 text-base rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option>English</option>
                                        <option>Hindi</option>

                                    </select>
                                </div>

                                <div>
                                    <label className="block text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">Style</label>
                                    <select
                                        value={writingStyle}
                                        onChange={(e) => setWritingStyle(e.target.value)}
                                        className="w-full px-4 py-3 text-base rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option>Professional</option>
                                        <option>Casual</option>
                                        <option>Technical</option>
                                        <option>Conversational</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">Length</label>
                                    <select
                                        value={articleLength}
                                        onChange={(e) => setArticleLength(e.target.value)}
                                        className="w-full px-4 py-3 text-base rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option>Short (300-500 words)</option>
                                        <option>Medium (500-1000 words)</option>
                                        <option>Long (1000-2000 words)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">Target Audience</label>
                                <select
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    className="w-full px-4 py-3 text-base rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option>General Public</option>
                                    <option>Professionals</option>
                                    <option>Students</option>
                                    <option>Developers</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <ProfileSelection onProfileSelect={handleProfileSelect} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleGenerateArticle}
                                    disabled={isGenerating}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        '✨ Generate Article'
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Articles Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Articles List */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Articles ({articles.length})</h2>
                            <button
                                onClick={loadArticles}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {loadingArticles ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : articles.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <p>No articles yet</p>
                                    <p className="text-sm mt-2">Click "New Article" to create one</p>
                                </div>
                            ) : (
                                articles.map((article) => (
                                    <div
                                        key={article.id}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedArticle?.id === article.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                            }`}
                                        onClick={() => setSelectedArticle(article)}
                                    >
                                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                                            {article.seoTitle || article.topic}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(article.createdAt).toLocaleDateString()}
                                        </p>
                                        {article.imageUrl && (
                                            <img
                                                src={article.imageUrl}
                                                alt=""
                                                className="mt-2 w-full h-20 object-cover rounded"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Article Preview */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-300">
                        {selectedArticle ? (
                            <>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold mb-2">{selectedArticle.seoTitle || selectedArticle.topic}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Created: {new Date(selectedArticle.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteArticle(selectedArticle.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete article"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                {selectedArticle.imageUrl && (
                                    <img
                                        src={selectedArticle.imageUrl}
                                        alt="Featured"
                                        className="w-full rounded-lg mb-6 shadow-md"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                )}

                                <div
                                    className="prose prose-lg dark:prose-invert max-w-none mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg
                                    prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                                    prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                                    prose-img:rounded-xl prose-img:shadow-md text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                                />

                                {/* WordPress Section */}
                                <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6">
                                    <h3 className="font-bold mb-4">WordPress Publishing</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                        <input
                                            type="url"
                                            value={wpUrl}
                                            onChange={(e) => setWpUrl(e.target.value)}
                                            placeholder="WordPress URL"
                                            className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={wpUsername}
                                            onChange={(e) => setWpUsername(e.target.value)}
                                            placeholder="Username"
                                            className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                        <input
                                            type="password"
                                            value={wpPassword}
                                            onChange={(e) => setWpPassword(e.target.value)}
                                            placeholder="App Password"
                                            className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleUploadToWordPress(selectedArticle)}
                                        disabled={isUploading || !wpUrl || !wpUsername || !wpPassword}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} />
                                                Upload to WordPress
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-96 text-gray-400">
                                <div className="text-center">
                                    <Eye size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Select an article to preview</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BlogPage;
