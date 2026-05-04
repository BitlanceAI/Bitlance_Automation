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
        <div className="space-y-6 font-mono">
            <h4 className="text-xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-3 border-l-4 border-[#26cece] pl-3 mb-6">
                <FileText className="h-5 w-5 text-[#26cece]" /> Assemble Payload
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Form */}
                <div className="space-y-6">
                    {/* Post Content */}
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2">
                            Text Payload
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => onContentChange(e.target.value)}
                            rows={6}
                            placeholder="&gt; Write your transmission body here... Use #hashtags and @mentions"
                            className="w-full px-4 py-3 border border-[#333] bg-[#111111] text-white focus:border-[#26cece] focus:ring-0 focus:outline-none resize-none transition-colors rounded-none font-mono text-sm placeholder-gray-600"
                        />
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest text-right mt-2 uppercase">
                            {content?.length || 0} / 63,206 BYTES
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
                        <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2">
                            Destination Vector (URL)
                        </label>
                        <div className="flex items-center gap-3 border border-[#333] bg-[#111111] px-4 py-3 focus-within:border-[#26cece] transition-colors">
                            <Link2 className="h-4 w-4 text-gray-500" />
                            <input
                                type="url"
                                value={linkUrl}
                                onChange={(e) => onLinkChange(e.target.value)}
                                placeholder="https://..."
                                className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-gray-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: Preview */}
                <div className="flex flex-col">
                    <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-2">
                        Simulation Output
                    </label>
                    <div className="bg-[#070707] border border-[#333] shadow-[0_2px_16px_0_rgba(0,0,0,0.4)] rounded-none flex flex-col font-mono flex-1">
                        {/* Post Header */}
                        <div className="p-4 border-b border-[#333] bg-[#111111]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 border border-[#26cece] bg-[#26cece]/20"></div>
                                <div>
                                    <p className="font-bold font-['Space_Grotesk'] text-white tracking-widest uppercase text-sm">
                                        Your Node
                                    </p>
                                    <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-1">&gt; T-MINUS 00:00:00</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 bg-[#070707]">
                            <p className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                {content || '> Payload body empty...'}
                            </p>
                        </div>

                        {/* Media Preview */}
                        {mediaUrls[0] && (
                            <div className="aspect-video bg-[#111111] border-y border-[#333] overflow-hidden">
                                <img
                                    src={mediaUrls[0]}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Engagement Bar */}
                        <div className="p-4 bg-[#111111] flex gap-6 text-gray-500 text-[10px] tracking-widest uppercase font-bold border-t border-[#333]">
                            <span className="hover:text-white cursor-pointer transition-colors">+ ACKNOWLEDGE</span>
                            <span className="hover:text-white cursor-pointer transition-colors">+ RESPOND</span>
                            <span className="hover:text-white cursor-pointer transition-colors">+ RELAY</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepContent;
