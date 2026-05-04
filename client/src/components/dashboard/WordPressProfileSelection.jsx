import React, { useState, useEffect } from 'react';
import { Globe, Edit3, X, CheckCircle } from 'lucide-react';
import WordPressProfileForm from "./WordPressProfileForm";
import API_BASE_URL from "../../config.js";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";

const WordPressProfileSelection = ({ onProfileSelect }) => {
    const { user } = useAuth();
    const [mode, setMode] = useState('existing'); // 'existing' or 'manual'
    const [profiles, setProfiles] = useState([]);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState('');

    // Manual form state
    const [manualData, setManualData] = useState({
        name: '',
        wp_url: '',
        wp_username: '',
        wp_app_password: ''
    });
    const [saveAsProfile, setSaveAsProfile] = useState(false);

    // Edit state
    const [editingProfile, setEditingProfile] = useState(null); // { id, name, wp_url, wp_username, wp_app_password }
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfiles();
        }
    }, [user]);

    // Propagate changes to parent
    useEffect(() => {
        if (mode === 'existing') {
            const profile = profiles.find(p => p.id === selectedProfileId);
            onProfileSelect({
                type: 'existing',
                profileId: selectedProfileId,
                profileData: profile
            });
        } else {
            onProfileSelect({
                type: 'manual',
                profileData: manualData,
                saveAsNew: saveAsProfile
            });
        }
    }, [mode, selectedProfileId, manualData, saveAsProfile, profiles]);

    const fetchProfiles = async () => {
        try {
            setLoadingProfiles(true);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${API_BASE_URL}/api/wordpress/profiles`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success && data.profiles) {
                setProfiles(data.profiles);
                if (data.profiles.length > 0) {
                    setSelectedProfileId(data.profiles[0].id);
                } else {
                    setMode('manual');
                }
            }
        } catch (error) {
            console.error("Error fetching WordPress profiles:", error);
        } finally {
            setLoadingProfiles(false);
        }
    };

    const openEdit = () => {
        const profile = profiles.find(p => p.id === selectedProfileId);
        if (!profile) return;
        setEditingProfile({ id: profile.id, name: profile.name, wp_url: profile.wp_url, wp_username: profile.wp_username, wp_app_password: '', interlink_url: profile.interlink_url || '' });
    };

    const handleUpdate = async () => {
        const { id, name, wp_url, wp_username, wp_app_password } = editingProfile;
        if (!name || !wp_url || !wp_username) return;
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const res = await fetch(`${API_BASE_URL}/api/wordpress/profiles/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, wp_url, wp_username, interlink_url: editingProfile.interlink_url || null, ...(wp_app_password ? { wp_app_password } : {}) })
            });
            const data = await res.json();
            if (data.success) {
                setProfiles(prev => prev.map(p => p.id === id ? data.profile : p));
                setEditingProfile(null);
            }
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-[#111111] rounded-[2px] p-5 border border-[#333]">
            <h3 className="text-xl font-bold mb-4 font-['Space_Grotesk'] tracking-tight text-[#26cece] flex items-center gap-2">
                <Globe size={20} className="text-[#26cece]" />
                WordPress Connection details
            </h3>

            {/* Mode Switcher */}
            <div className="flex gap-6 mb-5">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="radio"
                        name="wpProfileMode"
                        value="existing"
                        checked={mode === 'existing'}
                        onChange={() => setMode('existing')}
                        disabled={profiles.length === 0}
                        className="w-4 h-4 bg-[#070707] border-[#333] text-[#26cece] focus:ring-0 checked:bg-[#26cece] disabled:opacity-50 appearance-none rounded-full checked:border-4 checked:border-[#070707] ring-1 ring-[#333] checked:ring-[#26cece] transition-all"
                    />
                    <span className={`text-[12px] font-mono tracking-widest uppercase transition-colors ${profiles.length === 0 ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'}`}>
                        Use Saved Site
                    </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="radio"
                        name="wpProfileMode"
                        value="manual"
                        checked={mode === 'manual'}
                        onChange={() => setMode('manual')}
                        className="w-4 h-4 bg-[#070707] border-[#333] text-[#26cece] focus:ring-0 checked:bg-[#26cece] disabled:opacity-50 appearance-none rounded-full checked:border-4 checked:border-[#070707] ring-1 ring-[#333] checked:ring-[#26cece] transition-all"
                    />
                    <span className="text-[12px] font-mono tracking-widest uppercase text-gray-400 group-hover:text-white transition-colors">
                        Enter Site Details
                    </span>
                </label>
            </div>

            {mode === 'existing' ? (
                <div>
                    {loadingProfiles ? (
                        <div className="text-[12px] font-mono tracking-widest uppercase text-gray-500">Loading sites...</div>
                    ) : (
                        <>
                            <div className="flex gap-2 items-center">
                                <select
                                    value={selectedProfileId}
                                    onChange={(e) => { setSelectedProfileId(e.target.value); setEditingProfile(null); }}
                                    className="flex-1 px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] outline-none focus:ring-0 focus:border-[#26cece] text-white font-mono text-[14px] transition-all"
                                >
                                    {profiles.map(profile => (
                                        <option key={profile.id} value={profile.id}>
                                            {profile.name} - {profile.wp_url}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => editingProfile ? setEditingProfile(null) : openEdit()}
                                    className="p-3 rounded-[2px] border border-[#333] hover:border-[#26cece] text-gray-400 hover:text-[#26cece] transition-all"
                                    title="Edit credentials"
                                >
                                    {editingProfile ? <X size={16} /> : <Edit3 size={16} />}
                                </button>
                            </div>

                            {/* Inline edit form */}
                            {editingProfile && (
                                <div className="mt-4 space-y-3 border border-[#333] rounded-[2px] p-4">
                                    <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500">Edit Credentials</p>
                                    <div>
                                        <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">Profile Name</label>
                                        <input
                                            type="text"
                                            value={editingProfile.name}
                                            onChange={e => setEditingProfile(p => ({ ...p, name: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-[2px] bg-[#070707] border border-[#333] focus:border-[#26cece] outline-none text-white font-mono text-[14px]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">WordPress URL</label>
                                            <input
                                                type="url"
                                                value={editingProfile.wp_url}
                                                onChange={e => setEditingProfile(p => ({ ...p, wp_url: e.target.value }))}
                                                className="w-full px-4 py-2 rounded-[2px] bg-[#070707] border border-[#333] focus:border-[#26cece] outline-none text-white font-mono text-[14px]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">Interlinking URL <span className="text-gray-600">(optional)</span></label>
                                            <input
                                                type="url"
                                                placeholder="If different from WP URL"
                                                value={editingProfile.interlink_url}
                                                onChange={e => setEditingProfile(p => ({ ...p, interlink_url: e.target.value }))}
                                                className="w-full px-4 py-2 rounded-[2px] bg-[#070707] border border-[#333] focus:border-[#26cece] outline-none text-white font-mono text-[14px] placeholder-gray-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">Username</label>
                                            <input
                                                type="text"
                                                value={editingProfile.wp_username}
                                                onChange={e => setEditingProfile(p => ({ ...p, wp_username: e.target.value }))}
                                                className="w-full px-4 py-2 rounded-[2px] bg-[#070707] border border-[#333] focus:border-[#26cece] outline-none text-white font-mono text-[14px]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">New Password <span className="text-gray-600">(optional)</span></label>
                                            <input
                                                type="password"
                                                placeholder="Leave blank to keep"
                                                value={editingProfile.wp_app_password}
                                                onChange={e => setEditingProfile(p => ({ ...p, wp_app_password: e.target.value }))}
                                                className="w-full px-4 py-2 rounded-[2px] bg-[#070707] border border-[#333] focus:border-[#26cece] outline-none text-white font-mono text-[14px] placeholder-gray-700"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => setEditingProfile(null)}
                                            className="flex-1 py-2 rounded-[2px] border border-[#333] text-gray-400 text-[12px] font-mono tracking-widest uppercase hover:border-gray-500 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            disabled={saving}
                                            className="flex-1 py-2 rounded-[2px] bg-[#26cece] text-black text-[12px] font-mono tracking-widest uppercase font-bold hover:bg-[#1fb8b8] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {saving ? 'Saving...' : <><CheckCircle size={14} /> Save</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <WordPressProfileForm
                    formData={manualData}
                    setFormData={setManualData}
                    saveAsProfile={saveAsProfile}
                    setSaveAsProfile={setSaveAsProfile}
                />
            )}
        </div>
    );
};

export default WordPressProfileSelection;
