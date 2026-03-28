import React from 'react';
import {
    Sparkles, Globe, Calendar, CreditCard, Unlink, Link2,
    Layers, PlayCircle, IndianRupee, Eye, TrendingUp,
    RefreshCw, FileText
} from 'lucide-react';
import { useMetaAds } from './MetaAdsLayout';

const MetaOverviewPage = () => {
    const {
        isConnected, connection, stats, adAccountBalance,
        refreshing, loadAdAccountBalance,
        setShowConnectModal, setShowScheduleModal, handleDisconnect
    } = useMetaAds();

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-[2px] bg-[#111111] border border-[#333] shadow-[8px_8px_0_0_#26cece] p-8 group">
                {/* Brutalist geometric overlay */}
                <div className="absolute top-0 right-0 w-64 h-64 border-[40px] border-[#26cece] opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:rotate-12 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-[#26cece] text-[#070707] text-[10px] font-bold tracking-widest uppercase font-mono shadow-[2px_2px_0_0_#333]">
                                <Sparkles className="inline h-3 w-3 mr-1" />AI POWERED
                            </span>
                            <span className="px-3 py-1 bg-[#070707] text-[#26cece] border border-[#26cece] text-[10px] font-bold tracking-widest uppercase font-mono shadow-[2px_2px_0_0_#333]">
                                <Globe className="inline h-3 w-3 mr-1" />META PLATFORM
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 font-['Space_Grotesk'] uppercase tracking-tight">
                            {isConnected ? 'Manage Your Campaigns' : 'Connect Your Sandbox'}
                        </h2>
                        <p className="text-gray-400 font-mono text-sm max-w-xl border-l-[3px] border-[#26cece] pl-4">
                            {isConnected
                                ? '&gt; Create, optimize, and schedule your Facebook & Instagram posts with AI-driven automation workflows.'
                                : '&gt; Link your Meta Business account to initiate systematic campaign automation cycles.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-6 md:mt-0">
                        {isConnected ? (
                            <>
                                <button
                                    onClick={() => setShowScheduleModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#26cece] text-[#070707] border border-[#070707] rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-1 transition-all"
                                >
                                    <Calendar className="h-4 w-4" />Schedule Post
                                </button>
                                <a
                                    href={`https://business.facebook.com/billing/payment_methods?act=${connection?.ad_accounts?.[0]?.account_id || ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3 bg-[#070707] text-[#26cece] border border-[#26cece] rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] hover:shadow-[4px_4px_0_0_#26cece] hover:-translate-y-1 transition-all"
                                >
                                    <CreditCard className="h-4 w-4" />Add Funds
                                </a>
                                <button
                                    onClick={handleDisconnect}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500 rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] hover:bg-red-500 hover:text-white transition-colors"
                                >
                                    <Unlink className="h-4 w-4" />Disconnect
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowConnectModal(true)}
                                className="flex items-center gap-2 px-8 py-4 bg-[#26cece] text-[#070707] border border-[#070707] rounded-[2px] font-extrabold font-['Space_Grotesk'] uppercase tracking-widest text-[14px] hover:shadow-[6px_6px_0_0_#333] hover:-translate-y-1 transition-all"
                            >
                                <Link2 className="h-5 w-5" />Establish Link
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Not Connected Placeholder */}
            {!isConnected && (
                <div className="bg-[#111111] rounded-[2px] border-2 border-dashed border-[#333] p-12 text-center hover:border-[#26cece] transition-colors relative overflow-hidden group">
                    <div className="absolute -inset-full bg-gradient-to-r from-transparent via-[#26cece]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    <div className="w-20 h-20 mx-auto mb-6 rounded-none bg-[#070707] border border-[#26cece] shadow-[4px_4px_0_0_#26cece] flex items-center justify-center transform -rotate-3">
                        <Link2 className="h-10 w-10 text-[#26cece]" />
                    </div>
                    <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight mb-3">Await Signal...</h3>
                    <p className="text-gray-400 font-mono text-sm max-w-md mx-auto mb-8">
                        &gt; Link your Meta Business matrix to inject automation directly into your deployment cycle.
                    </p>
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#070707] border border-[#070707] rounded-[2px] font-extrabold font-['Space_Grotesk'] uppercase tracking-widest text-[14px] hover:shadow-[6px_6px_0_0_#26cece] hover:-translate-y-1 transition-all"
                    >
                        <Link2 className="h-5 w-5" />Initialize Connection
                    </button>
                </div>
            )}

            {/* Connected: Balance + Stats */}
            {isConnected && (
                <>
                    {/* Ad Balance Card */}
                    {adAccountBalance && (
                        <div className="relative overflow-hidden bg-[#070707] border-2 border-[#26cece] p-6 shadow-[8px_8px_0_0_#333]">
                            {/* Brutalist circuit grid overlay */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#26cece 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white text-[#070707] rounded-none rotate-3 mt-1">
                                        <CreditCard className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-[#26cece] font-mono font-bold uppercase tracking-widest text-[10px] mb-1">ALLOCATED BUDGET <span className="opacity-50">[{adAccountBalance.name}]</span></p>
                                        <p className="text-4xl font-extrabold text-white font-['Space_Grotesk']">
                                            {adAccountBalance.currency} {parseFloat(adAccountBalance.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 font-mono text-xs">
                                            <span className="text-red-400 px-2 border border-red-500/50 block">DEBITED: {parseFloat(adAccountBalance.amount_spent).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto self-stretch md:self-auto border-t md:border-t-0 md:border-l border-[#333] pt-4 md:pt-0 md:pl-6 flex items-center">
                                    <button
                                        onClick={loadAdAccountBalance}
                                        className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-[#111111] border border-[#333] text-gray-300 font-mono text-[10px] uppercase hover:text-white hover:border-[#26cece] hover:shadow-[2px_2px_0_0_#26cece] transition-all"
                                    >
                                        <RefreshCw className="h-3 w-3" />Synchronize
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { label: 'Deployed', value: stats.totalCampaigns, icon: Layers, border: 'border-blue-500', text: 'text-blue-500' },
                            { label: 'Active Streams', value: stats.activeCampaigns, icon: PlayCircle, border: 'border-[#26cece]', text: 'text-[#26cece]' },
                            { label: 'Capital Spent', value: `₹${stats.totalSpent.toLocaleString()}`, icon: IndianRupee, border: 'border-amber-500', text: 'text-amber-500' },
                            { label: 'Total Views', value: stats.totalImpressions.toLocaleString(), icon: Eye, border: 'border-purple-500', text: 'text-purple-500' },
                            { label: 'Triggers', value: stats.totalConversions, icon: TrendingUp, border: 'border-rose-500', text: 'text-rose-500' },
                        ].map((stat) => (
                            <div key={stat.label} className={`group relative bg-[#111111] border-l-[4px] ${stat.border} border-t border-r border-b border-[#333] p-5 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#1E1E1E] transition-all duration-200`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-1.5 border border-transparent group-hover:${stat.border} transition-colors bg-[#070707]`}>
                                        <stat.icon className={`h-5 w-5 ${stat.text}`} />
                                    </div>
                                    <div className="text-[10px] uppercase font-mono text-gray-600 tracking-widest font-bold">INFO</div>
                                </div>
                                <p className={`text-2xl lg:text-3xl font-bold font-['Space_Grotesk'] text-white tracking-tight`}>{stat.value}</p>
                                <p className="text-[10px] uppercase font-mono text-gray-500 tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Connected Pages */}
                    {connection?.pages?.length > 0 && (
                        <div className="bg-[#111111] border border-[#333] p-6 relative">
                            {/* Decorative screw elements */}
                            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#333]"></div>
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#333]"></div>
                            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#333]"></div>
                            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#333]"></div>

                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#333] border-dashed">
                                <h3 className="text-xl font-bold font-['Space_Grotesk'] uppercase tracking-tight text-white">Registered Nodes</h3>
                                <span className="text-[10px] font-mono tracking-widest text-[#26cece] bg-[#070707] px-3 py-1 border border-[#26cece]">
                                    VOL: {connection.pages.length} PAGE{connection.pages.length !== 1 ? 'S' : ''}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {connection.pages.map(page => (
                                    <div key={page.id} className="flex items-center gap-4 p-4 bg-[#070707] border border-[#1E1E1E] hover:border-[#26cece] transition-colors group cursor-default">
                                        {page.picture?.data?.url ? (
                                            <div className="w-14 h-14 relative shrink-0">
                                                <div className="absolute inset-0 bg-[#26cece] translate-x-1 translate-y-1"></div>
                                                <img src={page.picture.data.url} alt={page.name} className="w-14 h-14 object-cover relative z-10 border border-[#333] filter grayscale group-hover:grayscale-0 transition-all duration-300" />
                                            </div>
                                        ) : (
                                            <div className="w-14 h-14 shrink-0 bg-[#111111] border border-[#333] flex items-center justify-center relative">
                                                <div className="absolute inset-0 border border-[#26cece] translate-x-1 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <FileText className="h-6 w-6 text-gray-500 group-hover:text-[#26cece] relative z-10" />
                                            </div>
                                        )}
                                        <div className="min-w-0 overflow-hidden">
                                            <p className="font-bold font-['Space_Grotesk'] text-white uppercase truncate">{page.name}</p>
                                            <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase mt-0.5 truncate">{page.category || 'Standard Node'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MetaOverviewPage;
