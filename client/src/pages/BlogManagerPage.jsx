import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Plus, Edit3, Trash2, Eye, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const BlogManagerPage = () => {
    const { token, user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('company'); // 'company' or 'client'

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
            let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/blogs`;
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
                // Some backends might expect body for delete, but usually query is safer for DELETE method issues in some clients
                // But wait, axios delete accepts params in config.
            }

            // Note: Our backend deletePost extracts from req, so query params work if using getTableName(req)
            // But let's check backend implementation. deletePost uses getTableName(req).
            // req.query is checked in getTableName. So passing as query param works.

            let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/blogs/${id}`;
            // Append query manually or use params config
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
                                                        to={`/blogs/${post.id}`} // This might need update if public route differs, but usually slug based
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
            </div>
        </div>
    );
};

export default BlogManagerPage;
