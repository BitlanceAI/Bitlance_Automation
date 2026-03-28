import React, { useState, useRef } from 'react';

import { Upload, X, Image as ImageIcon, Film, Link, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import API_BASE_URL from '../../config';

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
            const res = await fetch(`${API_BASE_URL}/api/campaigns/upload`, {
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
            <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">{label}</label>

            {currentUrl ? (
                <div className="relative group overflow-hidden border-2 border-[#333333] bg-[#070707]">
                    {type === 'video' || currentUrl.endsWith('.mp4') || currentUrl.endsWith('.webm') ? (
                        <video src={currentUrl} controls className="w-full h-48 object-cover" />
                    ) : (
                        <img src={currentUrl} alt="Creative Asset" className="w-full h-48 object-cover" />
                    )}
                    <button
                        onClick={(e) => { e.preventDefault(); onClear(); }}
                        className="absolute top-2 right-2 p-1.5 bg-[#111111] hover:bg-[#ce2626] border-2 border-[#333333] hover:border-[#111111] text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#111111] border-2 border-[#333333] text-[#26cece] font-mono font-bold text-xs uppercase tracking-wider">
                        {type === 'video' ? 'Video Asset' : 'Image Asset'}
                    </div>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${dragActive
                        ? 'border-[#26cece] bg-[#26cece]/10'
                        : 'border-[#333333] hover:border-[#26cece] bg-[#111111]'
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
                                <Loader2 className="animate-spin text-[#26cece]" size={32} />
                                <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-[#070707] border-2 border-[#333333] mb-2">
                                    <Upload className="text-[#26cece]" size={24} />
                                </div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">
                                    Click to upload {type} or drag and drop
                                </p>
                                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">
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

export const CampaignFormBase = ({ formData, handleInputChange, availablePages = [], children }) => (
    <div className="space-y-8">
        <div>
            <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Campaign Name</label>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. SUMMER_CAMPAIGN_01"
                className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                required
            />
        </div>
        <PageSelectionSection formData={formData} handleInputChange={handleInputChange} availablePages={availablePages} />
        <TargetingSection formData={formData} handleInputChange={handleInputChange} />
        {children}
    </div>
);

export const PageSelectionSection = ({ formData, handleInputChange, availablePages = [] }) => {
    return (
        <div className="border-t-2 border-[#333333] pt-6">
            <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider font-mono flex items-center gap-3">
                <span className="w-2 h-2 bg-[#26cece]"></span>
                Facebook Page
            </h3>
            <div>
                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Select Page for Ad Delivery</label>
                <select
                    name="page_id"
                    value={formData.page_id || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono appearance-none"
                    required
                >
                    <option value="">-- SELECT A FACEBOOK PAGE --</option>
                    {availablePages?.map(page => (
                        <option key={page.id} value={page.id}>{page.name}</option>
                    ))}
                </select>
                {availablePages?.length === 0 && (
                    <p className="text-xs font-mono text-yellow-500 mt-2 uppercase tracking-wider">! No pages found. Connect your Meta account.</p>
                )}
            </div>
        </div>
    );
};

export const TargetingSection = ({ formData, handleInputChange }) => {
    const targeting = formData.targeting || { age_min: 18, age_max: 65, gender: 'ALL', locations: '' };

    const handleTargetingChange = (e) => {
        handleInputChange({
            target: {
                name: 'targeting',
                value: {
                    ...targeting,
                    [e.target.name]: e.target.value
                }
            }
        });
    };

    return (
        <div className="border-t-2 border-[#333333] pt-6">
            <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider font-mono flex items-center gap-3">
                <span className="w-2 h-2 bg-[#26cece]"></span>
                Audience Targeting
            </h3>
            <div className="space-y-6 bg-[#111111] p-6 border-2 border-[#333333]">

                {/* Locations */}
                <div>
                    <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Locations</label>
                    <input
                        type="text"
                        name="locations"
                        value={targeting.locations || ''}
                        onChange={handleTargetingChange}
                        placeholder="e.g. INDIA, US, LONDON (COMMA SEPARATED)"
                        className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                    />
                </div>

                {/* Age Range */}
                <div className="flex gap-6">
                    <div className="flex-1">
                        <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Min Age</label>
                        <input
                            type="number"
                            name="age_min"
                            value={targeting.age_min || 18}
                            onChange={handleTargetingChange}
                            min="13" max="65"
                            className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Max Age</label>
                        <input
                            type="number"
                            name="age_max"
                            value={targeting.age_max || 65}
                            onChange={handleTargetingChange}
                            min="13" max="65"
                            className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                        />
                    </div>
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Gender</label>
                    <select
                        name="gender"
                        value={targeting.gender || 'ALL'}
                        onChange={handleTargetingChange}
                        className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono appearance-none"
                    >
                        <option value="ALL">ALL GENDERS</option>
                        <option value="MALE">MEN</option>
                        <option value="FEMALE">WOMEN</option>
                    </select>
                </div>

                {/* Interests */}
                <div>
                    <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Detailed Targeting (Interests)</label>
                    <textarea
                        name="interests"
                        value={targeting.interests || ''}
                        onChange={handleTargetingChange}
                        placeholder="e.g. TECHNOLOGY, DIGITAL MARKETING, E-COMMERCE"
                        className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono h-24 resize-none"
                    />
                </div>
            </div>
        </div>
    );
};

export const CreativeAssetsSection = ({ formData, handleInputChange, showDestination = false, onOpenGraphicModal }) => {
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
        <div className="border-t-2 border-[#333333] pt-6">
            <h3 className="text-lg font-bold mb-6 text-white uppercase tracking-wider font-mono flex items-center gap-3">
                <span className="w-2 h-2 bg-[#26cece]"></span>
                Creative Assets
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Headline</label>
                    <input
                        type="text"
                        name="headline"
                        value={formData.creative_assets?.headline || ''}
                        onChange={(e) => handleInputChange(e, 'creative_assets')}
                        className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.creative_assets?.description || ''}
                        onChange={(e) => handleInputChange(e, 'creative_assets')}
                        className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono h-24 resize-none"
                    />
                </div>

                {/* Media Selection Tabs */}
                <div className="space-y-4">
                    <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Media Asset</label>
                    <div className="flex bg-[#111111] border-2 border-[#333333] w-fit">
                        <button
                            onClick={(e) => { e.preventDefault(); setActiveTab('upload'); }}
                            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all border-r-2 border-[#333333] last:border-r-0 ${activeTab === 'upload' ? 'bg-[#26cece] text-black' : 'text-gray-400 hover:text-white hover:bg-[#333333]'}`}
                        >
                            <ImageIcon size={16} /> Upload Image
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); setActiveTab('video'); }}
                            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all border-r-2 border-[#333333] last:border-r-0 ${activeTab === 'video' ? 'bg-[#26cece] text-black' : 'text-gray-400 hover:text-white hover:bg-[#333333]'}`}
                        >
                            <Film size={16} /> Upload Video
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); setActiveTab('url'); }}
                            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all border-r-2 border-[#333333] last:border-r-0 ${activeTab === 'url' ? 'bg-[#26cece] text-black' : 'text-gray-400 hover:text-white hover:bg-[#333333]'}`}
                        >
                            <Link size={16} /> Image URL
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); setActiveTab('generated'); }}
                            className={`px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all border-r-2 border-[#333333] last:border-r-0 ${activeTab === 'generated' ? 'bg-[#26cece] text-black' : 'text-gray-400 hover:text-white hover:bg-[#333333]'}`}
                        >
                            <ImageIcon size={16} /> Generated Library
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
                                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Image URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        value={formData.creative_assets?.imageUrl || ''}
                                        onChange={(e) => handleInputChange(e, 'creative_assets')}
                                        placeholder="HTTPS://..."
                                        className="flex-1 px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                                    />
                                </div>
                                {formData.creative_assets?.imageUrl && (
                                    <div className="mt-4 border-2 border-[#333333] bg-[#070707] h-40 w-full relative">
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

                        {activeTab === 'generated' && (
                            <div className="border-2 border-dashed border-[#26cece] bg-[#26cece]/10 p-6 text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-[#26cece] mb-3" />
                                <h4 className="text-lg font-bold text-white uppercase tracking-wider font-mono mb-2">Select from Generated Graphics</h4>
                                <p className="text-xs font-mono text-gray-400 mb-6 uppercase tracking-wider">
                                    Choose a flyer you created with the Graphic Generator.
                                </p>
                                <button
                                    onClick={(e) => { e.preventDefault(); onOpenGraphicModal?.(); }}
                                    className="px-6 py-3 bg-[#26cece] hover:bg-[#111111] text-black hover:text-[#26cece] border-2 border-[#26cece] font-mono font-bold uppercase tracking-wider transition-colors inline-block"
                                >
                                    OPEN LIBRARY
                                </button>
                                {formData.creative_assets?.imageUrl && formData.creative_assets.imageUrl.includes('flyer_') && (
                                    <div className="mt-6 pt-6 border-t-2 border-[#26cece]/30">
                                        <p className="text-xs font-bold font-mono text-[#26cece] uppercase tracking-wider mb-2">SELECTED GRAPHIC:</p>
                                        <div className="h-32 inline-block border-2 border-[#26cece] bg-[#070707]">
                                            <img
                                                src={formData.creative_assets.imageUrl}
                                                alt="Selected"
                                                className="h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Removed raw Image URL input from here, moved to tab above */}
                    {showDestination && (
                        <div>
                            <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Destination URL</label>
                            <input
                                type="text"
                                name="destination_url"
                                value={formData.destination_url || ''}
                                onChange={handleInputChange}
                                placeholder="HTTPS://YOUR-SITE.COM"
                                className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 1. Awareness Form
export const AwarenessForm = ({ formData, handleInputChange, onOpenGraphicModal, availablePages }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange} availablePages={availablePages}>
        <div className="bg-[#111111] border-l-4 border-[#26cece] p-4 mb-6">
            <p className="text-sm font-mono text-gray-300">
                <strong className="text-white uppercase">Goal:</strong> Maximize brand visibility. Ads will be shown to people most likely to remember them.
            </p>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} onOpenGraphicModal={onOpenGraphicModal} />
    </CampaignFormBase>
);

// 2. Traffic Form
export const TrafficForm = ({ formData, handleInputChange, onOpenGraphicModal, availablePages }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange} availablePages={availablePages}>
        <div className="bg-[#111111] border-l-4 border-[#ce2626] p-4 mb-6">
            <p className="text-sm font-mono text-gray-300">
                <strong className="text-white uppercase">Goal:</strong> Drive clicks to a website or landing page.
            </p>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} showDestination={true} onOpenGraphicModal={onOpenGraphicModal} />
    </CampaignFormBase>
);

// 3. Engagement Form
export const EngagementForm = ({ formData, handleInputChange, onOpenGraphicModal, availablePages }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange} availablePages={availablePages}>
        <div>
            <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Engagement Type</label>
            <select
                name="engagement_type" // Needs handling in parent or specialized state
                className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono appearance-none"
            >
                <option value="post_engagement">POST LIKES/COMMENTS</option>
                <option value="page_likes">PAGE LIKES</option>
                <option value="event_responses">EVENT RESPONSES</option>
            </select>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} onOpenGraphicModal={onOpenGraphicModal} />
    </CampaignFormBase>
);

// 4. Lead Gen Form
export const LeadGenForm = ({ formData, handleInputChange, onOpenGraphicModal, availablePages }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange} availablePages={availablePages}>
        <div>
            <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Lead Form Type</label>
            <select
                className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono appearance-none"
            >
                <option value="instant_form">INSTANT FORM (ON-FACEBOOK)</option>
                <option value="messenger_automated">MESSENGER AUTOMATED CHAT</option>
            </select>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} onOpenGraphicModal={onOpenGraphicModal} />
    </CampaignFormBase>
);

// 5. Sales / Conversion Form
export const SalesForm = ({ formData, handleInputChange, onOpenGraphicModal, availablePages }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange} availablePages={availablePages}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Conversion Event</label>
                <select
                    className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono appearance-none"
                >
                    <option value="purchase">PURCHASE</option>
                    <option value="add_to_cart">ADD TO CART</option>
                    <option value="initiate_checkout">INITIATE CHECKOUT</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Product Catalog ID</label>
                <input
                    type="text"
                    placeholder="OPTIONAL"
                    className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                />
            </div>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} showDestination={true} onOpenGraphicModal={onOpenGraphicModal} />
    </CampaignFormBase>
);

