import React from 'react';
import { FolderKanban } from 'lucide-react';
import { useMetaAds } from './MetaAdsLayout';
import CampaignManagerPage from '../CampaignManagerPage';

const MetaInternalCampaignsPage = () => {
    const { isConnected } = useMetaAds();

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="mb-8 border-b border-[#333] pb-6">
                <h2 className="text-3xl font-extrabold text-white font-['Space_Grotesk'] uppercase tracking-tight">Internal Infrastructure</h2>
                <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-1">&gt; Manage your platform-side tactical funnels and internal pipelines</p>
            </div>
            <div className="bg-[#070707] border border-[#333] min-h-[60vh]">
                <CampaignManagerPage embedded={true} />
            </div>
        </div>
    );
};

export default MetaInternalCampaignsPage;
