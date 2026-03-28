import React from 'react';
import { Settings2, Link2, Unlink, Key, ExternalLink, RefreshCw, Globe, CreditCard, FileText } from 'lucide-react';
import { useMetaAds } from './MetaAdsLayout';

const MetaSettingsPage = () => {
    const {
        isConnected, connection, connecting,
        showConnectModal, setShowConnectModal,
        connectMethod, setConnectMethod,
        apiKeyForm, setApiKeyForm,
        handleConnectApiKey, handleOAuthConnect, handleDisconnect,
    } = useMetaAds();

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 font-mono">
            <div className="border-b border-[#333] pb-6">
                <h2 className="text-4xl font-extrabold font-['Space_Grotesk'] uppercase tracking-tight text-white mb-2">System Configuration</h2>
                <p className="text-[#26cece] text-[10px] uppercase tracking-widest bg-[#26cece]/10 inline-block px-2 py-1">&gt; Link your Meta structural matrix</p>
            </div>

            {/* Connection status card */}
            <div className="bg-[#070707] border border-[#333] shadow-[8px_8px_0_0_#26cece] flex flex-col transition-all">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                    <div className={`p-4 border border-[#333] ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#111111]'}`}>
                        {isConnected ? <Link2 className="h-8 w-8 text-emerald-400" /> : <Unlink className="h-8 w-8 text-gray-500" />}
                    </div>
                    <div className="flex-1 border-l-2 border-transparent pl-2 md:pl-0">
                        <h3 className="text-xl md:text-2xl font-bold font-['Space_Grotesk'] text-white tracking-tight uppercase mb-1">
                            {isConnected ? 'Active Uplink' : 'Connection Offline'}
                        </h3>
                        <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">
                            {isConnected
                                ? `&gt; ${connection?.pages?.length || 0} secure endpoints authorized`
                                : '&gt; Initiate handshake process to sync data arrays'}
                        </p>
                    </div>
                    <div className="shrink-0 mt-4 md:mt-0">
                        {isConnected ? (
                            <button
                                onClick={handleDisconnect}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 border border-[#333] bg-[#111111] hover:bg-red-500 hover:text-[#070707] text-gray-400 transition-all font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px]"
                            >
                                <Unlink className="h-4 w-4" /> Sever Uplink
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowConnectModal(true)}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#26cece] border border-[#070707] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333] transition-all"
                            >
                                <Link2 className="h-4 w-4" /> Initialize Connection
                            </button>
                        )}
                    </div>
                </div>

                {/* Connected details */}
                {isConnected && connection && (
                    <div className="space-y-8 pt-6 border-t border-[#333] bg-[#111111] p-6 md:p-8">
                        {/* Pages */}
                        {connection.pages?.length > 0 && (
                            <div>
                                <p className="text-[10px] text-[#26cece] uppercase font-bold tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#26cece]"></span> Authorized Endpoints
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {connection.pages.map(page => (
                                        <div key={page.id} className="flex items-center gap-4 p-4 bg-[#070707] border border-[#333] hover:border-[#26cece] transition-colors group">
                                            {page.picture?.data?.url ? (
                                                <img src={page.picture.data.url} alt={page.name} className="w-12 h-12 border border-[#333] object-cover grayscale group-hover:grayscale-0 transition-all" />
                                            ) : (
                                                <div className="w-12 h-12 border border-[#333] bg-[#111111] flex items-center justify-center group-hover:border-[#26cece] transition-colors">
                                                    <FileText className="h-5 w-5 text-gray-500 group-hover:text-[#26cece]" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold font-['Space_Grotesk'] text-lg text-white truncate tracking-tight uppercase">{page.name}</p>
                                                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{page.category || 'Node'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ad accounts */}
                        {connection.ad_accounts?.length > 0 && (
                            <div>
                                <p className="text-[10px] text-[#26cece] uppercase font-bold tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#26cece]"></span> Billing Nodes
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {connection.ad_accounts.map(acc => (
                                        <div key={acc.account_id} className="flex items-center gap-4 p-4 bg-[#070707] border border-[#333] hover:border-[#26cece] transition-colors group">
                                            <div className="p-3 border border-[#333] bg-[#111111] group-hover:border-[#26cece] transition-colors">
                                                <CreditCard className="h-5 w-5 text-gray-500 group-hover:text-[#26cece]" />
                                            </div>
                                            <div>
                                                <p className="font-bold font-['Space_Grotesk'] text-white text-base uppercase tracking-tight">{acc.name || `Account ${acc.account_id}`}</p>
                                                <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500">ID: {acc.account_id} <span className="text-[#333]">/</span> {acc.currency}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* External link */}
                        <a
                            href="https://business.facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-[#26cece] hover:bg-[#26cece] hover:text-[#070707] px-4 py-3 border border-[#26cece] transition-all"
                        >
                            <Globe className="h-4 w-4" />Access External Matrix Terminal
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                )}
            </div>

            {/* Connect modal (inline on settings page too) */}
            {showConnectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
                    <div className="bg-[#070707] border border-[#333] shadow-[8px_8px_0_0_#26cece] w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-5 md:p-6 border-b border-[#333] bg-[#111111] flex items-center justify-between">
                            <h3 className="text-xl md:text-2xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight border-l-4 border-[#26cece] pl-3">Network Authorization</h3>
                            <button onClick={() => setShowConnectModal(false)} className="p-2 border border-transparent hover:border-[#333] hover:text-red-500 hover:bg-red-500/10 text-gray-500 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 bg-[#070707]">
                            {/* Method tabs */}
                            <div className="flex gap-2 mb-8 bg-[#111111] p-1 border border-[#333]">
                                {[
                                    { id: 'api-key', label: 'Token', icon: Key },
                                    { id: 'oauth', label: 'OAUTH Handshake', icon: ExternalLink },
                                ].map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setConnectMethod(id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[10px] uppercase font-mono tracking-widest transition-all ${connectMethod === id
                                                ? 'bg-[#26cece] text-[#070707] font-bold shadow-[2px_2px_0_0_#333] -translate-y-0.5'
                                                : 'bg-transparent text-gray-500 hover:text-white border border-transparent hover:border-[#333]'
                                            }`}
                                    >
                                        <Icon className="h-3 w-3" /> {label}
                                    </button>
                                ))}
                            </div>

                            {connectMethod === 'api-key' ? (
                                <form onSubmit={handleConnectApiKey} className="space-y-5">
                                    {[
                                        { id: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Enter primary access token', required: true },
                                        { id: 'appId', label: 'App ID', type: 'text', placeholder: 'Optional App ID', required: false },
                                        { id: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Optional App Secret', required: false },
                                    ].map(field => (
                                        <div key={field.id} className="group">
                                            <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-2 flex justify-between">
                                                <span>{field.label}</span>
                                                {!field.required && <span className="text-gray-600">OPTIONAL</span>}
                                            </label>
                                            <input
                                                type={field.type}
                                                value={apiKeyForm[field.id]}
                                                onChange={(e) => setApiKeyForm({ ...apiKeyForm, [field.id]: e.target.value })}
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                className="w-full px-4 py-3 border border-[#333] bg-[#111111] text-white placeholder-gray-600 focus:border-[#26cece] focus:ring-0 focus:outline-none transition-colors font-mono"
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        disabled={connecting}
                                        className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-4 bg-[#26cece] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0"
                                    >
                                        {connecting ? <><RefreshCw className="h-5 w-5 animate-spin" /> Verifying Credentials...</> : <><Key className="h-5 w-5" /> Execute Upload</>}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-10 bg-[#111111] border border-dashed border-[#333]">
                                    <div className="w-16 h-16 mx-auto mb-6 bg-[#1877F2]/10 border border-[#1877F2] flex items-center justify-center transform rotate-3">
                                        <svg className="w-8 h-8 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-8 max-w-xs mx-auto">&gt; Secure redirection to Meta infrastructure for token exchange.</p>
                                    <button
                                        onClick={handleOAuthConnect}
                                        className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#1877F2] text-white hover:bg-white hover:text-[#1877F2] border border-[#1877F2] font-bold font-['Space_Grotesk'] uppercase tracking-widest transition-all shadow-[4px_4px_0_0_#1877F2] hover:-translate-y-1"
                                    >
                                        <ExternalLink className="h-4 w-4" /> Initialize OAuth
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetaSettingsPage;