// 6. App Promotion Form
export const AppPromotionForm = ({ formData, handleInputChange, onOpenGraphicModal, availablePages }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange} availablePages={availablePages}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">App Name</label>
                <input
                    type="text"
                    name="app_name"
                    value={formData.app_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">App Store / Play Store URL</label>
                <input
                    type="text"
                    name="app_store_url"
                    value={formData.app_store_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                    required
                />
            </div>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} onOpenGraphicModal={onOpenGraphicModal} />
    </CampaignFormBase>
);

// 7. Local Business Form
export const LocalBusinessForm = ({ formData, handleInputChange, onOpenGraphicModal, availablePages }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange} availablePages={availablePages}>
        <div>
            <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Business Address</label>
            <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="123 MAIN ST, CITY, ZIP"
                className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                required
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Call to Action Type</label>
                <select
                    name="cta_type"
                    value={formData.cta_type || 'get_directions'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono appearance-none"
                >
                    <option value="get_directions">GET DIRECTIONS</option>
                    <option value="call_now">CALL NOW</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Radius (km)</label>
                <input
                    type="number"
                    name="radius_km"
                    value={formData.radius_km || 5}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                />
            </div>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} onOpenGraphicModal={onOpenGraphicModal} />
    </CampaignFormBase>
);

