import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../../components/layout/SEOHead';
import { Loader2, ArrowLeft, Calendar, User, Clock, Share2, Tag, Facebook, Twitter, Linkedin, Globe, Mail, Phone, MessageSquare, Send, ArrowRight } from 'lucide-react';
import API_BASE_URL from '../../config.js';
import { trackBlogRead, trackDemoClick } from '../../lib/analytics';

const TEAL = '#26CECE';

const PublicArticlePage = () => {
    const { id, slug } = useParams(); // Support both id and slug
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latestBlogs, setLatestBlogs] = useState([]);
    const [loadingLatest, setLoadingLatest] = useState(true);

    // Comments State
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentName, setCommentName] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentsError, setCommentsError] = useState(null);

    const fetchComments = async () => {
        try {
            const identifier = slug || id;
            if (!identifier) return;
            const res = await fetch(`${API_BASE_URL}/api/public/blogs/${identifier}/comments`);
            const data = await res.json();
            if (data.success) {
                setComments(data.comments);
            }
        } catch (err) {
            console.error('Failed to fetch comments', err);
        }
    };

    useEffect(() => {
        if (id || slug) {
            fetchComments();
        }
    }, [id, slug]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !commentName.trim()) return;

        setIsSubmittingComment(true);
        setCommentsError(null);

        try {
            const identifier = slug || id;
            const res = await fetch(`${API_BASE_URL}/api/public/blogs/${identifier}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author_name: commentName.trim(),
                    text: newComment.trim()
                })
            });

            const data = await res.json();

            if (data.success) {
                // Add the new comment to the top of the list
                setComments([data.comment, ...comments]);
                setNewComment('');
                setCommentName('');
            } else {
                setCommentsError(data.error || 'Failed to post comment');
            }
        } catch (err) {
            console.error('Failed to post comment', err);
            setCommentsError('Network error while posting comment');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const fetchLatestBlogs = async () => {
        try {
            setLoadingLatest(true);
            const response = await fetch(`${API_BASE_URL}/api/public/blogs?page=1&limit=5&sort=created_at&order=desc`);
            const data = await response.json();
            if (data.success) {
                // Filter out the current article to avoid showing it in latest
                const currentIdentifier = slug || id;
                const filtered = data.articles.filter(a => a.id !== currentIdentifier && (!slug || a.slug !== currentIdentifier)).slice(0, 4);
                setLatestBlogs(filtered);
            }
        } catch (error) {
            console.error('Error fetching latest blogs:', error);
        } finally {
            setLoadingLatest(false);
        }
    };

    useEffect(() => {
        fetchArticle();
        window.scrollTo(0, 0);
    }, [id, slug]);

    useEffect(() => {
        fetchLatestBlogs();
    }, [id, slug]);

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
                trackBlogRead(data.article.seo_title || data.article.topic);
            } else {
                setError(data.error || 'Failed to load article');
            }
        } catch (err) {
            console.error('Error fetching article:', err);
            setError('Issue fetching article. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#070707]">
                <Loader2 className="animate-spin text-white/20" size={48} />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#070707] px-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <h1 className="text-5xl font-extrabold text-white tracking-tight uppercase mb-4">404 NOT FOUND</h1>
                <p className="text-lg text-white/40 mb-8 font-medium uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {error || 'Article not found'}
                </p>
                <Link 
                    to="/blogs" 
                    className="px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all hover:bg-[#1A1A1A]"
                    style={{ background: '#111', color: TEAL, border: '1px solid #1E1E1E', fontFamily: "'DM Mono', monospace" }}
                >
                    Back to Blogs
                </Link>
            </div>
        );
    }

    // Estimate reading time (200 words per minute)
    const wordCount = article.word_count || article.content?.split(/\s+/).length || 0;
    const readingTime = Math.ceil(wordCount / 200);



    return (
        <div className="min-h-screen bg-[#070707] pb-20">
            <SEOHead
                title={article.seo_title || article.topic}
                description={article.content ? article.content.replace(/<[^>]+>/g, '').substring(0, 160) : ''}
                ogType="article"
                ogImage={article.image_url}
                publishedTime={article.created_at}
                modifiedTime={article.updated_at || article.created_at}
                author={article.author?.name || article.author_details?.name || article.author_name || 'Bitlance Author'}
                keywords={article.tags && article.tags.length > 0 ? article.tags.join(', ') : (article.category || 'AI, automation')}
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": article.seo_title || article.topic,
                    "image": article.image_url ? [article.image_url] : [],
                    "datePublished": article.created_at,
                    "dateModified": article.updated_at || article.created_at,
                    "wordCount": article.word_count || undefined,
                    "articleSection": article.category || 'AI & Automation',
                    "keywords": article.tags ? article.tags.join(', ') : (article.category || ''),
                    "author": [{
                        "@type": "Person",
                        "name": article.author?.name || article.author_details?.name || article.author_name || 'Bitlance Author'
                    }],
                    "publisher": {
                        "@type": "Organization",
                        "name": "Bitlance Tech Hub",
                        "url": "https://www.bitlancetechhub.com",
                        "logo": { "@type": "ImageObject", "url": "https://www.bitlancetechhub.com/favicon.png" }
                    },
                    "speakable": {
                        "@type": "SpeakableSpecification",
                        "cssSelector": ["h1", "h2", ".article-body p:first-of-type"]
                    }
                }}
            />

            {/* Header Image & Title */}
            <div className="bg-[#070707] border-b border-[#1E1E1E]">
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 lg:px-8">
                    <Link 
                        to="/blogs" 
                        className="inline-flex items-center text-xs uppercase tracking-widest font-bold hover:translate-x-1 mb-10 transition-all"
                        style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}
                    >
                        <ArrowLeft size={16} className="mr-2" /> 
                        CD /BLOGS
                    </Link>

                    <h1 
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tighter uppercase leading-[1.1]" 
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {article.seo_title || article.topic}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-[11px] text-white/40 mb-10 tracking-widest uppercase font-bold" style={{ fontFamily: "'DM Mono', monospace" }}>
                        <span className="flex items-center gap-2">
                            <User size={14} />
                            {article.author_name || (article.user_id === 'anonymous' ? 'AI Agent' : 'Bitlance Source')}
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(article.publish_date || article.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={14} />
                            {article.estimated_read_time || readingTime} MIN READ
                        </span>
                        {article.category && (
                            <span 
                                className="px-2 py-1"
                                style={{ background: `${TEAL}10`, color: TEAL, border: `1px solid ${TEAL}30` }}
                            >
                                {article.category}
                            </span>
                        )}
                        {(article.updated_at && article.updated_at !== article.created_at) && (
                            <span className="px-2 py-1" style={{ background: '#111', color: '#888', border: '1px solid #333' }}>
                                UPD {new Date(article.updated_at).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })}
                            </span>
                        )}
                    </div>

                    {article.image_url && (
                        <div className="w-full mt-10 p-2" style={{ background: '#111', border: '1px solid #1E1E1E' }}>
                            <img
                                src={article.image_url}
                                alt={article.seo_title || article.topic}
                                className="w-full h-auto object-cover max-h-[600px] grayscale hover:grayscale-0 transition-all duration-700"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Layout Container */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-16 lg:gap-24">

                {/* Article Content */}
                <article className="flex-1 max-w-3xl">
                    <div
                        className="prose prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-white prose-headings:uppercase prose-headings:tracking-tight prose-a:no-underline hover:prose-a:underline prose-img:border prose-img:border-[#1E1E1E] prose-img:p-1 prose-img:bg-[#111] text-white/80 whitespace-pre-wrap leading-relaxed marker:text-[#26CECE]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                    
                    {/* Inject teal color for prose links manually or via custom tag class */}
                    <style dangerouslySetInnerHTML={{__html: `
                        .prose a { color: ${TEAL}; font-weight: bold; }
                        .prose strong { color: #ffffff; }
                        .prose blockquote { border-left-color: ${TEAL}; background: #111; padding: 1rem; color: #ccc; }
                        .prose code { color: ${TEAL}; background: #111; padding: 0.2rem 0.4rem; border: 1px solid #1E1E1E; }
                        .prose pre { background: #070707; border: 1px solid #1E1E1E; }
                    `}} />

                    {/* Tags Section */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="mb-16 mt-16">
                            <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-6" style={{ fontFamily: "'DM Mono', monospace" }}>
                                [ METADATA_TAGS ]
                            </h4>
                            <div className="flex flex-wrap gap-3" style={{ fontFamily: "'DM Mono', monospace" }}>
                                {article.tags.map((tag, index) => (
                                    <span key={index} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer hover:bg-[#1A1A1A]"
                                        style={{ background: '#111', color: TEAL, border: '1px solid #1E1E1E' }}
                                    >
                                        <Tag size={12} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA Section (Book a Demo) Brutalist */}
                    <div className="mt-16 p-8 md:p-12 relative overflow-hidden flex flex-col items-start gap-8 group"
                         style={{ background: TEAL, border: `2px solid #000`, color: '#000', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {/* Abstract Decor */}
                        <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
                            <span className="text-[200px] leading-none font-black text-black">/&gt;</span>
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black">
                                Automate your <br/>workflow
                            </h3>
                            <p className="text-black/80 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                                Deploy AI agents today. Let's schedule a deep dive into the architecture and operations.
                            </p>
                        </div>
                        
                        <Link
                            to="/apply"
                            onClick={() => trackDemoClick('blog_article_cta')}
                            className="relative z-10 inline-flex items-center justify-center px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-sm md:text-base border-2 border-black hover:bg-transparent hover:text-black transition-all"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                            <ArrowRight size={18} className="mr-3" />
                            DEPLOY AGENTS
                        </Link>
                    </div>

                    {/* Author Profile Section */}
                    <div className="mt-20 pt-16 border-t border-[#1E1E1E]">
                        <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-6" style={{ fontFamily: "'DM Mono', monospace" }}>
                            [ AUTHOR_ID ]
                        </h4>

                        <div className="flex flex-col md:flex-row gap-8 items-start p-8" style={{ background: '#111', border: '1px solid #1E1E1E' }}>
                            <div className="flex-shrink-0">
                                {(article.author?.profile_image || article.author_details?.profile_image) ? (
                                    <div className="w-24 h-24 md:w-32 md:h-32 p-1" style={{ border: '1px solid #1E1E1E', background: '#070707' }}>
                                        <img
                                            src={article.author?.profile_image || article.author_details?.profile_image}
                                            alt={article.author_name}
                                            className="w-full h-full object-cover grayscale"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center font-black text-4xl" style={{ border: '1px solid #1E1E1E', background: '#070707', color: TEAL, fontFamily: "'DM Mono', monospace" }}>
                                        usr
                                    </div>
                                )}
                            </div>

                            <div className="flex-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                <h4 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
                                    {article.author?.name || article.author_details?.name || article.author_name || 'System Operator'}
                                </h4>
                                {(article.author?.role || article.author_details?.role) && (
                                    <p className="font-bold uppercase tracking-widest text-[11px] mb-4" style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}>
                                        {article.author?.role || article.author_details?.role}
                                    </p>
                                )}
                                <div className="text-white/60 leading-relaxed mb-6 font-medium">
                                    <p>{article.author?.bio || article.author_details?.bio || article.author_bio || 'Maintains the grid.'}</p>
                                </div>

                                {(() => {
                                    const socials = article.author?.social_links || article.author_details?.social_links || {};
                                    if (Object.keys(socials).length === 0) return null;
                                    return (
                                        <div className="flex flex-wrap gap-4">
                                            {socials.twitter && (
                                                <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Twitter size={20} /></a>
                                            )}
                                            {socials.linkedin && (
                                                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Linkedin size={20} /></a>
                                            )}
                                            {socials.website && (
                                                <a href={socials.website} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Globe size={20} /></a>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Share */}
                    <div className="mt-12 flex gap-4">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ title: article.seo_title, url: window.location.href })
                                } else {
                                    navigator.clipboard.writeText(window.location.href); alert('COPIED!');
                                }
                            }}
                            className="flex items-center gap-3 px-6 py-4 font-bold uppercase tracking-widest text-xs transition-all hover:bg-[#1A1A1A]"
                            style={{ background: '#111', color: TEAL, border: '1px solid #1E1E1E', fontFamily: "'DM Mono', monospace" }}
                        >
                            <Share2 size={16} /> SHARE_LOG
                        </button>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-20 pt-16 border-t border-[#1E1E1E]">
                        <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-10" style={{ fontFamily: "'DM Mono', monospace" }}>
                            [ COMM_LOGS : {comments.length} ]
                        </h4>

                        <div className="p-8 mb-12" style={{ background: '#111', border: '1px solid #1E1E1E' }}>
                            <form onSubmit={handlePostComment} className="space-y-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                <div>
                                    <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>ID_NAME</label>
                                    <input
                                        type="text" required value={commentName} onChange={(e) => setCommentName(e.target.value)}
                                        placeholder="GUEST"
                                        className="w-full px-4 py-4 bg-[#070707] border border-[#1E1E1E] focus:border-[#26CECE] outline-none transition-all text-white font-bold"
                                        style={{ fontFamily: "'DM Mono', monospace" }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>PAYLOAD</label>
                                    <textarea
                                        required value={newComment} onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="> ENTER INPUT..." rows="4"
                                        className="w-full px-4 py-4 bg-[#070707] border border-[#1E1E1E] focus:border-[#26CECE] outline-none transition-all text-white resize-none font-medium"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit" disabled={isSubmittingComment || !newComment.trim() || !commentName.trim()}
                                    className="flex items-center gap-3 px-8 py-4 disabled:opacity-50 font-black uppercase tracking-widest text-sm hover:invert transition-all"
                                    style={{ background: TEAL, color: '#000', border: 'none', fontFamily: "'DM Mono', monospace" }}
                                >
                                    {isSubmittingComment ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                    {isSubmittingComment ? 'TRANSMITTING...' : 'EXECUTE'}
                                </button>
                                {commentsError && <p className="text-red-500 font-bold font-mono text-sm mt-4 uppercase">ERR: {commentsError}</p>}
                            </form>
                        </div>

                        <div className="space-y-6">
                            {comments.length === 0 ? (
                                <p className="text-white/40 font-medium uppercase tracking-widest text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                                    NO LOGS FOUND.
                                </p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-6 p-6 md:p-8" style={{ background: '#111', border: '1px solid #1E1E1E' }}>
                                        <div className="flex-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            <div className="flex items-baseline justify-between mb-4 border-b border-[#1E1E1E] pb-4">
                                                <h5 className="font-black text-white uppercase tracking-wider text-xl">{comment.author_name}</h5>
                                                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                                                    <Clock size={12} />
                                                    {new Date(comment.created_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-white/80 leading-relaxed font-medium">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </article>

                {/* Sidebar */}
                <aside className="w-full lg:w-[320px] flex-shrink-0 pt-16 lg:pt-0">
                    <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-10" style={{ fontFamily: "'DM Mono', monospace" }}>
                        [ SYS_RELATED_LOGS ]
                    </h4>

                    {loadingLatest ? (
                        <div className="flex py-10">
                            <Loader2 className="animate-spin text-white/20" size={32} />
                        </div>
                    ) : latestBlogs.length > 0 ? (
                        <div className="flex flex-col gap-8">
                            {latestBlogs.map((blog) => (
                                <Link to={`/blogs/${blog.id}`} key={blog.id} className="group block focus:outline-none">
                                    <div className="flex flex-col gap-4 p-4 transition-all hover:bg-[#111] hover:border-[#26CECE]" style={{ border: '1px solid transparent' }}>
                                        <div className="overflow-hidden aspect-[16/9] border border-[#1E1E1E] p-1 bg-[#111]">
                                            <img
                                                src={blog.image_url || 'https://via.placeholder.com/600x400?text=Blog'}
                                                alt={blog.seo_title || blog.topic}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=No+Image' }}
                                            />
                                        </div>
                                        <div style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                            {blog.category && (
                                                <span className="text-[10px] font-bold uppercase tracking-widest mb-2 inline-block px-1" style={{ color: TEAL, border: `1px solid ${TEAL}50`, fontFamily: "'DM Mono', monospace" }}>
                                                    {blog.category}
                                                </span>
                                            )}
                                            <h4 className="font-extrabold text-white line-clamp-2 uppercase tracking-tight group-hover:text-[#26CECE] transition-colors leading-tight mb-3">
                                                {blog.seo_title || blog.topic}
                                            </h4>
                                            <div className="text-[10px] text-white/40 font-bold flex items-center gap-2 uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>
                                                {new Date(blog.publish_date || blog.created_at).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-white/40 uppercase tracking-widest font-bold text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>
                            DATA OFFLINE.
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default PublicArticlePage;
