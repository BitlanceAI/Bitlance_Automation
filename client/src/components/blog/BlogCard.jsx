import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

const TEAL = '#26CECE';

const BlogCard = ({ article }) => {
    // Format date
    const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return (
        <div 
            className="flex flex-col h-full group hover:border-[#26CECE] transition-colors overflow-hidden relative"
            style={{ 
                background: '#111111', 
                border: '1px solid #1E1E1E', 
                borderRadius: 2 
            }}
        >
            {/* Image */}
            <div className="h-48 overflow-hidden bg-[#070707] border-b border-[#1E1E1E]">
                {article.image_url ? (
                    <img
                        src={article.image_url}
                        alt={article.seo_title || article.topic}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                        <span className="text-4xl">/&gt;</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                {/* Meta */}
                <div className="flex items-center text-[11px] text-white/40 mb-4 gap-4 tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {formattedDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <User size={12} />
                        {article.author_name || (article.user_id === 'anonymous' ? 'AI Agent' : 'Bitlance')}
                    </span>
                </div>

                {/* Category Badge */}
                {article.category && (
                    <div className="mb-4">
                        <span 
                            className="text-[10px] font-bold px-2 py-1 uppercase tracking-widest inline-block transition-colors"
                            style={{
                                background: `${TEAL}10`,
                                color: TEAL,
                                border: `1px solid ${TEAL}30`,
                                borderRadius: 2,
                                fontFamily: "'DM Mono', monospace"
                            }}
                        >
                            {article.category}
                        </span>
                    </div>
                )}

                {/* Title */}
                <Link to={article.slug ? `/blogs/${article.slug}` : `/blogs/${article.id}`} className="block mb-4">
                    <h3 className="text-xl font-bold text-white line-clamp-2 transition-colors group-hover:text-[#26CECE] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {article.seo_title || article.topic}
                    </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-white/60 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {article.content
                        ? article.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...'
                        : 'Read this interesting article to learn more...'}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-[#1E1E1E] flex items-center justify-between">
                    <span 
                        className="text-[10px] uppercase font-bold px-2 py-1 text-white/40 tracking-widest"
                        style={{ fontFamily: "'DM Mono', monospace", background: '#0a0a0a', border: '1px solid #1E1E1E', borderRadius: 2 }}
                    >
                        {article.estimated_read_time ? `${article.estimated_read_time} min read` : (article.length || 'Article')}
                    </span>
                    <Link
                        to={article.slug ? `/blogs/${article.slug}` : `/blogs/${article.id}`}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest group/link transition-all"
                        style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}
                    >
                        Read More <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
