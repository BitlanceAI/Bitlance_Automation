import React, { useState } from 'react';
import {
    Target, PlayCircle, PauseCircle, Clock, Eye,
    BarChart3, X, TrendingUp, MousePointer, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useMetaAds } from './MetaAdsLayout';

// ── helpers ─────────────────────────────────────────────────────────────────
const getStatusConfig = (status) => {
    const configs = {
        ACTIVE: { icon: PlayCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Active' },
        PAUSED: { icon: PauseCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Paused' },
        SCHEDULED: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Scheduled' },
        pending: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Pending' },
        published: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Published' },
        failed: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed' },
    };
    return configs[status] || configs.PAUSED;
};

const MetaCampaignsPage = () => {
    const { campaigns, isConnected, setShowConnectModal } = useMetaAds();
    const [filter, setFilter] = useState('all');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const filtered = campaigns.filter(c =>
        filter === 'all' ? true : c.status?.toUpperCase() === filter.toUpperCase()
    );

    if (!isConnected) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-800 flex items-center justify-center">
                    <Target className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Not Connected</h3>
                <p className="text-gray-400 mb-6 max-w-xs">Connect your Meta account first to view your campaigns.</p>
                <button
                    onClick={() => setShowConnectModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors text-sm"
                >
                    Connect Account
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Meta Campaigns</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage and monitor your Meta ad campaigns</p>
                </div>
                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                    {['all', 'ACTIVE', 'PAUSED', 'SCHEDULED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {s === 'all' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign list */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/40 rounded-3xl border border-slate-700/50">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-slate-800 flex items-center justify-center">
                        <Target className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No campaigns found</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">
                        {campaigns.length === 0
                            ? 'Create your first Meta ad campaign in Meta Business Suite.'
                            : 'No campaigns match the selected filter.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(campaign => {
                        const statusConfig = getStatusConfig(campaign.status);
                        const StatusIcon = statusConfig.icon;
                        const spent = parseFloat(campaign.insights?.spend || 0);
                        return (
                            <div
                                key={campaign.id}
                                className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-700/50"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-semibold text-lg text-white">{campaign.name}</h3>
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {statusConfig.label}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">Objective: {campaign.objective || 'N/A'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8">
                                        {[
                                            { label: 'Spent', value: `₹${spent.toFixed(2)}` },
                                            { label: 'Impressions', value: parseInt(campaign.insights?.impressions || 0).toLocaleString() },
                                            { label: 'Clicks', value: parseInt(campaign.insights?.clicks || 0).toLocaleString() },
                                            { label: 'CTR', value: `${parseFloat(campaign.insights?.ctr || 0).toFixed(2)}%`, highlight: true },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <p className="text-xs text-gray-500">{item.label}</p>
                                                <p className={`text-lg font-semibold ${item.highlight ? 'text-emerald-400' : 'text-white'}`}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setSelectedCampaign(campaign); setShowDetails(true); }}
                                            className="p-2 rounded-xl hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedCampaign(campaign); setShowAnalytics(true); }}
                                            className="p-2 rounded-xl hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                                            title="Analytics"
                                        >
                                            <BarChart3 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Details Modal */}
            {showDetails && selectedCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800">
                            <h3 className="text-xl font-bold text-white">Campaign Details</h3>
                            <button onClick={() => setShowDetails(false)} className="p-2 rounded-lg hover:bg-slate-700 text-gray-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(selectedCampaign).map(([key, value]) => {
                                if (key === 'insights' || typeof value === 'object') return null;
                                return (
                                    <div key={key} className="p-3 bg-slate-900 rounded-xl">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{key.replace(/_/g, ' ')}</p>
                                        <p className="text-white font-medium break-all">{String(value)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {showAnalytics && selectedCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800">
                            <div>
                                <h3 className="text-xl font-bold text-white">Campaign Analytics</h3>
                                <p className="text-sm text-gray-400">{selectedCampaign.name}</p>
                            </div>
                            <button onClick={() => setShowAnalytics(false)} className="p-2 rounded-lg hover:bg-slate-700 text-gray-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {selectedCampaign.insights ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[
                                        { label: 'Spend', value: `₹${parseFloat(selectedCampaign.insights.spend || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-400' },
                                        { label: 'Impressions', value: parseInt(selectedCampaign.insights.impressions || 0).toLocaleString(), icon: Eye, color: 'text-blue-400' },
                                        { label: 'Clicks', value: parseInt(selectedCampaign.insights.clicks || 0).toLocaleString(), icon: MousePointer, color: 'text-violet-400' },
                                        { label: 'CPC', value: `₹${parseFloat(selectedCampaign.insights.cpc || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-amber-400' },
                                        { label: 'CPM', value: `₹${parseFloat(selectedCampaign.insights.cpm || 0).toFixed(2)}`, icon: BarChart3, color: 'text-rose-400' },
                                        { label: 'CTR', value: `${parseFloat(selectedCampaign.insights.ctr || 0).toFixed(2)}%`, icon: Target, color: 'text-cyan-400' },
                                    ].map((stat) => (
                                        <div key={stat.label} className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                                <span className="text-sm text-gray-400">{stat.label}</span>
                                            </div>
                                            <p className="text-xl font-bold text-white">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-400">No analytics data available for this campaign.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetaCampaignsPage;
