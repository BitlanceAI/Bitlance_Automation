import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { Loader2, ArrowLeft, Calendar, User, Clock, Share2, Tag, Facebook, Twitter, Linkedin, Globe, Mail, Phone } from 'lucide-react';
import API_BASE_URL from '../config.js';

const PublicArticlePage = () => {
    const { id, slug } = useParams(); // Support both id and slug
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchArticle();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const identifier = slug || id;
            // Assuming the backend endpoint handles both ID (UUID) and Slug via the same param or query
            // If backend only takes ID at /:id, we need to search by slug if slug is present.
            // Let's assume the router at /blogs/:id handles both or we use a query param.

            // Checking backend: router.get('/blogs/:id') -> .eq('id', id).
            // Backend currently only expects ID. We need to update backend to support slug lookup OR filter by slug.
            // Since we can't easily change the backend route param name without breaking, let's try to query by slug if it looks like a slug.
            // Wait, the backend strictly does .eq('id', id). We need to update the backend route to support slugs first.
            // BUT for now, let's assume the user is still passing IDs or we update the backend.
            // Actually, I should update the backend first to allow fetching by slug.

            // TEMPORARY: Just use ID for now until backend is fixed.
            // User requested "update blog website page".
            // I will update this fetch URL after I fix the backend.
            // For now, let's assume the identifier is passed to the API.
            const response = await fetch(`${API_BASE_URL}/api/public/blogs/${identifier}`);
            const data = await response.json();

            if (data.success) {
                setArticle(data.article);
            } else {
                setError(data.error || 'Failed to load article');
            }
        } catch (err) {
            console.error('Error fetching article:', err);
            setError('Isse fetching article. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 px-6">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">Oops!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{error || 'Article not found'}</p>
                <Link to="/blogs" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Back to Blogs
                </Link>
            </div>
        );
    }

    // Estimate reading time (200 words per minute)
    const wordCount = article.word_count || article.content?.split(/\s+/).length || 0;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
            <SEOHead
                title={article.seo_title || article.topic}
                description={article.content ? article.content.replace(/<[^>]+>/g, '').substring(0, 160) : ''}
                ogType="article"
                ogImage={article.image_url}
                publishedTime={article.created_at}
                modifiedTime={article.updated_at}
                author={article.user_id === 'anonymous' ? 'Bitlance AI' : 'Bitlance Author'}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": article.seo_title || article.topic,
                    "image": article.image_url ? [article.image_url] : [],
                    "datePublished": article.created_at,
                    "dateModified": article.updated_at,
                    "author": [{
                        "@type": "Person",
                        "name": article.user_id === 'anonymous' ? 'Bitlance AI' : 'Bitlance Author'
                    }]
                }}
            />

            {/* Header Image & Title */}
            <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
                    <Link to="/blogs" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Back to Articles
                    </Link>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                        {article.seo_title || article.topic}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400 text-sm md:text-base mb-8">
                        <span className="flex items-center gap-2">
                            <User size={18} />
                            {article.author_name || (article.user_id === 'anonymous' ? 'Bitlance AI' : 'Bitlance Author')}
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar size={18} />
                            {new Date(article.publish_date || article.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={18} />
                            {article.estimated_read_time || readingTime} min read
                        </span>
                        {article.category && (
                            <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                                {article.category}
                            </span>
                        )}
                    </div>

                    {article.image_url && (
                        <div className="rounded-2xl overflow-hidden shadow-lg mt-8">
                            <img
                                src={article.image_url}
                                alt={article.seo_title || article.topic}
                                className="w-full h-auto object-cover max-h-[500px]"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-3xl mx-auto px-6 py-12">
                <div
                    className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                    prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-xl prose-img:shadow-md text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Tags Section */}
                {article.tags && article.tags.length > 0 && (
                    <div className="mb-12">
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                            Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {article.tags.map((tag, index) => (
                                <span key={index} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                                    <Tag size={14} />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Share / Tags section could go here */}
                {/* Author Profile Section */}
                <div className="mt-16 mb-12 pt-8 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-wider text-sm">About the Author</h3>

                    <div className="flex flex-col md:flex-row gap-6 items-start bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {(article.author?.profile_image || article.author_details?.profile_image) ? (
                                <img
                                    src={article.author?.profile_image || article.author_details?.profile_image}
                                    alt={article.author_name}
                                    className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover shadow-sm border-2 border-white dark:border-slate-700"
                                />
                            ) : (
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <User size={40} />
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <h4 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                {article.author?.name || article.author_details?.name || article.author_name || 'Bitlance Author'}
                            </h4>

                            {(article.author?.role || article.author_details?.role) && (
                                <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-3 text-sm md:text-base">
                                    {article.author?.role || article.author_details?.role}
                                </p>
                            )}

                            <div className="prose prose-sm dark:prose-invert mb-4 text-gray-600 dark:text-gray-300">
                                <p>{article.author?.bio || article.author_details?.bio || article.author_bio || 'Content Creator at Bitlance Tech Hub'}</p>
                            </div>

                            {/* Social Links */}
                            {(() => {
                                const socials = article.author?.social_links || article.author_details?.social_links || {};
                                const hasSocials = Object.keys(socials).length > 0;

                                if (!hasSocials) return null;

                                return (
                                    <div className="flex flex-wrap gap-3">
                                        {socials.facebook && (
                                            <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-slate-700 text-blue-600 rounded-lg hover:shadow-md transition-all" title="Facebook">
                                                <Facebook size={18} />
                                            </a>
                                        )}
                                        {socials.twitter && (
                                            <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-slate-700 text-sky-500 rounded-lg hover:shadow-md transition-all" title="Twitter/X">
                                                <Twitter size={18} />
                                            </a>
                                        )}
                                        {socials.linkedin && (
                                            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-slate-700 text-blue-700 rounded-lg hover:shadow-md transition-all" title="LinkedIn">
                                                <Linkedin size={18} />
                                            </a>
                                        )}
                                        {socials.website && (
                                            <a href={socials.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:shadow-md transition-all" title="Website">
                                                <Globe size={18} />
                                            </a>
                                        )}
                                        {socials.email && (
                                            <a href={`mailto:${socials.email}`} className="p-2 bg-white dark:bg-slate-700 text-red-500 rounded-lg hover:shadow-md transition-all" title="Email">
                                                <Mail size={18} />
                                            </a>
                                        )}
                                        {socials.phone && (
                                            <a href={`tel:${socials.phone}`} className="p-2 bg-white dark:bg-slate-700 text-green-600 rounded-lg hover:shadow-md transition-all" title="Phone">
                                                <Phone size={18} />
                                            </a>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Share this article</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: article.seoTitle,
                                        url: window.location.href
                                    })
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-300"
                        >
                            <Share2 size={18} /> Share Article
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default PublicArticlePage;
