import React, { useState, useRef } from 'react';

import { Upload, X, Image as ImageIcon, Film, Link, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

const FileUpload = ({ onUpload, type = 'image', currentUrl, onClear, label }) => {
    const { session, user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        // Validate file type
        const validTypes = type === 'video' ? ['video/mp4', 'video/webm', 'video/quicktime'] : ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert(`Please upload a valid ${type} file.`);
            return;
        }

        // Validate size (10MB for image, 50MB for video)
        const maxSize = type === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert(`File size too large. Max ${type === 'video' ? '50MB' : '10MB'}.`);
            return;
        }

        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = session?.access_token || user?.token;
            const res = await fetch(`${API_BASE}/api/campaigns/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                onUpload(data.url, data.type);
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>

            {currentUrl ? (
                <div className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800">
                    {type === 'video' || currentUrl.endsWith('.mp4') || currentUrl.endsWith('.webm') ? (
                        <video src={currentUrl} controls className="w-full h-48 object-cover" />
                    ) : (
                        <img src={currentUrl} alt="Creative Asset" className="w-full h-48 object-cover" />
                    )}
                    <button
                        onClick={(e) => { e.preventDefault(); onClear(); }}
                        className="absolute top-2 right-2 p-1.5 bg-red-100/80 hover:bg-red-200 text-red-600 rounded-full transition-colors backdrop-blur-sm"
                    >
                        <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-md">
                        {type === 'video' ? 'Video Asset' : 'Image Asset'}
                    </div>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${dragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-slate-900'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={type === 'video' ? "video/*" : "image/*"}
                        onChange={handleChange}
                    />

                    <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                <p className="text-sm text-gray-500">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-2">
                                    <Upload className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Click to upload {type} or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                    {type === 'video' ? 'MP4, WebM up to 50MB' : 'PNG, JPG, GIF up to 10MB'}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const CampaignFormBase = ({ formData, handleInputChange, children }) => (
    <div className="space-y-6">
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Summer Campaign"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                required
            />
        </div>
        {children}
    </div>
);

export const CreativeAssetsSection = ({ formData, handleInputChange, showDestination = false }) => {
    // Determine initial active tab based on content
    const [activeTab, setActiveTab] = useState(
        formData.creative_assets?.videoUrl ? 'video' :
            (formData.creative_assets?.imageUrl && !formData.creative_assets?.imageUrl.startsWith('http') ? 'upload' : 'url')
    );

    const handleUploadComplete = (url, type) => {
        // Create a synthetic event or call state setter directly if possible
        // Since we only have handleInputChange, we need to adapt
        // We'll update both URL and type
        const syntheticEvent = {
            target: {
                name: 'imageUrl',
                value: url
            }
        };
        handleInputChange(syntheticEvent, 'creative_assets');

        // If it's a video, we might want to store it in videoUrl too or just use imageUrl as generic 'mediaUrl'
        // For compatibility with existing backend, we'll keep using 'imageUrl' but maybe add a type field if needed
        if (type === 'video') {
            const videoEvent = { target: { name: 'videoUrl', value: url } };
            handleInputChange(videoEvent, 'creative_assets');
            // Clear image URL if switching to video
            // handleInputChange({ target: { name: 'imageUrl', value: '' } }, 'creative_assets');
        }
    };

    return (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Creative Assets</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headline</label>
                    <input
                        type="text"
                        name="headline"
                        value={formData.creative_assets?.headline || ''}
                        onChange={(e) => handleInputChange(e, 'creative_assets')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.creative_assets?.description || ''}
                        onChange={(e) => handleInputChange(e, 'creative_assets')}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 h-24"
                    />
                </div>

                {/* Media Selection Tabs */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Media Asset</label>
                    <div className="flex gap-2 mb-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg w-fit">
                        <button
                            onClick={(e) => { e.preventDefault(); setActiveTab('upload'); }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'upload' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ImageIcon size={16} /> Upload Image
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); setActiveTab('video'); }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'video' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Film size={16} /> Upload Video
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); setActiveTab('url'); }}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'url' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Link size={16} /> Image URL
                        </button>
                    </div>

                    <div className="min-h-[140px]">
                        {activeTab === 'upload' && (
                            <FileUpload
                                type="image"
                                label="Upload Campaign Image"
                                currentUrl={formData.creative_assets?.imageUrl}
                                onUpload={(url) => handleUploadComplete(url, 'image')}
                                onClear={() => handleUploadComplete('', 'image')}
                            />
                        )}

                        {activeTab === 'video' && (
                            <FileUpload
                                type="video"
                                label="Upload Campaign Video"
                                currentUrl={formData.creative_assets?.imageUrl} // Using imageUrl common field for now
                                onUpload={(url) => handleUploadComplete(url, 'video')}
                                onClear={() => handleUploadComplete('', 'video')}
                            />
                        )}

                        {activeTab === 'url' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        value={formData.creative_assets?.imageUrl || ''}
                                        onChange={(e) => handleInputChange(e, 'creative_assets')}
                                        placeholder="https://..."
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {formData.creative_assets?.imageUrl && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-40 w-full relative bg-gray-50">
                                        <img
                                            src={formData.creative_assets.imageUrl}
                                            alt="Preview"
                                            className="h-full w-full object-contain"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Removed raw Image URL input from here, moved to tab above */}
                    {showDestination && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination URL</label>
                            <input
                                type="text"
                                name="destination_url"
                                value={formData.destination_url || ''}
                                onChange={handleInputChange}
                                placeholder="https://your-site.com"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 1. Awareness Form
export const AwarenessForm = ({ formData, handleInputChange }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange}>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Goal:</strong> Maximize brand visibility. Ads will be shown to people most likely to remember them.
            </p>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} />
    </CampaignFormBase>
);

// 2. Traffic Form
export const TrafficForm = ({ formData, handleInputChange }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange}>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Goal:</strong> Drive clicks to a website or landing page.
            </p>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} showDestination={true} />
    </CampaignFormBase>
);

// 3. Engagement Form
export const EngagementForm = ({ formData, handleInputChange }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange}>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Engagement Type</label>
            <select
                name="engagement_type" // Needs handling in parent or specialized state
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
            >
                <option value="post_engagement">Post Likes/Comments</option>
                <option value="page_likes">Page Likes</option>
                <option value="event_responses">Event Responses</option>
            </select>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} />
    </CampaignFormBase>
);

// 4. Lead Gen Form
export const LeadGenForm = ({ formData, handleInputChange }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange}>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lead Form Type</label>
            <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
            >
                <option value="instant_form">Instant Form (On-Facebook)</option>
                <option value="messenger_automated">Messenger Automated Chat</option>
            </select>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} />
    </CampaignFormBase>
);

// 5. Sales / Conversion Form
export const SalesForm = ({ formData, handleInputChange }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conversion Event</label>
                <select
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="purchase">Purchase</option>
                    <option value="add_to_cart">Add to Cart</option>
                    <option value="initiate_checkout">Initiate Checkout</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Catalog ID</label>
                <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} showDestination={true} />
    </CampaignFormBase>
);

// 6. App Promotion Form
export const AppPromotionForm = ({ formData, handleInputChange }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App Name</label>
                <input
                    type="text"
                    name="app_name"
                    value={formData.app_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">App Store / Play Store URL</label>
                <input
                    type="text"
                    name="app_store_url"
                    value={formData.app_store_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} />
    </CampaignFormBase>
);

// 7. Local Business Form
export const LocalBusinessForm = ({ formData, handleInputChange }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange}>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Address</label>
            <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="123 Main St, City, Zip"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                required
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Call to Action Type</label>
                <select
                    name="cta_type"
                    value={formData.cta_type || 'get_directions'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="get_directions">Get Directions</option>
                    <option value="call_now">Call Now</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Radius (km)</label>
                <input
                    type="number"
                    name="radius_km"
                    value={formData.radius_km || 5}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} />
    </CampaignFormBase>
);

// 8. Remarketing Form
export const RemarketingForm = ({ formData, handleInputChange }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange}>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience Source</label>
            <select
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
            >
                <option value="website_visitors">Website Visitors (Last 30 days)</option>
                <option value="past_customers">Past Customers</option>
                <option value="engagers">Video Viewers / Page Engagers</option>
            </select>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} showDestination={true} />
    </CampaignFormBase>
);

// 9. Offer / Event Form
export const OfferEventForm = ({ formData, handleInputChange }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange}>
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Sub-Type</label>
            <select
                name="subtype" // needs handling
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
            >
                <option value="offer">Special Offer / Discount</option>
                <option value="event">Event Promotion</option>
            </select>
        </div>

        {/* Simplified conditional rendering assumes 'offer' for now or generic inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offer Title / Event Name</label>
                <input
                    type="text"
                    name="offer_title"
                    value={formData.offer_title || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details (Date/Discount)</label>
                <input
                    type="text"
                    name="offer_details"
                    value={formData.offer_details || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 20% Off or Dec 25th 2024"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} />
    </CampaignFormBase>
);
