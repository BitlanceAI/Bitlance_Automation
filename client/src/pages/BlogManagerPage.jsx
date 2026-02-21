import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Plus, Edit3, Trash2, Eye, Calendar, FileText, Bell, Send, X } from 'lucide-react';
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
                `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/push/send`,
                {
                    title,
                    body,
                    target: 'all',
                    image: post.featured_image || null,
                    data: {
                        slug: post.slug,
                        topic: 'blog_updates',
                        url: `/blogs/${post.slug}`
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
        </div>
    );
};

export default BlogManagerPage;
