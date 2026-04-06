import React from 'react';
import { Globe, User, Key, Link } from 'lucide-react';

const WordPressProfileForm = ({ formData, setFormData, showSaveOption = true, saveAsProfile, setSaveAsProfile }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="space-y-4">
            {showSaveOption && (
                <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">
                        Profile Nickname *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            placeholder="e.g. My Main Site"
                            className="w-full pl-10 px-4 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                </div>
            )}

            <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">
                    WordPress Site URL *
                </label>
                <div className="relative">
                    <Globe className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                        type="url"
                        name="wp_url"
                        value={formData.wp_url || ''}
                        onChange={handleChange}
                        placeholder="https://yoursite.com"
                        className="w-full pl-10 px-4 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">
                        WordPress Username *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            name="wp_username"
                            value={formData.wp_username || ''}
                            onChange={handleChange}
                            placeholder="e.g. admin"
                            className="w-full pl-10 px-4 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">
                        Application Password *
                    </label>
                    <div className="relative">
                        <Key className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input
                            type="password"
                            name="wp_app_password"
                            value={formData.wp_app_password || ''}
                            onChange={handleChange}
                            placeholder="xxxx xxxx xxxx xxxx"
                            className="w-full pl-10 px-4 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">
                    Interlinking URL <span className="normal-case text-gray-600">(optional — overrides site URL for internal links)</span>
                </label>
                <div className="relative">
                    <Link className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                        type="url"
                        name="interlink_url"
                        value={formData.interlink_url || ''}
                        onChange={handleChange}
                        placeholder="https://yoursite.com (if different from WP URL)"
                        className="w-full pl-10 px-4 py-2.5 rounded-[2px] bg-[#070707] border border-[#333] focus:ring-0 focus:border-[#26cece] outline-none transition-all text-white font-mono text-[14px] placeholder-gray-600"
                    />
                </div>
            </div>

            {showSaveOption && (
                <div className="flex items-center gap-3 pt-4 border-t border-[#333] mt-2">
                    <input
                        type="checkbox"
                        id="saveAsProfile"
                        checked={saveAsProfile}
                        onChange={(e) => setSaveAsProfile(e.target.checked)}
                        className="w-4 h-4 bg-[#070707] border-[#333] text-[#26cece] focus:ring-0 rounded-[2px] cursor-pointer"
                    />
                    <label htmlFor="saveAsProfile" className="text-[12px] font-mono tracking-widest uppercase text-gray-400 cursor-pointer">
                        Save this WordPress connection for future use
                    </label>
                </div>
            )}
        </div>
    );
};

export default WordPressProfileForm;
