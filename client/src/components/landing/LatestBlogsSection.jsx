import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import BlogCard from '../blog/BlogCard';
import API_BASE_URL from '../../config';

const LatestBlogsSection = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestBlogs = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/public/blogs?page=1&limit=3&sort=created_at&order=desc`);
                const data = await response.json();

                if (data.success && data.articles) {
                    setArticles(data.articles);
                }
            } catch (error) {
                console.error('Error fetching latest blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestBlogs();
    }, []);

    if (!loading && articles.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-[#030303] border-t border-white/5 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-left">
                    <div className="max-w-xl">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                            Latest from our Blog
                        </h2>
                        <p className="text-lg text-white/40 font-medium leading-relaxed">
                            Discover actionable insights, case studies, and modern strategies to scale your business with AI.
                        </p>
                    </div>

                    <Link
                        to="/blog"
                        className="hidden md:inline-flex items-center gap-2 text-white/60 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors group"
                    >
                        View all articles
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-white/20" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map(article => (
                            <BlogCard key={article.id} article={article} />
                        ))}
                    </div>
                )}

                <div className="mt-12 md:hidden">
                    <Link
                        to="/blog"
                        className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full border border-white/10 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                        View all articles
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LatestBlogsSection;
