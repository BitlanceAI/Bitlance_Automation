import React from 'react';
import { FileText, Link2 } from 'lucide-react';
import MediaSelector from '../MediaSelector';

/**
 * Step 2: Content Creation
 * Post text, media, and link URL
 */
const StepContent = ({
    content,
    linkUrl,
    mediaUrls,
    mediaFiles,
    onContentChange,
    onLinkChange,
    onMediaUpdate,
    getAuthHeaders,
    apiBase
}) => {
    return (
        <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" /> Create Your Content
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Form */}
                <div className="space-y-4">
                    {/* Post Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Post Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => onContentChange(e.target.value)}
                            rows={6}
                            placeholder="Write your post content here... Use #hashtags and @mentions"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {content?.length || 0} / 63,206 characters
                        </p>
                    </div>

                    {/* Media Selector Component */}
                    <MediaSelector
                        mediaUrls={mediaUrls}
                        mediaFiles={mediaFiles}
                        onUpdate={onMediaUpdate}
                        getAuthHeaders={getAuthHeaders}
                        apiBase={apiBase}
                    />

                    {/* Link URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Link URL
                        </label>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 px-4 py-3">
                            <Link2 className="h-5 w-5 text-gray-400" />
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => onLinkChange(e.target.value)}
                                placeholder="https://yourwebsite.com/landing-page"
                                className="flex-1 bg-transparent text-gray-900 dark:text-white focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Preview */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preview
                    </label>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                        {/* Post Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                        Your Page
                                    </p>
                                    <p className="text-xs text-gray-500">Just now</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
                                {content || 'Your post content will appear here...'}
                            </p>
                        </div>

                        {/* Media Preview */}
                        {mediaUrls[0] && (
                            <div className="aspect-video bg-gray-100 dark:bg-slate-800 overflow-hidden">
                                <img
                                    src={mediaUrls[0]}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Engagement Bar */}
                        <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex gap-6 text-gray-500 dark:text-gray-400 text-sm">
                            <span>👍 Like</span>
                            <span>💬 Comment</span>
                            <span>↗️ Share</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepContent;
