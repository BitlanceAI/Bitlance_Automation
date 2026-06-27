import React from 'react';
import { Plus, Users, Linkedin, LogOut, Facebook, Instagram } from 'lucide-react';

const XIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const ProfileListCard = ({ profile, handleDisconnect }) => (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-5 flex items-center gap-5 hover:-translate-y-1 hover:shadow-[0_4px_24px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all duration-300">
        <div className="relative">
            {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/10" />
            ) : (
                <div className="w-14 h-14 -[2px] bg-white/5 backdrop-blur-md flex items-center justify-center text-xl font-bold font-mono text-white/60 border-2 border-white/10 rounded-2xl">
                    {profile.name?.charAt(0)}
                </div>
            )}
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[#115e59] shadow-md border-2 border-[#111111] ${profile.platform === 'linkedin' ? 'bg-[#26cece]' : profile.platform === 'twitter' ? 'bg-white' : 'bg-[#26cece]'}`}>
                {profile.platform === 'linkedin' ? <Linkedin className="w-3 h-3 fill-current" /> : profile.platform === 'twitter' ? <XIcon className="w-3 h-3" /> : <Facebook className="w-3 h-3 fill-current" />}
            </div>
        </div>
        <div className="flex-1">
            <h3 className="text-white font-bold font-['Space_Grotesk'] text-[16px] tracking-tight">{profile.name}</h3>
            <p className="text-white/80 font-mono text-[11px] uppercase tracking-widest mt-0.5">{profile.type}</p>
            <div className="flex items-center gap-4 mt-2">
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-mono flex items-center gap-1.5 bg-white/5 backdrop-blur-md border border-white/10 -[2px] px-2.5 py-1 rounded-2xl">
                    {profile.platform === 'linkedin' ? <Linkedin className="w-3 h-3" /> : profile.platform === 'twitter' ? <XIcon className="w-3 h-3" /> : <Facebook className="w-3 h-3" />}
                    {profile.followers}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#26cece] flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-2xl bg-[#26cece]"></div>
                    Active
                </span>
            </div>
        </div>
        <button onClick={() => handleDisconnect(profile)} className="text-white/60 hover:text-red-400 p-2 transition-colors cursor-pointer rounded-2xl border border-transparent hover:border-red-400 hover:bg-red-400/10" title="Disconnect">
            <LogOut className="w-4 h-4" />
        </button>
    </div>
);

const SocialProfilesView = ({ connectedProfiles, setIsAddProfileModalOpen, handleDisconnect }) => {
    return (
        <div className="flex-1 p-8 bg-white/5 backdrop-blur-md overflow-y-auto w-full rounded-2xl">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight">Social Profiles</h2>
                        <p className="text-sm font-mono text-white/80 mt-1 uppercase tracking-widest">Manage your connected social accounts</p>
                    </div>
                    <button
                        onClick={() => setIsAddProfileModalOpen(true)}
                        className="bg-[#26cece] text-[#115e59] border border-transparent px-5 py-2.5 rounded-full font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333] transition-all duration-200 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Profile
                    </button>
                </div>

                {connectedProfiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/10 border border-white/10 rounded-2xl">
                        <div className="w-16 h-16 bg-white/5 backdrop-blur-md border border-white/10 -[2px] flex items-center justify-center mb-4 rounded-2xl">
                            <Users className="w-8 h-8 text-[#26cece]" />
                        </div>
                        <h3 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight mb-2">No profiles connected yet</h3>
                        <p className="text-sm font-sans text-white/80 mb-6 text-center max-w-sm">Connect your LinkedIn or Facebook account to start managing your social media.</p>
                        <button
                            onClick={() => setIsAddProfileModalOpen(true)}
                            className="bg-[#26cece] text-[#115e59] px-5 py-2.5 rounded-full font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333] transition-all duration-200 flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Connect a profile
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {connectedProfiles.map((profile, idx) => (
                            <ProfileListCard key={idx} profile={profile} handleDisconnect={handleDisconnect} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialProfilesView;
