import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ThumbsUp } from 'lucide-react';

const EngagementWidget = ({ campaign, onEngage }) => {
    const { creative_assets: creative, engagement_types = ['like', 'share'] } = campaign;
    const [stats, setStats] = useState({
        likes: creative.initialLikes || 0,
        shares: creative.initialShares || 0,
        hasLiked: false
    });

    const handleLike = () => {
        if (stats.hasLiked) return;
        setStats(prev => ({ ...prev, likes: prev.likes + 1, hasLiked: true }));
        onEngage('like');
    };

    const handleShare = () => {
        setStats(prev => ({ ...prev, shares: prev.shares + 1 }));
        onEngage('share');
    };

    return (
        <div className="rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-gray-700 p-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {creative.brandName?.[0] || 'B'}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{creative.brandName || 'Brand'}</h4>
                    <p className="text-xs text-gray-500">Sponsored • {creative.timeAgo || 'Just now'}</p>
                </div>
            </div>

            {/* Content */}
            <div className="mb-4">
                <p className="text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-line">{creative.text}</p>
                {creative.imageUrl && (
                    <img
                        src={creative.imageUrl}
                        alt="Engagement Content"
                        className="w-full rounded-lg object-cover max-h-96"
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${stats.hasLiked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                >
                    <Heart size={20} className={stats.hasLiked ? 'fill-current' : ''} />
                    <span className="text-sm font-medium">{stats.likes}</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <MessageCircle size={20} />
                    <span className="text-sm font-medium">Comment</span>
                </button>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <Share2 size={20} />
                    <span className="text-sm font-medium">{stats.shares}</span>
                </button>
            </div>
        </div>
    );
};

export default EngagementWidget;
