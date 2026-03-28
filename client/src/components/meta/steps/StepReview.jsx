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
        <div className="space-y-8 font-mono">
            <h4 className="text-xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-3 border-l-4 border-[#26cece] pl-3 mb-6">
                <Eye className="h-5 w-5 text-[#26cece]" /> Data Validation
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Summary Card */}
                <div className="space-y-4">
                    {/* Page */}
                    <div className="p-5 bg-[#070707] border border-[#333] flex flex-col font-mono">
                        <div className="flex items-center gap-4">
                            <div className="p-3 border border-[#333] bg-[#111111]">
                                <Users className="h-5 w-5 text-[#26cece]" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Target Node</p>
                                <p className="font-bold text-white uppercase tracking-tight mt-1 truncate">
                                    {selectedPage?.name || 'No node selected'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="p-5 bg-[#070707] border border-[#333] flex flex-col font-mono">
                        <div className="flex items-center gap-4">
                            <div className="p-3 border border-[#333] bg-[#111111]">
                                <Calendar className="h-5 w-5 text-[#26cece]" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Execution Time</p>
                                <p className="font-bold text-white uppercase tracking-tight mt-1 truncate">
                                    {scheduledDate
                                        ? scheduledDate.toLocaleString('en-IN', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
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
                    <div className="p-5 bg-[#070707] border border-[#333] flex flex-col font-mono">
                        <div className="flex items-center gap-4">
                            <div className="p-3 border border-[#333] bg-[#111111]">
                                {hasMedia ? (
                                    <Image className="h-5 w-5 text-[#26cece]" />
                                ) : (
                                    <FileText className="h-5 w-5 text-[#26cece]" />
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Payload Type</p>
                                <p className="font-bold text-white uppercase tracking-tight mt-1 truncate">
                                    {hasMedia ? 'MEDIA_BLOCK' : 'TEXT_BLOCK'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    {formData.callToAction && (
                        <div className="p-5 bg-[#070707] border border-[#333] flex flex-col font-mono">
                            <div className="flex items-center gap-4">
                                <div className="p-3 border border-[#333] bg-[#111111]">
                                    <MousePointer className="h-5 w-5 text-[#26cece]" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Action Matrix</p>
                                    <p className="font-bold text-white uppercase tracking-tight mt-1 truncate">
                                        {formData.callToAction.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Post Preview Card */}
                <div className="bg-[#070707] border border-[#333] shadow-[4px_4px_0_0_#26cece] rounded-none flex flex-col font-mono drop-shadow-lg max-h-[500px] overflow-auto custom-scrollbar">
                    {/* Header */}
                    <div className="p-4 border-b border-[#333] bg-[#111111] sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 border border-[#26cece] bg-[#26cece]/20 shrink-0"></div>
                            <div>
                                <p className="font-bold font-['Space_Grotesk'] text-white tracking-widest uppercase truncate">
                                    {selectedPage?.name || 'Your Node'}
                                </p>
                                <p className="text-[10px] text-[#26cece] tracking-widest uppercase mt-1">
                                    &gt; SCHEDULED •{' '}
                                    {scheduledDate?.toLocaleDateString('en-IN', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 bg-[#070707]">
                        <p className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                            {formData.content || '> Payload body empty...'}
                        </p>
                    </div>

                    {/* Media */}
                    {hasMedia && (
                        <div className="aspect-video bg-[#111111] border-y border-[#333] overflow-hidden shrink-0">
                            <img
                                src={formData.mediaUrls[0]}
                                alt="Post media"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Engagement */}
                    <div className="p-4 bg-[#111111] flex justify-between text-gray-500 text-[10px] tracking-widest uppercase font-bold shrink-0">
                        <span className="hover:text-white cursor-pointer transition-colors">+ ACKNOWLEDGE</span>
                        <span className="hover:text-white cursor-pointer transition-colors">+ RESPOND</span>
                        <span className="hover:text-white cursor-pointer transition-colors">+ RELAY</span>
                    </div>
                </div>
            </div>

            {/* Confirmation Notice */}
            <div className="p-6 bg-[#26cece]/10 border border-[#26cece] flex items-start gap-4 font-mono shadow-[4px_4px_0_0_#26cece]">
                <CheckCircle2 className="h-6 w-6 text-[#26cece] shrink-0 mt-0.5 animate-pulse" />
                <div>
                    <p className="text-[#26cece] uppercase font-bold tracking-widest text-[12px] md:text-sm mb-1">
                        System ready
                    </p>
                    <p className="text-[#26cece] uppercase text-[10px] tracking-widest">
                        &gt; AUTHORIZE "SCHEDULE POST" TO FINALIZE TRANSACTION.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StepReview;
