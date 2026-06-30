import React, { useState } from 'react';
import { Save, Building2, MessageSquare, Target } from 'lucide-react';

const BrandConfigForm = ({ onSave, initialData }) => {
    const [formData, setFormData] = useState({
        brand_name: '',
        brand_tone: '',
        brand_niche: '',
        brand_website_url: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (onSave) {
                await onSave(formData);
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider mb-2">Brand Configuration</h2>
                <p className="text-teal-50/70 text-sm font-mono">Set up your brand guidelines so the AI Agent can generate content in your voice.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="flex items-center text-sm font-mono text-white/80 mb-2">
                        <Building2 className="w-4 h-4 mr-2 text-[#26cece]" />
                        Brand Name
                    </label>
                    <input
                        type="text"
                        name="brand_name"
                        value={formData.brand_name}
                        onChange={handleChange}
                        placeholder="e.g. Bitlance"
                        required
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#26cece] focus:ring-1 focus:ring-[#26cece]/50 transition-all font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-mono text-white/80 mb-2">
                        <MessageSquare className="w-4 h-4 mr-2 text-[#26cece]" />
                        Brand Tone
                    </label>
                    <input
                        type="text"
                        name="brand_tone"
                        value={formData.brand_tone}
                        onChange={handleChange}
                        placeholder="e.g. Professional yet conversational, slightly witty"
                        required
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#26cece] focus:ring-1 focus:ring-[#26cece]/50 transition-all font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-mono text-white/80 mb-2">
                        <Target className="w-4 h-4 mr-2 text-[#26cece]" />
                        Brand Niche
                    </label>
                    <input
                        type="text"
                        name="brand_niche"
                        value={formData.brand_niche}
                        onChange={handleChange}
                        placeholder="e.g. B2B SaaS for Real Estate Agencies"
                        required
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#26cece] focus:ring-1 focus:ring-[#26cece]/50 transition-all font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-mono text-white/80 mb-2">
                        <Building2 className="w-4 h-4 mr-2 text-[#26cece]" />
                        Brand Website URL
                    </label>
                    <input
                        type="url"
                        name="brand_website_url"
                        value={formData.brand_website_url}
                        onChange={handleChange}
                        placeholder="e.g. https://www.bitlance.com"
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#26cece] focus:ring-1 focus:ring-[#26cece]/50 transition-all font-mono text-sm"
                    />
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center justify-center w-full px-6 py-3 bg-[#26cece] hover:bg-[#1db8b8] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold font-mono text-sm uppercase tracking-wider rounded-xl transition-all"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Brand Config
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BrandConfigForm;
