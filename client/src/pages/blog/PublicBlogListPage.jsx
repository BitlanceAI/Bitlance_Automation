import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BlogCard from '../../components/blog/BlogCard';
import SEOHead from '../../components/layout/SEOHead';
import { Search, Loader2 } from 'lucide-react';
import API_BASE_URL from '../../config.js';

const TEAL = '#26CECE';

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
        <div className="min-h-screen bg-[#070707] pb-20">
            <SEOHead
                title="AI & Automation Blog — Expert Insights by Bitlance Tech Hub"
                description="Expert guides on AI voice agents, automated SEO content, and business automation. Learn how companies use AI to scale lead generation, reduce costs, and automate repetitive workflows."
                canonicalUrl={`${window.location.origin}/blog`}
                keywords="AI automation blog, AI voice agent guide, SEO automation, business AI tools, AI agent tutorials"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "Blog",
                    "name": "Bitlance Tech Hub Blog",
                    "description": "Expert articles on AI voice agents, automated SEO content generation, and AI-driven business automation from the Bitlance Tech Hub team.",
                    "url": `${window.location.origin}/blog`,
                    "publisher": {
                        "@type": "Organization",
                        "name": "Bitlance Tech Hub",
                        "url": "https://www.bitlancetechhub.com",
                        "logo": { "@type": "ImageObject", "url": "https://www.bitlancetechhub.com/favicon.png" }
                    }
                }}
            />

            {/* Hero Section */}
            <div className="bg-[#070707] border-b border-[#1E1E1E] py-16 md:py-24 px-6 mb-12 relative z-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white tracking-tight uppercase">
                        AI &amp; Automation <span style={{ color: TEAL }}>Blog</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                        Expert guides on AI voice agents, automated SEO content, and business automation — written by the Bitlance Tech Hub team to help you scale smarter.
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>

                {/* Search/Filter (Placeholder for future) */}
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">
                        Recent Articles
                    </h2>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-white/20" size={48} />
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
                        <div className="flex justify-center items-center mt-16 gap-4" style={{ fontFamily: "'DM Mono', monospace" }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                className="px-6 py-3 uppercase tracking-widest font-bold text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1A1A1A]"
                                style={{
                                    background: '#111111',
                                    color: TEAL,
                                    border: '1px solid #1E1E1E'
                                }}
                            >
                                Previous
                            </button>

                            <span className="flex items-center px-4 font-bold text-white/40 tracking-widest uppercase text-xs">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className="px-6 py-3 uppercase tracking-widest font-bold text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1A1A1A]"
                                style={{
                                    background: '#111111',
                                    color: TEAL,
                                    border: '1px solid #1E1E1E'
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="text-center py-24 bg-[#111111] border border-[#1E1E1E]">
                        <div className="text-6xl mb-6 opacity-50">/&gt;</div>
                        <h3 className="text-2xl font-extrabold text-white mb-2 uppercase tracking-tight">No Articles Yet</h3>
                        <p className="text-white/40 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                            CHECK BACK SOON FOR NEW CONTENT
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicBlogListPage;
