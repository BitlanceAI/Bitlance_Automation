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
        <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Settings</h2>
                <p className="text-gray-400 text-sm mt-1">Manage your Meta account connection</p>
            </div>

            {/* Connection status card */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-4 mb-5">
                    <div className={`p-3 rounded-xl ${isConnected ? 'bg-emerald-500/15' : 'bg-slate-700'}`}>
                        {isConnected ? <Link2 className="h-6 w-6 text-emerald-400" /> : <Unlink className="h-6 w-6 text-gray-400" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            {isConnected ? 'Meta Account Connected' : 'Not Connected'}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {isConnected
                                ? `${connection?.pages?.length || 0} page(s) accessible`
                                : 'Link your Meta Business account to get started'}
                        </p>
                    </div>
                    <div className="ml-auto">
                        {isConnected ? (
                            <button
                                onClick={handleDisconnect}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
                            >
                                <Unlink className="h-4 w-4" />Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowConnectModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
                            >
                                <Link2 className="h-4 w-4" />Connect
                            </button>
                        )}
                    </div>
                </div>

                {/* Connected details */}
                {isConnected && connection && (
                    <div className="space-y-4 pt-4 border-t border-slate-700/50">
                        {/* Pages */}
                        {connection.pages?.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Connected Pages</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {connection.pages.map(page => (
                                        <div key={page.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
                                            {page.picture?.data?.url ? (
                                                <img src={page.picture.data.url} alt={page.name} className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-white" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-medium text-white text-sm truncate">{page.name}</p>
                                                <p className="text-xs text-gray-400">{page.category || 'Page'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ad accounts */}
                        {connection.ad_accounts?.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-3">Ad Accounts</p>
                                <div className="space-y-2">
                                    {connection.ad_accounts.map(acc => (
                                        <div key={acc.account_id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
                                            <div className="p-2 rounded-lg bg-slate-800">
                                                <CreditCard className="h-4 w-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm">{acc.name || `Account ${acc.account_id}`}</p>
                                                <p className="text-xs text-gray-400">ID: {acc.account_id} · {acc.currency}</p>
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
                            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <Globe className="h-4 w-4" />Open Meta Business Suite
                            <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                )}
            </div>

            {/* Connect modal (inline on settings page too) */}
            {showConnectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Connect Meta Account</h3>
                            <button onClick={() => setShowConnectModal(false)} className="p-2 rounded-lg hover:bg-slate-700 text-gray-400">
                                <Settings2 className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {/* Method tabs */}
                            <div className="flex gap-2 mb-6">
                                {[
                                    { id: 'api-key', label: 'API Key', icon: Key },
                                    { id: 'oauth', label: 'Login with Meta', icon: ExternalLink },
                                ].map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setConnectMethod(id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${connectMethod === id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />{label}
                                    </button>
                                ))}
                            </div>

                            {connectMethod === 'api-key' ? (
                                <form onSubmit={handleConnectApiKey} className="space-y-4">
                                    {[
                                        { id: 'accessToken', label: 'Access Token *', type: 'password', placeholder: 'Your Meta access token', required: true },
                                        { id: 'appId', label: 'App ID (Optional)', type: 'text', placeholder: 'Meta App ID', required: false },
                                        { id: 'appSecret', label: 'App Secret (Optional)', type: 'password', placeholder: 'Meta App Secret', required: false },
                                    ].map(field => (
                                        <div key={field.id}>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                                            <input
                                                type={field.type}
                                                value={apiKeyForm[field.id]}
                                                onChange={(e) => setApiKeyForm({ ...apiKeyForm, [field.id]: e.target.value })}
                                                placeholder={field.placeholder}
                                                required={field.required}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="submit"
                                        disabled={connecting}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-colors"
                                    >
                                        {connecting ? <><RefreshCw className="h-5 w-5 animate-spin" />Connecting...</> : <><Link2 className="h-5 w-5" />Connect Account</>}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1877F2] flex items-center justify-center">
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-400 mb-6">Click below to securely connect your Meta account</p>
                                    <button
                                        onClick={handleOAuthConnect}
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#1877F2] text-white font-semibold hover:bg-[#166FE5] transition-colors"
                                    >
                                        <ExternalLink className="h-5 w-5" />Continue with Meta
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
