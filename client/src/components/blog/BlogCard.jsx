import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BlogCard = ({ article }) => {
    // Format date
    const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create excerpt from content (strip HTML)
    const excerpt = article.content
        ? article.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...'
        : 'Read this interesting article to learn more...';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full border border-gray-100 dark:border-slate-700">
            {/* Image */}
            <div className="h-48 overflow-hidden bg-gray-100 dark:bg-slate-700">
                {article.image_url ? (
                    <img
                        src={article.image_url}
                        alt={article.seo_title || article.topic}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">📝</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                {/* Meta */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 gap-4">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                        <User size={14} />
                        {article.author_name || (article.user_id === 'anonymous' ? 'Bitlance AI' : 'Bitlance Team')}
                    </span>
                </div>

                {/* Category Badge */}
                {article.category && (
                    <div className="mb-2">
                        <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
                            {article.category}
                        </span>
                    </div>
                )}

                {/* Title */}
                <Link to={article.slug ? `/blogs/${article.slug}` : `/blogs/${article.id}`} className="block mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {article.seo_title || article.topic}
                    </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-1">
                    {excerpt}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded">
                        {article.estimated_read_time ? `${article.estimated_read_time} min read` : (article.length || 'Article')}
                    </span>
                    <Link
                        to={article.slug ? `/blogs/${article.slug}` : `/blogs/${article.id}`}
                        className="flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all"
                    >
                        Read More <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