// 8. Remarketing Form
export const RemarketingForm = ({ formData, handleInputChange, onOpenGraphicModal, availablePages }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange} availablePages={availablePages}>
        <div>
            <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Target Audience Source</label>
            <select
                className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono appearance-none"
            >
                <option value="website_visitors">WEBSITE VISITORS (LAST 30 DAYS)</option>
                <option value="past_customers">PAST CUSTOMERS</option>
                <option value="engagers">VIDEO VIEWERS / PAGE ENGAGERS</option>
            </select>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} showDestination={true} onOpenGraphicModal={onOpenGraphicModal} />
    </CampaignFormBase>
);

// 9. Offer / Event Form
export const OfferEventForm = ({ formData, handleInputChange, onOpenGraphicModal, availablePages }) => (
    <CampaignFormBase formData={formData} handleInputChange={handleInputChange} availablePages={availablePages}>
        <div>
            <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Campaign Sub-Type</label>
            <select
                name="subtype" // needs handling
                className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono appearance-none"
            >
                <option value="offer">SPECIAL OFFER / DISCOUNT</option>
                <option value="event">EVENT PROMOTION</option>
            </select>
        </div>

        {/* Simplified conditional rendering assumes 'offer' for now or generic inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Offer Title / Event Name</label>
                <input
                    type="text"
                    name="offer_title"
                    value={formData.offer_title || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                />
            </div>
            <div>
                <label className="block text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">Details (Date/Discount)</label>
                <input
                    type="text"
                    name="offer_details"
                    value={formData.offer_details || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 20% OFF OR DEC 25TH 2024"
                    className="w-full px-4 py-3 border-2 border-[#333333] bg-[#070707] text-white focus:border-[#26cece] focus:outline-none transition-colors font-mono"
                />
            </div>
        </div>
        <CreativeAssetsSection formData={formData} handleInputChange={handleInputChange} />
    </CampaignFormBase>
);
