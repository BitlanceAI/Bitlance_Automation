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
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center bg-[#070707] font-mono">
                <div className="w-20 h-20 mb-6 bg-[#111111] border border-[#333] flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform shadow-[4px_4px_0_0_#26cece]">
                    <Target className="h-10 w-10 text-[#26cece]" />
                </div>
                <h3 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight mb-2">Not Connected</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">&gt; Establish a Meta link to access network campaigns.</p>
                <button
                    onClick={() => setShowConnectModal(true)}
                    className="px-6 py-3 rounded-[2px] bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] border border-[#070707] hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-1 transition-all"
                >
                    Initialize Connection
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-[#333] pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-white font-['Space_Grotesk'] uppercase tracking-tight">Active Operations</h2>
                    <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-1">Manage and monitor your deployed Meta ad sequences</p>
                </div>
                {/* Filter pills */}
                <div className="flex flex-wrap gap-2 p-1 bg-[#111111] border border-[#333]">
                    {['all', 'ACTIVE', 'PAUSED', 'SCHEDULED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-none text-[10px] uppercase font-mono tracking-widest font-bold transition-all border ${filter === s
                                    ? 'bg-[#26cece] border-[#070707] text-[#070707] shadow-[2px_2px_0_0_#333] -translate-y-0.5'
                                    : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:border-[#333]'
                                }`}
                        >
                            {s === 'all' ? 'All NETWORKS' : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaign list */}
            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-[#111111] border border-dashed border-[#333] relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <div className="relative z-10 w-20 h-20 mx-auto mb-6 bg-[#070707] border border-[#333] flex items-center justify-center transform rotate-3 shadow-[4px_4px_0_0_#333] group-hover:border-[#26cece] group-hover:shadow-[4px_4px_0_0_#26cece] transition-all">
                        <Target className="h-8 w-8 text-gray-600 group-hover:text-[#26cece] transition-colors" />
                    </div>
                    <h3 className="relative z-10 text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight mb-2">Operation Blank</h3>
                    <p className="relative z-10 text-gray-500 font-mono text-sm max-w-sm mx-auto">
                        {campaigns.length === 0
                            ? '> No deployment signatures detected in Meta Business Suite.'
                            : '> No results match current filter parameters.'}
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
                                className="group relative bg-[#070707] border border-[#333] p-6 transition-all duration-300 hover:border-[#26cece] hover:shadow-[4px_4px_0_0_#26cece] hover:-translate-y-1 block"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    <div className="flex-1 border-l-2 border-transparent group-hover:border-[#26cece] pl-4 transition-colors">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h3 className="font-extrabold font-['Space_Grotesk'] text-xl uppercase tracking-tight text-white">{campaign.name}</h3>
                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-mono font-bold tracking-widest uppercase ${statusConfig.bg === 'bg-emerald-500/10' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30' : statusConfig.bg === 'bg-amber-500/10' ? 'border-amber-500 text-amber-400 bg-amber-950/30' : 'border-blue-500 text-blue-400 bg-blue-950/30'}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusConfig.label}
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500">Obj: {campaign.objective || 'N/A'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8 bg-[#111111] p-4 border border-[#1E1E1E]">
                                        {[
                                            { label: 'SPENT', value: `₹${spent.toFixed(2)}` },
                                            { label: 'VIEWS', value: parseInt(campaign.insights?.impressions || 0).toLocaleString() },
                                            { label: 'CLICKS', value: parseInt(campaign.insights?.clicks || 0).toLocaleString() },
                                            { label: 'CTR', value: `${parseFloat(campaign.insights?.ctr || 0).toFixed(2)}%`, highlight: true },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <p className="text-[10px] uppercase font-mono tracking-widest text-gray-600 mb-1">{item.label}</p>
                                                <p className={`text-lg font-mono font-bold tracking-tight ${item.highlight ? 'text-[#26cece]' : 'text-white'}`}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setSelectedCampaign(campaign); setShowDetails(true); }}
                                            className="p-3 bg-[#111111] border border-[#333] hover:border-white hover:bg-white text-gray-400 hover:text-[#070707] transition-all"
                                            title="View Data Matrix"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedCampaign(campaign); setShowAnalytics(true); }}
                                            className="p-3 bg-[#111111] border border-[#333] hover:border-[#26cece] hover:bg-[#26cece] text-gray-400 hover:text-[#070707] transition-all"
                                            title="Telemetry"
                                        >
                                            <BarChart3 className="h-4 w-4" />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111111] border border-[#333] shadow-[8px_8px_0_0_#26cece] w-full max-w-3xl max-h-[90vh] flex flex-col font-mono">
                        <div className="p-4 md:p-6 border-b border-[#333] flex justify-between items-center sticky top-0 bg-[#070707]">
                            <h3 className="text-xl md:text-2xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight text-white border-l-4 border-[#26cece] pl-3">Data Matrix // Detail</h3>
                            <button onClick={() => setShowDetails(false)} className="p-2 border border-transparent hover:border-[#333] hover:bg-red-500/10 hover:text-red-500 text-gray-500 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(selectedCampaign).map(([key, value]) => {
                                    if (key === 'insights' || typeof value === 'object') return null;
                                    return (
                                        <div key={key} className="p-4 bg-[#070707] border border-[#1E1E1E] hover:border-[#333] transition-colors">
                                            <p className="text-[10px] text-[#26cece] uppercase tracking-widest font-bold mb-2">{key.replace(/_/g, ' ')}</p>
                                            <p className="text-white text-sm break-all">{String(value)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {showAnalytics && selectedCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111111] border border-[#333] shadow-[8px_8px_0_0_#26cece] w-full max-w-4xl max-h-[90vh] flex flex-col font-mono">
                        <div className="p-4 md:p-6 border-b border-[#333] flex justify-between items-center sticky top-0 bg-[#070707]">
                            <div>
                                <h3 className="text-xl md:text-2xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight text-white border-l-4 border-[#26cece] pl-3">Network Telemetry</h3>
                                <p className="text-[10px] uppercase font-mono tracking-widest text-[#26cece] pl-4 mt-1">{selectedCampaign.name}</p>
                            </div>
                            <button onClick={() => setShowAnalytics(false)} className="p-2 border border-transparent hover:border-[#333] hover:bg-red-500/10 hover:text-red-500 text-gray-500 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-[#111111]">
                            {selectedCampaign.insights ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { label: 'CAPITAL SPENT', value: `₹${parseFloat(selectedCampaign.insights.spend || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-400', border: 'border-emerald-500' },
                                        { label: 'TOTAL VIEWS', value: parseInt(selectedCampaign.insights.impressions || 0).toLocaleString(), icon: Eye, color: 'text-blue-400', border: 'border-blue-500' },
                                        { label: 'ENGAGEMENTS', value: parseInt(selectedCampaign.insights.clicks || 0).toLocaleString(), icon: MousePointer, color: 'text-violet-400', border: 'border-violet-500' },
                                        { label: 'AVG CPC', value: `₹${parseFloat(selectedCampaign.insights.cpc || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-amber-400', border: 'border-amber-500' },
                                        { label: 'EFFICIENCY (CPM)', value: `₹${parseFloat(selectedCampaign.insights.cpm || 0).toFixed(2)}`, icon: BarChart3, color: 'text-rose-400', border: 'border-rose-500' },
                                        { label: 'CLICK RATIO', value: `${parseFloat(selectedCampaign.insights.ctr || 0).toFixed(2)}%`, icon: Target, color: 'text-[#26cece]', border: 'border-[#26cece]' },
                                    ].map((stat) => (
                                        <div key={stat.label} className={`p-5 bg-[#070707] border-l-2 ${stat.border} border-t border-r border-b border-[#1E1E1E]`}>
                                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#1E1E1E]">
                                                <div className="p-1 border border-[#333] bg-[#111111]">
                                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                                </div>
                                                <span className="text-[10px] font-bold tracking-widest text-gray-500">{stat.label}</span>
                                            </div>
                                            <p className="text-2xl font-extrabold font-['Space_Grotesk'] text-white tracking-tight">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-[#070707] border border-[#333] border-dashed">
                                    <BarChart3 className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                                    <p className="text-[10px] uppercase font-mono tracking-widest text-[#26cece]">&gt; No telemetry data found in data-store.</p>
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
