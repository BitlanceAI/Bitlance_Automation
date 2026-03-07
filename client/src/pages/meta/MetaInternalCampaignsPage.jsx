import React from 'react';
import { FolderKanban } from 'lucide-react';
import { useMetaAds } from './MetaAdsLayout';
import CampaignManagerPage from '../CampaignManagerPage';

const MetaInternalCampaignsPage = () => {
    const { isConnected } = useMetaAds();

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Internal Campaigns</h2>
                <p className="text-gray-400 text-sm mt-1">Manage your platform-side campaigns and funnels</p>
            </div>
            <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 overflow-hidden">
                <CampaignManagerPage embedded={true} />
            </div>
        </div>
    );
};

export default MetaInternalCampaignsPage;
