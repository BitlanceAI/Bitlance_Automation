import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import blogService from '../../services/blogService';
import API_BASE_URL from '../../config.js';

const BlogManagerPanel = ({ optimizationMode = 'GEO' }) => {
    const { token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        if (!token) return; // Wait until auth token is available
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/blog/posts?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fetchedPosts = response.data.posts || [];
            
            const transformed = fetchedPosts.map(a => ({
                id: a.id,
                topic: a.topic,
                seo_title: a.seo_title,
                content: a.content,
                image_url: a.image_url,
                optimization_mode: a.optimization_mode,
                created_at: a.created_at,
                publish_date: a.publish_date,
                slug: a.slug,
                is_published: a.is_published,
                status: 'published'
            }));
            setPosts(transformed);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, [token]); // Re-run when token becomes available

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/blog/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Post deleted');
            fetchPosts();
        } catch (error) { toast.error('Failed to delete post'); }
    };

    const isTargetMode = (post, targetMode) => {
        if (post.optimization_mode === 'SEO' || post.optimization_mode === 'GEO') {
            return post.optimization_mode === targetMode;
        }
        // Legacy posts fallback: GEO has FAQ, SEO does not
        const contentStr = (post.content || '').toLowerCase();
        const hasFaq = contentStr.includes('faq') || contentStr.includes('frequently asked questions');
        
        if (targetMode === 'GEO') return hasFaq;
        return !hasFaq;
    };

    const filteredPosts = posts.filter(post => isTargetMode(post, optimizationMode));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-['Space_Grotesk'] uppercase tracking-tight">Blog Posts</h2>
                    <p className="mt-1 text-slate-500 font-sans text-sm">Manage and schedule your content</p>
                </div>
                <Link to="/blogs/new"
                    className="flex items-center gap-2 bg-[#26cece] text-white font-bold font-['Space_Grotesk'] tracking-widest uppercase py-3 px-6 rounded-[2px] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333] text-[12px]">
                    <Plus size={16} /> Create New Post
                </Link>
            </div>

            <div className="bg-white rounded-[2px] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-slate-500 uppercase">Title & Slug</th>
                                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPosts.length === 0 && !loading ? (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-mono text-[12px] uppercase">No posts found.</td></tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 font-['Space_Grotesk'] line-clamp-1">{post.topic || post.seo_title}</span>
                                                    <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-[2px] ${(post.optimization_mode || 'GEO') === 'SEO' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                                                        {post.optimization_mode || 'GEO'}
                                                    </span>
                                                </div>
                                                <span className="text-[12px] text-[#26cece] font-mono">/{post.slug}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-[2px] text-[10px] uppercase font-mono tracking-widest border ${post.is_published ? 'bg-slate-50 border-[#26cece] text-[#26cece]' : 'bg-slate-50 border-slate-300 text-slate-400'}`}>
                                                {post.is_published ? 'Published' : 'Draft/Scheduled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[12px] font-mono text-slate-500">
                                                <Calendar size={14} />
                                                {new Date(post.publish_date || post.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/blogs/${post.slug || post.id}`} target="_blank" className="p-2 text-slate-400 hover:text-[#26cece] rounded-[2px] hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                                                    <Eye size={16} />
                                                </Link>
                                                <Link to={`/blogs/edit/${post.id}`} className="p-2 text-slate-400 hover:text-slate-900 rounded-[2px] hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                                                    <Edit3 size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-400 hover:text-rose-500 rounded-[2px] hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100">
                                                    <Trash2 size={16} />
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
    );
};

export default BlogManagerPanel;

