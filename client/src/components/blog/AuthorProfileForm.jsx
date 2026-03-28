import React, { useState } from 'react';
import { User, Briefcase, FileText, Image, Globe, Mail, Phone, Facebook, Twitter, Linkedin, Upload, Loader2, X } from 'lucide-react';
import { supabase } from "../../services/supabaseClient";

const AuthorProfileForm = ({ formData, setFormData, showSaveOption = true, saveAsProfile, setSaveAsProfile }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            social_links: {
                ...prev.social_links,
                [name]: value
            }
        }));
    };

    const handleImageUpload = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            setUploading(true);
            setUploadError(null);

            const fileExt = file.name.split('.').pop();
            const fileName = `profile-${Math.random()}.${fileExt}`;
            const filePath = `profiles/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({
                ...prev,
                profile_image: data.publicUrl
            }));

        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            profile_image: ""
        }));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">
                        Author Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            className="w-full pl-10 px-4 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">
                        Role / Title
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            placeholder="e.g. Senior Editor"
                            className="w-full pl-10 px-4 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">
                    Bio
                </label>
                <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-500" size={18} />
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Short biography..."
                        rows="3"
                        className="w-full pl-10 px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600 custom-scrollbar"
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">
                    Profile Image
                </label>

                {formData.profile_image ? (
                    <div className="flex items-center gap-4 p-3 bg-[#111111] rounded-[2px] border border-[#333]">
                        <img
                            src={formData.profile_image}
                            alt="Profile"
                            className="w-16 h-16 rounded-[2px] object-cover shadow-sm"
                        />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[12px] font-mono tracking-widest uppercase text-white truncate">Image Uploaded</p>
                            <button
                                type="button"
                                onClick={removeImage}
                                className="text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-red-400 flex items-center gap-1 mt-2"
                            >
                                <X size={12} /> Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            className="hidden"
                            id="profile-image-upload"
                        />
                        <label
                            htmlFor="profile-image-upload"
                            className={`flex flex-col items-center justify-center gap-2 w-full p-4 rounded-[2px] border-2 border-dashed cursor-pointer transition-colors ${uploading
                                    ? 'bg-[#111111] border-[#333] cursor-not-allowed'
                                    : 'bg-[#070707] border-[#333] hover:border-[#26cece] hover:bg-[#111111]'
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin text-gray-500" size={20} />
                                    <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mt-2">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="text-[#26cece]" size={20} />
                                    <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mt-2">Click to upload photo</span>
                                </>
                            )}
                        </label>
                        {uploadError && (
                            <p className="text-[10px] font-mono uppercase tracking-widest text-red-500 mt-2">{uploadError}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Social Links */}
            <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-3">
                    Social Links (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Facebook className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            type="text"
                            name="facebook"
                            value={formData.social_links?.facebook || ''}
                            onChange={handleSocialChange}
                            placeholder="Facebook URL"
                            className="w-full pl-9 px-3 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                    <div className="relative">
                        <Twitter className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            type="text"
                            name="twitter"
                            value={formData.social_links?.twitter || ''}
                            onChange={handleSocialChange}
                            placeholder="Twitter/X URL"
                            className="w-full pl-9 px-3 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                    <div className="relative">
                        <Linkedin className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            type="text"
                            name="linkedin"
                            value={formData.social_links?.linkedin || ''}
                            onChange={handleSocialChange}
                            placeholder="LinkedIn URL"
                            className="w-full pl-9 px-3 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                    <div className="relative">
                        <Globe className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            type="text"
                            name="website"
                            value={formData.social_links?.website || ''}
                            onChange={handleSocialChange}
                            placeholder="Website URL"
                            className="w-full pl-9 px-3 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            type="text"
                            name="email"
                            value={formData.social_links?.email || ''}
                            onChange={handleSocialChange}
                            placeholder="Email Address"
                            className="w-full pl-9 px-3 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            type="text"
                            name="phone"
                            value={formData.social_links?.phone || ''}
                            onChange={handleSocialChange}
                            placeholder="Phone Number"
                            className="w-full pl-9 px-3 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                </div>
            </div>

            {showSaveOption && (
                <div className="flex items-center gap-3 pt-4 border-t border-[#333] mt-2">
                    <input
                        type="checkbox"
                        id="saveAsProfile"
                        checked={saveAsProfile}
                        onChange={(e) => setSaveAsProfile(e.target.checked)}
                        className="w-4 h-4 bg-[#070707] border-[#333] text-[#26cece] focus:ring-0 rounded-[2px]"
                    />
                    <label htmlFor="saveAsProfile" className="text-[12px] font-mono tracking-widest uppercase text-gray-400 cursor-pointer">
                        Save this as a new Author Profile for future use
                    </label>
                </div>
            )}
        </div>
    );
};

export default AuthorProfileForm;
