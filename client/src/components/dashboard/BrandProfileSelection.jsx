import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Building2, Plus, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BrandProfileSelection({ onSelect }) {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [services, setServices] = useState('');
    const [products, setProducts] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [industries, setIndustries] = useState('');
    const [usp, setUsp] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            loadProfiles();
        }
    }, [user]);

    const loadProfiles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('brand_contexts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);

            // If there's an active one, select it by default
            if (data && data.length > 0) {
                const active = data.find(p => p.is_active) || data[0];
                setSelectedId(active.id);
                onSelect(active.id);
            } else {
                onSelect(null);
            }
        } catch (error) {
            console.error('Error loading brand profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (id) => {
        setSelectedId(id);
        onSelect(id);
    };

    const handleSaveNew = async (e) => {
        e.preventDefault();
        if (!companyName.trim()) return;

        setSaving(true);
        try {
            // Unset active for others if making this active (we'll just make the new one active by default)
            await supabase
                .from('brand_contexts')
                .update({ is_active: false })
                .eq('user_id', user.id);

            const { data, error } = await supabase
                .from('brand_contexts')
                .insert([{
                    user_id: user.id,
                    company_name: companyName,
                    services: services,
                    products: products,
                    target_audience: targetAudience,
                    industries: industries,
                    usp: usp,
                    is_active: true
                }])
                .select();

            if (error) throw error;

            if (data && data[0]) {
                const newProfile = data[0];
                setProfiles([newProfile, ...profiles.map(p => ({ ...p, is_active: false }))]);
                setSelectedId(newProfile.id);
                onSelect(newProfile.id);
                setIsCreating(false);
                
                // Reset form
                setCompanyName('');
                setServices('');
                setProducts('');
                setTargetAudience('');
                setIndustries('');
                setUsp('');
            }
        } catch (error) {
            console.error('Error saving brand profile:', error);
            alert('Failed to save brand profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-slate-500 text-sm font-mono p-4 bg-slate-50 border border-slate-200 rounded-[2px]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading brand profiles...
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-[2px] p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#26cece]" />
                        Brand Knowledge Profile
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                        Select the brand/client the AI should write as. Defaults to Bitlance.
                    </p>
                </div>
                {!isCreating && (
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest uppercase text-[#26cece] hover:text-[#1fb8b8] transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                        Add New Brand
                    </button>
                )}
            </div>

            {!isCreating ? (
                <div className="space-y-2">
                    {profiles.length === 0 ? (
                        <div className="text-xs text-slate-500 font-mono italic p-3 bg-slate-50 border border-slate-100 rounded-[2px]">
                            No custom brands found. Using default Bitlance Automation profile.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {profiles.map(profile => (
                                <button
                                    key={profile.id}
                                    type="button"
                                    onClick={() => handleSelect(profile.id)}
                                    className={`text-left p-3 rounded-[2px] border transition-all ${
                                        selectedId === profile.id
                                            ? 'border-[#26cece] bg-cyan-50/30'
                                            : 'border-slate-200 hover:border-[#26cece]/50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="font-mono text-xs font-bold text-slate-900 truncate">
                                            {profile.company_name}
                                        </div>
                                        {selectedId === profile.id && (
                                            <Check className="w-3.5 h-3.5 text-[#26cece] flex-shrink-0" />
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono mt-1 truncate">
                                        {profile.industries}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSaveNew} className="p-3 bg-slate-50 border border-slate-200 rounded-[2px] space-y-3">
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1">Company Name</label>
                        <input
                            required
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Desert Homes Realty"
                            className="w-full text-xs font-mono p-2 border border-slate-200 rounded-[2px] focus:outline-none focus:border-[#26cece]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1">Services</label>
                            <input
                                required
                                type="text"
                                value={services}
                                onChange={(e) => setServices(e.target.value)}
                                placeholder="e.g. Luxury Villa Sales"
                                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-[2px] focus:outline-none focus:border-[#26cece]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1">Products</label>
                            <input
                                required
                                type="text"
                                value={products}
                                onChange={(e) => setProducts(e.target.value)}
                                placeholder="e.g. Off-plan properties"
                                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-[2px] focus:outline-none focus:border-[#26cece]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1">Industries</label>
                            <input
                                required
                                type="text"
                                value={industries}
                                onChange={(e) => setIndustries(e.target.value)}
                                placeholder="e.g. Real Estate"
                                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-[2px] focus:outline-none focus:border-[#26cece]"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1">Target Audience</label>
                            <input
                                required
                                type="text"
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                placeholder="e.g. High-Net-Worth Investors"
                                className="w-full text-xs font-mono p-2 border border-slate-200 rounded-[2px] focus:outline-none focus:border-[#26cece]"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-1">Unique Selling Proposition (USP)</label>
                        <textarea
                            required
                            value={usp}
                            onChange={(e) => setUsp(e.target.value)}
                            placeholder="e.g. We provide exclusive early access to Dubai's most luxurious off-plan villas."
                            rows={2}
                            className="w-full text-xs font-mono p-2 border border-slate-200 rounded-[2px] focus:outline-none focus:border-[#26cece] resize-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="text-xs font-bold font-mono tracking-widest uppercase px-4 py-2 bg-[#26cece] text-white rounded-[2px] hover:bg-[#1fb8b8] disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Brand'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="text-xs font-mono tracking-widest uppercase px-4 py-2 border border-slate-200 text-slate-600 rounded-[2px] hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
