import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Save, ArrowLeft, Calendar, FileText, Image as ImageIcon, Bell } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const BlogEditorPage = () => {
    const { id } = useParams(); // If present, we are editing
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);

    const ADMIN_ID = '0d396440-7d07-407c-89da-9cb93e353347';
    const postType = searchParams.get('type'); // 'client' or 'company' (default)

    const [isCompanyBlog, setIsCompanyBlog] = useState(false);

    useEffect(() => {
        if (user?.id === ADMIN_ID) {
            // If type is explicitly client, set false. Otherwise default to true for admin.
            setIsCompanyBlog(postType !== 'client');
        }
    }, [user, postType]);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        seo_title: '',
        seo_description: '',
        content: '', // HTML content
        publish_date: '',
        is_published: false,
        keywords: '',
        notification_settings: {
            send: false,
            title: '',
            body: ''
        }
        // TODO: Notification settings could be handled here if we supported it in backend schema
    });

    useEffect(() => {
        if (id && token) {
            fetchPost(id);
        }
    }, [id, token]);

    const fetchPost = async (postId) => {
        try {
            let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/blogs/${postId}`;
            // If admin and explicitly asking for client post (based on URL from manager)
            // Or just try to match the state.
            // Actually, if we are editing, we rely on the URL param passed from manager
            if (user?.id === ADMIN_ID && postType === 'client') {
                url += `?target_table=articles`;
            } else if (user?.id === ADMIN_ID) {
                url += `?target_table=company_articles`;
            }

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const post = res.data.post;
                setFormData({
                    title: post.topic || '',
                    slug: post.slug || '',
                    seo_title: post.seo_title || '',
                    seo_description: post.seo_description || '',
                    content: post.content || '',
                    publish_date: post.publish_date ? post.publish_date.slice(0, 16) : '', // format for datetime-local
                    is_published: post.is_published,
                    keywords: post.keywords || '',
                    notification_settings: post.notification_settings || { send: false, title: '', body: '' }
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch post');
            navigate('/blogs-manager');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('notify_')) {
            const field = name.replace('notify_', '');
            setFormData(prev => ({
                ...prev,
                notification_settings: {
                    ...prev.notification_settings,
                    [field]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { ...formData };
            // Ensure publish_date is ISO
            if (payload.publish_date) {
                payload.publish_date = new Date(payload.publish_date).toISOString();
            } else {
                payload.publish_date = null;
            }

            // Admin Logic for Target Table
            if (user?.id === ADMIN_ID) {
                payload.target_table = isCompanyBlog ? 'company_articles' : 'articles';
                payload.is_company_blog = isCompanyBlog;
            }

            if (id) {
                await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/blogs/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Post updated');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/blogs`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Post created');
            }
            navigate('/blogs-manager');

        } catch (error) {
            console.error(error);
            toast.error('Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/blogs-manager" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {id ? 'Edit Post' : 'Create New Post'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-semibold text-lg"
                                        placeholder="Enter post title"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                            placeholder="my-post-slug"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords</label>
                                        <input
                                            type="text"
                                            name="keywords"
                                            value={formData.keywords}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                            placeholder="Comma, separated"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (HTML)</label>
                                    <textarea
                                        name="content"
                                        rows="20"
                                        value={formData.content}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono text-sm"
                                        placeholder="<p>Write your content here...</p>"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                SEO Metadata
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Title</label>
                                    <input
                                        type="text"
                                        name="seo_title"
                                        value={formData.seo_title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label>
                                    <textarea
                                        name="seo_description"
                                        rows="3"
                                        value={formData.seo_description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Admin Options */}
                        {user?.id === ADMIN_ID && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
                                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                    🏢 Admin Settings
                                </h2>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_company_blog"
                                        checked={isCompanyBlog}
                                        onChange={(e) => setIsCompanyBlog(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_company_blog" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Post as Company Blog
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {isCompanyBlog
                                        ? "This post will appear on the public main blog."
                                        : "This post will be saved to your personal (client) articles."}
                                </p>
                            </div>
                        )}

                        {/* Status & Schedule */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <Save className="w-5 h-5" />
                                Publish
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_published"
                                        name="is_published"
                                        checked={formData.is_published}
                                        onChange={handleChange}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Published
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule Date</label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                                        <input
                                            type="datetime-local"
                                            name="publish_date"
                                            value={formData.publish_date}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-2"
                                >
                                    {loading ? 'Saving...' : 'Save Post'}
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Push Notification
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="notify_send"
                                        name="notify_send"
                                        checked={formData.notification_settings.send}
                                        onChange={handleChange}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="notify_send" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Send Notification on Publish
                                    </label>
                                </div>
                                {formData.notification_settings.send && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Notification Title</label>
                                            <input
                                                type="text"
                                                name="notify_title"
                                                value={formData.notification_settings.title}
                                                onChange={handleChange}
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                                placeholder="Defaults to Post Title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Notification Body</label>
                                            <textarea
                                                name="notify_body"
                                                rows="2"
                                                value={formData.notification_settings.body}
                                                onChange={handleChange}
                                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                                                placeholder="Defaults to excerpt"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogEditorPage;
