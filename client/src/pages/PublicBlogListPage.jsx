import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BlogCard from '../components/blog/BlogCard';
import SEOHead from '../components/layout/SEOHead';
import { Search, Loader2 } from 'lucide-react';
import API_BASE_URL from '../config.js';

const PublicBlogListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Get page from URL or default to 1
    const currentPage = parseInt(searchParams.get('page') || '1');

    useEffect(() => {
        fetchArticles(currentPage);
        // Scroll to top on page change
        window.scrollTo(0, 0);
    }, [currentPage]);

    const fetchArticles = async (page) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/public/blogs?page=${page}&limit=9&sort=created_at&order=desc`);
            const data = await response.json();

            if (data.success) {
                setArticles(data.articles);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
            <SEOHead
                title="Blog"
                description="Explore our latest articles on AI, automation, and technology. Stay updated with Bitlance insights."
                canonicalUrl={`${window.location.origin}/blogs`}
            />

            {/* Hero Section */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 py-16 px-6 mb-12">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        Our Latest Insights
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Discover articles on Artificial Intelligence, Automation trends, and how to scale your business with modern technology.
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-6">

                {/* Search/Filter (Placeholder for future) */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Recent Articles
                    </h2>
                    {/* Add search field here later */}
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-indigo-600" size={48} />
                    </div>
                ) : articles.length > 0 ? (
                    <>
                        {/* Articles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map(article => (
                                <BlogCard key={article.id} article={article} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center mt-12 gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Previous
                            </button>

                            <span className="flex items-center px-4 font-medium text-gray-600 dark:text-gray-300">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Articles Yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Check back soon for new content!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicBlogListPage;
