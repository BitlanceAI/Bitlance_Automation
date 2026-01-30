import React, { useState } from 'react';
import { User, Briefcase, FileText, Image, Globe, Mail, Phone, Facebook, Twitter, Linkedin, Upload, Loader2, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

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
            profile_image: ''
        }));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                        Author Name *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            className="w-full pl-10 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                        Role / Title
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            placeholder="e.g. Senior Editor"
                            className="w-full pl-10 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Bio
                </label>
                <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Short biography..."
                        rows="3"
                        className="w-full pl-10 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Profile Image
                </label>

                {formData.profile_image ? (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700">
                        <img
                            src={formData.profile_image}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm"
                        />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Image Uploaded</p>
                            <button
                                type="button"
                                onClick={removeImage}
                                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 mt-1"
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
                            className={`flex items-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${uploading
                                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                                    : 'bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin text-gray-500" size={20} />
                                    <span className="text-gray-500 text-sm">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="text-gray-400" size={20} />
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">Click to upload photo</span>
                                </>
                            )}
                        </label>
                        {uploadError && (
                            <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Social Links */}
            <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Social Links (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                        <Facebook className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            name="facebook"
                            value={formData.social_links?.facebook || ''}
                            onChange={handleSocialChange}
                            placeholder="Facebook URL"
                            className="w-full pl-10 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                        <Twitter className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            name="twitter"
                            value={formData.social_links?.twitter || ''}
                            onChange={handleSocialChange}
                            placeholder="Twitter/X URL"
                            className="w-full pl-10 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                        <Linkedin className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            name="linkedin"
                            value={formData.social_links?.linkedin || ''}
                            onChange={handleSocialChange}
                            placeholder="LinkedIn URL"
                            className="w-full pl-10 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                        <Globe className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            name="website"
                            value={formData.social_links?.website || ''}
                            onChange={handleSocialChange}
                            placeholder="Website URL"
                            className="w-full pl-10 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            name="email"
                            value={formData.social_links?.email || ''}
                            onChange={handleSocialChange}
                            placeholder="Email Address"
                            className="w-full pl-10 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            name="phone"
                            value={formData.social_links?.phone || ''}
                            onChange={handleSocialChange}
                            placeholder="Phone Number"
                            className="w-full pl-10 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {showSaveOption && (
                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="saveAsProfile"
                        checked={saveAsProfile}
                        onChange={(e) => setSaveAsProfile(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="saveAsProfile" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Save this as a new Author Profile for future use
                    </label>
                </div>
            )}
        </div>
    );
};

export default AuthorProfileForm;
