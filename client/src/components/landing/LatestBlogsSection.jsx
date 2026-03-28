import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import BlogCard from '../blog/BlogCard';
import API_BASE_URL from '../../config';

const TEAL = '#26CECE';

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
        <section className="py-24 bg-[#070707] border-t border-[#1E1E1E] relative z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-left">
                    <div className="max-w-xl">
                        <h2 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 uppercase">
                            Latest from our Blog
                        </h2>
                        <p className="text-lg text-white/60 mb-2 leading-relaxed">
                            Discover actionable insights, case studies, and modern strategies to scale your business with AI.
                        </p>
                    </div>

                    <Link
                        to="/blogs"
                        className="hidden md:inline-flex items-center gap-2 font-bold transition-all hover:scale-105 active:scale-95 group"
                        style={{ color: TEAL }}
                    >
                        View all articles
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                        to="/blogs"
                        className="inline-flex items-center justify-center gap-3 w-full px-6 py-4 transition-all hover:bg-[#1A1A1A] group"
                        style={{
                            background: '#111111',
                            color: TEAL,
                            border: '1px solid #1E1E1E',
                            borderRadius: 2,
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        View all articles
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LatestBlogsSection;
