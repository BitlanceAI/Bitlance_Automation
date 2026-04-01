import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
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
                    setMode('manual'); // Default to manual if no profiles
                }
            }
        } catch (error) {
            console.error("Error fetching WordPress profiles:", error);
        } finally {
            setLoadingProfiles(false);
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
                        <select
                            value={selectedProfileId}
                            onChange={(e) => setSelectedProfileId(e.target.value)}
                            className="w-full px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] outline-none focus:ring-0 focus:border-[#26cece] text-white font-mono text-[14px] transition-all"
                        >
                            {profiles.map(profile => (
                                <option key={profile.id} value={profile.id}>
                                    {profile.name} - {profile.wp_url}
                                </option>
                            ))}
                        </select>
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
