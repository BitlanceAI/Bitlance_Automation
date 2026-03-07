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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi0yLTQgMi00IDItNGMwLTItMi00LTItNHMyLTIgMi00LTItNC0yLTRjMC0yIDItNCAyLTRzLTItMi0yLTQgMi00IDItNGMwLTIgNC0yIDQtMnM0IDAgNC0yIDQgMiA0IDItMiA0LTIgNCAyIDQgMiA0cy0yIDItMiA0IDIgNCAyIDRjMCAyLTIgNC0yIDRzMiAyIDIgNC0yIDQtMiA0YzAgMi0yIDQtMiA0czIgMiAyIDQtMiA0LTIgNGMwIDItNCAyLTQgMnMtNCAwLTQgMi00LTItNC0yIDItNC0yLTQtMi00LTItNGMwLTIgMi00IDItNHMtMi0yLTItNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                                <Sparkles className="inline h-3 w-3 mr-1" />AI Powered
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                                <Globe className="inline h-3 w-3 mr-1" />Meta Platform
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            {isConnected ? 'Manage Your Campaigns' : 'Connect Your Meta Account'}
                        </h2>
                        <p className="text-blue-100 text-lg max-w-xl">
                            {isConnected
                                ? 'Create, optimize, and schedule your Facebook & Instagram posts with AI-driven automation.'
                                : 'Link your Meta Business account to start automating campaigns and scheduling posts.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {isConnected ? (
                            <>
                                <button
                                    onClick={() => setShowScheduleModal(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors shadow-lg text-sm"
                                >
                                    <Calendar className="h-4 w-4" />Schedule Post
                                </button>
                                <a
                                    href={`https://business.facebook.com/billing/payment_methods?act=${connection?.ad_accounts?.[0]?.account_id || ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20 text-sm"
                                >
                                    <CreditCard className="h-4 w-4" />Add Payment
                                </a>
                                <button
                                    onClick={handleDisconnect}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20 text-sm"
                                >
                                    <Unlink className="h-4 w-4" />Disconnect
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setShowConnectModal(true)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                <Link2 className="h-5 w-5" />Connect Account
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Not Connected Placeholder */}
            {!isConnected && (
                <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-12 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-900/30 to-indigo-900/30 flex items-center justify-center">
                        <Link2 className="h-12 w-12 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Connect Your Meta Account</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Link your Meta Business account to start managing campaigns, scheduling posts, and viewing analytics all in one place.
                    </p>
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg shadow-blue-500/25"
                    >
                        <Link2 className="h-5 w-5" />Connect Account
                    </button>
                </div>
            )}

            {/* Connected: Balance + Stats */}
            {isConnected && (
                <>
                    {/* Ad Balance Card */}
                    {adAccountBalance && (
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-500/20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium mb-1">Available Ad Balance</p>
                                    <p className="text-3xl font-bold text-white">
                                        {adAccountBalance.currency} {parseFloat(adAccountBalance.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-emerald-200 text-xs mt-1">
                                        Spent: {adAccountBalance.currency} {parseFloat(adAccountBalance.amount_spent).toLocaleString(undefined, { minimumFractionDigits: 2 })} · {adAccountBalance.name}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                                        <CreditCard className="h-7 w-7 text-white" />
                                    </div>
                                    <button
                                        onClick={loadAdAccountBalance}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
                                    >
                                        <RefreshCw className="h-3 w-3" />Refresh
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Total Campaigns', value: stats.totalCampaigns, icon: Layers, color: 'from-blue-500 to-cyan-500' },
                            { label: 'Active', value: stats.activeCampaigns, icon: PlayCircle, color: 'from-emerald-500 to-teal-500' },
                            { label: 'Total Spent', value: `₹${stats.totalSpent.toLocaleString()}`, icon: IndianRupee, color: 'from-amber-500 to-orange-500' },
                            { label: 'Impressions', value: stats.totalImpressions.toLocaleString(), icon: Eye, color: 'from-violet-500 to-purple-500' },
                            { label: 'Conversions', value: stats.totalConversions, icon: TrendingUp, color: 'from-rose-500 to-pink-500' },
                        ].map((stat) => (
                            <div key={stat.label} className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
                                <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${stat.color} mb-3`}>
                                    <stat.icon className="h-5 w-5 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-gray-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Connected Pages */}
                    {connection?.pages?.length > 0 && (
                        <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Connected Pages</h3>
                                <span className="text-xs text-gray-400">{connection.pages.length} page{connection.pages.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {connection.pages.map(page => (
                                    <div key={page.id} className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                                        {page.picture?.data?.url ? (
                                            <img src={page.picture.data.url} alt={page.name} className="w-12 h-12 rounded-xl object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-white">{page.name}</p>
                                            <p className="text-sm text-gray-400">{page.category || 'Page'}</p>
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
