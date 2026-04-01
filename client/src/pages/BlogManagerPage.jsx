import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { Plus, Edit3, Trash2, Eye, Calendar, Bell, Send, X, Upload, ExternalLink, CheckCircle, AlertCircle, ChevronRight, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config.js';

const BlogManagerPage = () => {
    const { token, user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('company'); // 'company' or 'client'
    const [sendingNotifId, setSendingNotifId] = useState(null);
    const [notifModal, setNotifModal] = useState(null); // { post, title, body }
    const [wpModal, setWpModal] = useState(null);       // { post }
    const [wpUploading, setWpUploading] = useState(false);
    const [wpResult, setWpResult] = useState(null);     // { success, link, editLink, error }

    // WP profile states
    const [wpProfiles, setWpProfiles] = useState([]);
    const [wpProfilesLoading, setWpProfilesLoading] = useState(false);
    const [wpSelectedProfileId, setWpSelectedProfileId] = useState(null);
    const [wpModalView, setWpModalView] = useState('select'); // 'select' | 'add'
    const [wpNewProfile, setWpNewProfile] = useState({ name: '', url: '', username: '', password: '' });
    const [wpSavingProfile, setWpSavingProfile] = useState(false);

    const ADMIN_ID = '0d396440-7d07-407c-89da-9cb93e353347';
    const isAdmin = user?.id === ADMIN_ID;

    // Default to client tab for non-admins (though they only have one view)
    useEffect(() => {
        if (user && !isAdmin) {
            setActiveTab('client');
        }
    }, [user, isAdmin]);

    const fetchPosts = async () => {
        if (!token) return;
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/api/blog/posts`;
            const params = {};

            if (isAdmin) {
                if (activeTab === 'client') {
                    params.target_table = 'articles';
                } else {
                    params.target_table = 'company_articles';
                }
            }

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            if (res.data.success) {
                setPosts(res.data.posts);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [activeTab, token, isAdmin]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            const params = {};
            if (isAdmin) {
                params.target_table = activeTab === 'client' ? 'articles' : 'company_articles';
            }

            let url = `${API_BASE_URL}/api/blog/posts/${id}`;
            if (isAdmin && activeTab === 'client') {
                url += `?target_table=articles`;
            } else if (isAdmin) {
                url += `?target_table=company_articles`;
            }

            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Post deleted');
            fetchPosts();
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const openNotifModal = (post) => {
        setNotifModal({
            post,
            title: `New Post: ${post.topic || post.seo_title || 'Fresh Content'}`,
            body: post.seo_description || 'Check out our latest update!'
        });
    };

    const handleSendNotification = async () => {
        if (!notifModal) return;
        const { post, title, body } = notifModal;
        setSendingNotifId(post.id);
        try {
            await axios.post(
                `${API_BASE_URL}/api/push/send`,
                {
                    title,
                    body,
                    target: 'all',
                    image: post.featured_image || null,
                    data: {
                        slug: post.slug,
                        topic: 'blog_updates',
                        url: `https://www.bitlancetechhub.com/blogs/${post.slug}`
                    }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Push notification sent!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to send notification');
        } finally {
            setSendingNotifId(null);
            setNotifModal(null);
        }
    };

    const openWpModal = async (post) => {
        setWpModal({ post });
        setWpResult(null);
        setWpSelectedProfileId(null);
        setWpNewProfile({ name: '', url: '', username: '', password: '' });
        setWpProfilesLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/wordpress/profiles`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const profiles = res.data.profiles || [];
            setWpProfiles(profiles);
            if (profiles.length === 0) {
                setWpModalView('add');
            } else {
                setWpModalView('select');
                if (profiles.length === 1) setWpSelectedProfileId(profiles[0].id);
            }
        } catch {
            setWpProfiles([]);
            setWpModalView('add');
        } finally {
            setWpProfilesLoading(false);
        }
    };

    const closeWpModal = () => {
        setWpModal(null);
        setWpResult(null);
        setWpSelectedProfileId(null);
    };

    const handleSaveWpProfile = async () => {
        const { name, url, username, password } = wpNewProfile;
        if (!name || !url || !username || !password) {
            toast.error('All fields are required');
            return;
        }
        setWpSavingProfile(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/wordpress/profiles`,
                { name, wp_url: url, wp_username: username, wp_app_password: password },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                const newProfile = res.data.profile;
                setWpProfiles(prev => [...prev, newProfile]);
                setWpSelectedProfileId(newProfile.id);
                setWpModalView('select');
                toast.success('WordPress site saved!');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save profile');
        } finally {
            setWpSavingProfile(false);
        }
    };

    const handleDeleteWpProfile = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/wordpress/profiles/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updated = wpProfiles.filter(p => p.id !== id);
            setWpProfiles(updated);
            if (wpSelectedProfileId === id) setWpSelectedProfileId(null);
            if (updated.length === 0) setWpModalView('add');
            toast.success('Profile removed');
        } catch {
            toast.error('Failed to remove profile');
        }
    };

    const handleWpUpload = async () => {
        if (!wpModal || !wpSelectedProfileId) return;
        const { post } = wpModal;
        setWpUploading(true);
        setWpResult(null);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/wordpress/upload`,
                {
                    title: post.seo_title || post.topic || 'Untitled',
                    content: post.content || '',
                    imageUrl: post.featured_image || null,
                    profileId: wpSelectedProfileId,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setWpResult({ success: true, link: res.data.link, editLink: res.data.editLink });
                toast.success('Published to WordPress!');
            } else {
                setWpResult({ success: false, error: res.data.error });
            }
        } catch (err) {
            const errMsg = err.response?.data?.error || err.message;
            setWpResult({ success: false, error: errMsg });
            toast.error('WordPress upload failed');
        } finally {
            setWpUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blog Posts</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage and schedule your content</p>
                    </div>
                    <Link
                        to="/blog/new"
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Post
                    </Link>
                </div>

                {isAdmin && (
                    <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-8 w-fit dark:bg-slate-800">
                        <button
                            onClick={() => setActiveTab('company')}
                            className={`w-40 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                                ${activeTab === 'company'
                                    ? 'bg-white text-indigo-700 shadow dark:bg-slate-600 dark:text-white'
                                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            Company Blogs
                        </button>
                        <button
                            onClick={() => setActiveTab('client')}
                            className={`w-40 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                                ${activeTab === 'client'
                                    ? 'bg-white text-indigo-700 shadow dark:bg-slate-600 dark:text-white'
                                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-indigo-600 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            Client Articles
                        </button>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title & Slug</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {posts.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                            No posts found. Create your first blog post!
                                        </td>
                                    </tr>
                                ) : (
                                    posts.map((post) => (
                                        <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">{post.topic || post.seo_title}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">/{post.slug}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.is_published
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                    }`}>
                                                    {post.is_published ? 'Published' : 'Draft/Scheduled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(post.publish_date || post.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/blogs/${post.id}`}
                                                        target="_blank"
                                                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        to={`/blog/edit/${post.id}?type=${isAdmin && activeTab === 'client' ? 'client' : 'company'}`}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => openNotifModal(post)}
                                                        disabled={sendingNotifId === post.id}
                                                        className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50"
                                                        title="Send Push Notification"
                                                    >
                                                        <Bell className={`w-4 h-4 ${sendingNotifId === post.id ? 'animate-pulse' : ''}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => openWpModal(post)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                        title="Upload to WordPress"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Push Notification Modal */}
                {notifModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-amber-500" />
                                    Send Push Notification
                                </h3>
                                <button onClick={() => setNotifModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notification Title</label>
                                    <input
                                        type="text"
                                        value={notifModal.title}
                                        onChange={(e) => setNotifModal(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notification Body</label>
                                    <textarea
                                        rows="3"
                                        value={notifModal.body}
                                        onChange={(e) => setNotifModal(prev => ({ ...prev, body: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setNotifModal(null)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendNotification}
                                        disabled={sendingNotifId}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                    >
                                        <Send className="w-4 h-4" />
                                        {sendingNotifId ? 'Sending...' : 'Send Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* WordPress Upload Modal */}
            {wpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-blue-500" />
                                {wpResult ? (wpResult.success ? 'Upload Complete' : 'Upload Failed') : wpModalView === 'add' ? 'Connect WordPress' : 'Upload to WordPress'}
                            </h3>
                            <button onClick={closeWpModal} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Loading profiles */}
                        {!wpResult && wpProfilesLoading && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                            </div>
                        )}

                        {/* Add new profile form */}
                        {!wpResult && !wpProfilesLoading && wpModalView === 'add' && (
                            <div className="space-y-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Enter your WordPress site details. The app password is stored encrypted.
                                </p>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. My Blog"
                                        value={wpNewProfile.name}
                                        onChange={e => setWpNewProfile(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">WordPress URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://yoursite.com"
                                        value={wpNewProfile.url}
                                        onChange={e => setWpNewProfile(p => ({ ...p, url: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                    <input
                                        type="text"
                                        placeholder="WordPress username"
                                        value={wpNewProfile.username}
                                        onChange={e => setWpNewProfile(p => ({ ...p, username: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">App Password</label>
                                    <input
                                        type="password"
                                        placeholder="xxxx xxxx xxxx xxxx"
                                        value={wpNewProfile.password}
                                        onChange={e => setWpNewProfile(p => ({ ...p, password: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Generate in WP Admin → Users → Profile → Application Passwords</p>
                                </div>
                                <div className="flex gap-3 pt-1">
                                    {wpProfiles.length > 0 && (
                                        <button
                                            onClick={() => setWpModalView('select')}
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        onClick={() => closeWpModal()}
                                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveWpProfile}
                                        disabled={wpSavingProfile}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                                    >
                                        {wpSavingProfile ? (
                                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Saving...</>
                                        ) : (
                                            <><CheckCircle className="w-4 h-4" /> Save & Connect</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Select profile view */}
                        {!wpResult && !wpProfilesLoading && wpModalView === 'select' && wpProfiles.length === 0 && (
                            <div className="text-center py-6 space-y-3">
                                <Globe className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No WordPress sites connected yet.</p>
                                <button
                                    onClick={() => setWpModalView('add')}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                                >
                                    + Connect WordPress Site
                                </button>
                            </div>
                        )}

                        {/* Select profile view — has profiles */}
                        {!wpResult && !wpProfilesLoading && wpModalView === 'select' && wpProfiles.length > 0 && (
                            <div className="space-y-4">
                                {/* Post title */}
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 line-clamp-2">
                                    {wpModal.post.seo_title || wpModal.post.topic || 'Untitled'}
                                </p>

                                {/* Profile list */}
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Select Site</p>
                                    {wpProfiles.map(profile => (
                                        <button
                                            key={profile.id}
                                            onClick={() => setWpSelectedProfileId(profile.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors group ${
                                                wpSelectedProfileId === profile.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                wpSelectedProfileId === profile.id ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-slate-700'
                                            }`}>
                                                <Globe className={`w-4 h-4 ${wpSelectedProfileId === profile.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile.wp_url}</p>
                                            </div>
                                            {wpSelectedProfileId === profile.id && (
                                                <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                            )}
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDeleteWpProfile(profile.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-gray-400 transition-opacity ml-1"
                                                title="Remove"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => { setWpModalView('add'); setWpNewProfile({ name: '', url: '', username: '', password: '' }); }}
                                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add another site
                                </button>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={closeWpModal}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleWpUpload}
                                        disabled={wpUploading || !wpSelectedProfileId}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                                    >
                                        {wpUploading ? (
                                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Uploading...</>
                                        ) : (
                                            <><Upload className="w-4 h-4" /> Publish to WordPress</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Success */}
                        {wpResult?.success && (
                            <>
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Published to WordPress!</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Your article is now live on WordPress.</p>
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <a
                                        href={wpResult.editLink || wpResult.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Open in WP Admin
                                    </a>
                                    <button
                                        onClick={closeWpModal}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Error */}
                        {wpResult && !wpResult.success && (
                            <>
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Upload Failed</p>
                                    <p className="text-xs text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 border border-red-200 dark:border-red-700">
                                        {wpResult.error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setWpResult(null)}
                                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Try Again
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManagerPage;
