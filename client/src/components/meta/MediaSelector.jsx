import React, { useState, useEffect } from 'react';
import { UploadCloud, Trash2, PlusCircle, CheckCircle2, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Media Selector Component
 * Handles file upload, library selection, and URL input for post media
 */
const MediaSelector = ({
    mediaUrls,
    mediaFiles,
    onUpdate,
    getAuthHeaders,
    apiBase
}) => {
    const [uploadMode, setUploadMode] = useState('file'); // 'file', 'library', 'url'
    const [generatedGraphics, setGeneratedGraphics] = useState([]);
    const [loadingGraphics, setLoadingGraphics] = useState(false);

    // Fetch generated graphics from library
    const loadGeneratedGraphics = async () => {
        setLoadingGraphics(true);
        try {
            const response = await fetch(`${apiBase}/api/design/jobs`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (data.success) {
                const completedJobs = (data.jobs || []).filter(
                    job => job.status === 'completed' && job.flyer_url
                );
                setGeneratedGraphics(completedJobs);
            }
        } catch (error) {
            console.error('Failed to load graphics:', error);
        } finally {
            setLoadingGraphics(false);
        }
    };

    // Add graphic from library
    const selectGraphicFromLibrary = (job) => {
        const url = job.flyer_url;
        if (!mediaUrls.includes(url)) {
            onUpdate({ mediaUrls: [...mediaUrls, url] });
            toast.success('Graphic added!');
        } else {
            toast.info('Already added');
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const newBlobs = files.map(file => URL.createObjectURL(file));
        onUpdate({
            mediaFiles: [...mediaFiles, ...files],
            mediaUrls: [...mediaUrls, ...newBlobs]
        });
    };

    // Remove file at index
    const removeFile = (idx) => {
        const newFiles = [...mediaFiles];
        const newUrls = [...mediaUrls];
        newFiles.splice(idx, 1);
        newUrls.splice(idx, 1);
        onUpdate({ mediaFiles: newFiles, mediaUrls: newUrls });
    };

    // Remove URL
    const removeUrl = (url) => {
        onUpdate({ mediaUrls: mediaUrls.filter(u => u !== url) });
    };

    // Update URL at index
    const updateUrlAtIndex = (idx, value) => {
        const newUrls = [...mediaUrls];
        newUrls[idx] = value;
        onUpdate({ mediaUrls: newUrls });
    };

    // Add empty URL field
    const addUrlField = () => {
        onUpdate({ mediaUrls: [...mediaUrls, ''] });
    };

    return (
        <div className="font-mono">
            <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#26cece]"></span> Signal Assets
            </label>

            {/* Mode Toggle */}
            <div className="grid grid-cols-3 p-1 bg-[#111111] border border-[#333] mb-6">
                <button
                    onClick={() => setUploadMode('file')}
                    className={`py-3 text-[10px] uppercase font-mono tracking-widest transition-all ${uploadMode === 'file'
                            ? 'bg-[#26cece] text-[#070707] font-bold shadow-[2px_2px_0_0_#333] -translate-y-0.5 rounded-none'
                            : 'bg-transparent text-gray-500 hover:text-white border border-transparent hover:border-[#333] rounded-none'
                        }`}
                >
                    Disk
                </button>
                <button
                    onClick={() => {
                        setUploadMode('library');
                        loadGeneratedGraphics();
                    }}
                    className={`py-3 text-[10px] uppercase font-mono tracking-widest transition-all ${uploadMode === 'library'
                            ? 'bg-[#26cece] text-[#070707] font-bold shadow-[2px_2px_0_0_#333] -translate-y-0.5 rounded-none'
                            : 'bg-transparent text-gray-500 hover:text-white border border-transparent hover:border-[#333] rounded-none'
                        }`}
                >
                    Design Array
                </button>
                <button
                    onClick={() => {
                        setUploadMode('url');
                        if (mediaUrls.length === 0) {
                            onUpdate({ mediaFiles: [], mediaUrls: [''] });
                        }
                    }}
                    className={`py-3 text-[10px] uppercase font-mono tracking-widest transition-all ${uploadMode === 'url'
                            ? 'bg-[#26cece] text-[#070707] font-bold shadow-[2px_2px_0_0_#333] -translate-y-0.5 rounded-none'
                            : 'bg-transparent text-gray-500 hover:text-white border border-transparent hover:border-[#333] rounded-none'
                        }`}
                >
                    URL Vector
                </button>
            </div>

            {/* Upload Mode */}
            {uploadMode === 'file' && (
                <div className="space-y-4">
                    <div className="relative border border-dashed border-[#333] bg-[#111111] p-10 hover:border-[#26cece] hover:bg-[#26cece]/5 transition-all cursor-pointer text-center group">
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleFileSelect}
                        />
                        <div className="mb-4 p-4 border border-[#333] bg-[#070707] inline-flex group-hover:bg-[#26cece] group-hover:border-[#26cece] transition-colors">
                            <UploadCloud className="h-6 w-6 text-[#26cece] group-hover:text-[#070707]" />
                        </div>
                        <p className="text-xs font-bold tracking-widest uppercase text-white mb-2">
                            Initialize File Exchange
                        </p>
                        <p className="text-[10px] tracking-widest uppercase text-gray-500">&gt; DROP FILES HERE OR CLICK TO BROWSE</p>
                    </div>

                    {/* File Preview List */}
                    {mediaFiles.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {mediaFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-[#111111] border border-[#333] hover:border-[#26cece] transition-colors"
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="h-10 w-10 bg-[#070707] border border-[#333] overflow-hidden shrink-0">
                                            <img
                                                src={mediaUrls[idx]}
                                                alt=""
                                                className="h-full w-full object-cover grayscale"
                                            />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-white truncate">
                                            {file.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="p-2 border border-transparent hover:border-red-500 hover:bg-red-500/10 text-red-500 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Library Mode */}
            {uploadMode === 'library' && (
                <div className="space-y-4">
                    {loadingGraphics ? (
                        <div className="flex items-center justify-center py-12 border border-[#333] bg-[#111111]">
                            <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-[#26cece]"></div>
                        </div>
                    ) : generatedGraphics.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
                            {generatedGraphics.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => selectGraphicFromLibrary(job)}
                                    className={`relative group cursor-pointer border transition-all ${mediaUrls.includes(job.flyer_url)
                                            ? 'border-[#26cece] shadow-[0_2px_16px_0_rgba(0,0,0,0.4)] -translate-y-1'
                                            : 'border-[#333] hover:border-[#26cece]'
                                        }`}
                                >
                                    <img
                                        src={job.flyer_url}
                                        alt={job.property_type || 'Generated graphic'}
                                        className="w-full h-32 object-cover grayscale group-hover:grayscale-0 transition-all"
                                    />
                                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                        {mediaUrls.includes(job.flyer_url) ? (
                                            <CheckCircle2 className="h-8 w-8 text-[#26cece] opacity-100 bg-[#070707] rounded-full" />
                                        ) : (
                                            <PlusCircle className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-[#070707]/90 border-t border-[#333] p-2">
                                        <p className="text-[10px] text-[#26cece] font-bold font-mono uppercase tracking-widest truncate">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-[#111111] border border-dashed border-[#333]">
                            <ImageIcon className="h-10 w-10 mx-auto mb-4 text-[#333]" />
                            <p className="text-xs font-bold tracking-widest uppercase text-white mb-2">No generated graphics yet</p>
                            <p className="text-[10px] tracking-widest uppercase text-gray-500">
                                &gt; Initialize generators in Design Matrix
                            </p>
                        </div>
                    )}

                    {/* Selected From Library */}
                    {mediaUrls.filter(u => !u.startsWith('blob:')).length > 0 && (
                        <div className="pt-4 border-t border-[#333]">
                            <p className="text-[10px] font-bold font-mono tracking-widest text-[#26cece] uppercase mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#26cece]"></span>
                                Buffered Array Elements ({mediaUrls.filter(u => !u.startsWith('blob:')).length})
                            </p>
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {mediaUrls
                                    .filter(u => !u.startsWith('blob:'))
                                    .map((url, idx) => (
                                        <div key={idx} className="relative shrink-0 border border-[#333]">
                                            <img
                                                src={url}
                                                alt=""
                                                className="h-16 w-16 object-cover"
                                            />
                                            <button
                                                onClick={() => removeUrl(url)}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-[#070707] hover:bg-white hover:text-red-500 hover:border-red-500 border border-transparent shadow-[2px_2px_0_0_#333] transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* URL Mode */}
            {uploadMode === 'url' && (
                <div className="space-y-3">
                    {mediaUrls.map((url, idx) => (
                        <div key={idx} className="flex gap-3">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => updateUrlAtIndex(idx, e.target.value)}
                                placeholder="&gt; Paste external endpoint URL..."
                                className="flex-1 px-4 py-3 border border-[#333] bg-[#111111] text-white focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono placeholder-gray-600 text-sm"
                            />
                            {idx === mediaUrls.length - 1 && (
                                <button
                                    onClick={addUrlField}
                                    className="p-3 border border-[#333] bg-[#111111] hover:bg-[#26cece] hover:text-[#070707] hover:border-[#26cece] text-gray-500 transition-colors"
                                >
                                    <PlusCircle className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaSelector;
