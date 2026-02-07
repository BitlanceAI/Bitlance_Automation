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
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Media
            </label>

            {/* Mode Toggle */}
            <div className="grid grid-cols-3 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-xl mb-4">
                <button
                    onClick={() => setUploadMode('file')}
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${uploadMode === 'file'
                            ? 'bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400'
                            : 'text-gray-500'
                        }`}
                >
                    Upload
                </button>
                <button
                    onClick={() => {
                        setUploadMode('library');
                        loadGeneratedGraphics();
                    }}
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${uploadMode === 'library'
                            ? 'bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400'
                            : 'text-gray-500'
                        }`}
                >
                    Library
                </button>
                <button
                    onClick={() => {
                        setUploadMode('url');
                        if (mediaUrls.length === 0) {
                            onUpdate({ mediaFiles: [], mediaUrls: [''] });
                        }
                    }}
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${uploadMode === 'url'
                            ? 'bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400'
                            : 'text-gray-500'
                        }`}
                >
                    URL
                </button>
            </div>

            {/* Upload Mode */}
            {uploadMode === 'file' && (
                <div className="space-y-4">
                    <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-8 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer text-center group">
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleFileSelect}
                        />
                        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full inline-flex group-hover:scale-110 transition-transform">
                            <UploadCloud className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Click or drop to upload
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Images or Videos</p>
                    </div>

                    {/* File Preview List */}
                    {mediaFiles.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {mediaFiles.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-slate-800 overflow-hidden shrink-0">
                                            <img
                                                src={mediaUrls[idx]}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                            {file.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : generatedGraphics.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto custom-scrollbar p-1">
                            {generatedGraphics.map((job) => (
                                <div
                                    key={job.id}
                                    onClick={() => selectGraphicFromLibrary(job)}
                                    className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${mediaUrls.includes(job.flyer_url)
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-200 dark:border-slate-700 hover:border-blue-400'
                                        }`}
                                >
                                    <img
                                        src={job.flyer_url}
                                        alt={job.property_type || 'Generated graphic'}
                                        className="w-full h-24 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                        {mediaUrls.includes(job.flyer_url) ? (
                                            <CheckCircle2 className="h-6 w-6 text-white opacity-100" />
                                        ) : (
                                            <PlusCircle className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                        <p className="text-xs text-white truncate">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No generated graphics yet</p>
                            <p className="text-xs mt-1">
                                Generate graphics in the Design section first
                            </p>
                        </div>
                    )}

                    {/* Selected From Library */}
                    {mediaUrls.filter(u => !u.startsWith('blob:')).length > 0 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                            <p className="text-xs font-medium text-gray-500 mb-2">
                                Selected ({mediaUrls.filter(u => !u.startsWith('blob:')).length})
                            </p>
                            <div className="flex gap-2 overflow-x-auto">
                                {mediaUrls
                                    .filter(u => !u.startsWith('blob:'))
                                    .map((url, idx) => (
                                        <div key={idx} className="relative shrink-0">
                                            <img
                                                src={url}
                                                alt=""
                                                className="h-12 w-12 rounded-lg object-cover"
                                            />
                                            <button
                                                onClick={() => removeUrl(url)}
                                                className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"
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
                <div className="space-y-2">
                    {mediaUrls.map((url, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => updateUrlAtIndex(idx, e.target.value)}
                                placeholder="https://..."
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            {idx === mediaUrls.length - 1 && (
                                <button
                                    onClick={addUrlField}
                                    className="p-3 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
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
