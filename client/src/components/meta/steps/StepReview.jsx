import React from 'react';
import { CheckCircle2, Eye, Calendar, Users, MousePointer, Image, FileText } from 'lucide-react';

/**
 * Step 5: Review & Confirm
 * Final review before scheduling
 */
const StepReview = ({ formData, pages }) => {
    const selectedPage = pages?.find(p => p.id === formData.pageId);
    const hasMedia = formData.mediaUrls?.[0];
    const scheduledDate = formData.scheduledTime
        ? new Date(formData.scheduledTime)
        : null;

    return (
        <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" /> Review Your Post
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Summary Card */}
                <div className="space-y-4">
                    {/* Page */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Publishing to</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {selectedPage?.name || 'No page selected'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Scheduled for</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {scheduledDate
                                        ? scheduledDate.toLocaleString('en-IN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Not scheduled'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Post Type */}
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                {hasMedia ? (
                                    <Image className="h-5 w-5 text-green-600" />
                                ) : (
                                    <FileText className="h-5 w-5 text-green-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Post Type</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {hasMedia ? 'Media Post' : 'Text Post'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    {formData.callToAction && (
                        <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <MousePointer className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Call to Action</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {formData.callToAction.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Post Preview Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {selectedPage?.name || 'Your Page'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Scheduled •{' '}
                                    {scheduledDate?.toLocaleDateString('en-IN', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <p className="text-gray-900 dark:text-white text-sm whitespace-pre-wrap">
                            {formData.content || 'No content'}
                        </p>
                    </div>

                    {/* Media */}
                    {hasMedia && (
                        <div className="aspect-video bg-gray-100 dark:bg-slate-800 overflow-hidden">
                            <img
                                src={formData.mediaUrls[0]}
                                alt="Post media"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Engagement */}
                    <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex justify-around text-gray-500 text-sm">
                        <span>👍 Like</span>
                        <span>💬 Comment</span>
                        <span>↗️ Share</span>
                    </div>
                </div>
            </div>

            {/* Confirmation Notice */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-green-800 dark:text-green-300">
                        Ready to schedule!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">
                        Click "Schedule Post" to publish this post at the scheduled time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StepReview;
