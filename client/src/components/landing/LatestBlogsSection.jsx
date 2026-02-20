import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import BlogCard from '../BlogCard';
import API_BASE_URL from '../../config';

const LatestBlogsSection = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestBlogs = async () => {
            try {
                setLoading(true);
                // Fetch only the top 3 latest blogs
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

    // If there's an error or no articles, don't show the section to avoid an empty block on the landing page
    if (!loading && articles.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                            Latest from our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Blog</span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Discover actionable insights, case studies, and modern strategies to scale your business with AI.
                        </p>
                    </div>

                    <Link
                        to="/blogs"
                        className="hidden md:inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold group"
                    >
                        View all articles
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map(article => (
                            <BlogCard key={article.id} article={article} />
                        ))}
                    </div>
                )}

                <div className="mt-10 md:hidden flex justify-center">
                    <Link
                        to="/blogs"
                        className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
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
