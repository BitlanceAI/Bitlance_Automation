import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Eye, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config.js';

const BlogManagerPanel = () => {
    const { token } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        if (!token) return; // Wait until auth token is available
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/blog/posts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setPosts(res.data.posts);
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white font-['Space_Grotesk'] uppercase tracking-tight">Blog Posts</h2>
                    <p className="mt-1 text-gray-400 font-sans">Manage and schedule your content</p>
                </div>
                <Link to="/blog/new"
                    className="flex items-center gap-2 bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] tracking-widest uppercase py-3 px-6 rounded-[2px] transition-all hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333] text-[12px]">
                    <Plus size={16} /> Create New Post
                </Link>
            </div>

            <div className="bg-[#111111] rounded-[2px] border border-[#1E1E1E] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#070707] border-b border-[#1E1E1E]">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">Title & Slug</th>
                                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E1E1E]">
                            {posts.length === 0 && !loading ? (
                                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-500 font-mono text-[12px] uppercase">No posts found. Create your first blog post!</td></tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-[#1A1A1A] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white font-['Space_Grotesk'] line-clamp-1">{post.topic || post.seo_title}</span>
                                                <span className="text-[12px] text-[#26cece] font-mono">/{post.slug}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-[2px] text-[10px] uppercase font-mono tracking-widest border ${post.is_published ? 'bg-[#070707] border-[#26cece] text-[#26cece]' : 'bg-[#070707] border-gray-500 text-gray-400'}`}>
                                                {post.is_published ? 'Published' : 'Draft/Scheduled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[12px] font-mono text-gray-400">
                                                <Calendar size={14} />
                                                {new Date(post.publish_date || post.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link to={`/blogs/${post.id}`} target="_blank" className="p-2 text-gray-400 hover:text-[#26cece] rounded-[2px] hover:bg-[#070707] transition-colors border border-transparent hover:border-[#333]">
                                                    <Eye size={16} />
                                                </Link>
                                                <Link to={`/blog/edit/${post.id}`} className="p-2 text-gray-400 hover:text-white rounded-[2px] hover:bg-[#070707] transition-colors border border-transparent hover:border-[#333]">
                                                    <Edit3 size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-rose-500 rounded-[2px] hover:bg-[rgba(244,63,94,0.1)] transition-colors border border-transparent hover:border-[rgba(244,63,94,0.3)]">
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
