import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Target,
    Zap,
    Link2,
    Unlink,
    RefreshCw,
    LayoutDashboard,
    Megaphone,
    CalendarClock,
    FolderKanban,
    Settings2,
} from 'lucide-react';

import API_BASE_URL from '../../config';
import SEOHead from '../../components/layout/SEOHead';

// ─── Context ────────────────────────────────────────────────────────────────
export const MetaAdsContext = createContext(null);
export const useMetaAds = () => useContext(MetaAdsContext);

// ─── Navigation config ──────────────────────────────────────────────────────
const NAV_ITEMS = [
    { label: 'Overview', path: '/dashboard/agents/meta', icon: LayoutDashboard },
    { label: 'Meta Campaigns', path: '/dashboard/agents/meta/campaigns', icon: Megaphone },
    { label: 'Scheduled Posts', path: '/dashboard/agents/meta/posts', icon: CalendarClock },
    { label: 'Internal Campaigns', path: '/dashboard/agents/meta/internal', icon: FolderKanban },
    { label: 'Settings', path: '/dashboard/agents/meta/settings', icon: Settings2 },
];

// ─── Layout Component ────────────────────────────────────────────────────────
const MetaAdsLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { credits } = useAuth();

    // Auth refs & session
    const oauthProcessedRef = useRef(false);
    const authTokenRef = useRef(null);
    const dataLoadedRef = useRef(false);
    const [session, setSession] = useState(null);

    // Connection
    const [isConnected, setIsConnected] = useState(false);
    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connecting, setConnecting] = useState(false);

    // Data
    const [campaigns, setCampaigns] = useState([]);
    const [scheduledPosts, setScheduledPosts] = useState([]);
    const [insights, setInsights] = useState({});
    const [adAccountBalance, setAdAccountBalance] = useState(null);

    // Modals (shared)
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [connectMethod, setConnectMethod] = useState('api-key');
    const [apiKeyForm, setApiKeyForm] = useState({ accessToken: '', appId: '', appSecret: '' });

    // ── Helpers ──────────────────────────────────────────────────────────────
    const getAuthHeaders = (authToken) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken || session?.access_token || authTokenRef.current}`
    });

    const handleAuthError = (status, data) => {
        if (status === 401 && data?.code === 'TOKEN_EXPIRED') {
            setIsConnected(false);
            setConnection(null);
            toast.error('Meta session expired. Please reconnect.');
            return true;
        }
        return false;
    };

    // ── Data Fetchers ─────────────────────────────────────────────────────────
    const loadCampaigns = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/meta/campaigns`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (handleAuthError(res.status, data)) return;
            if (data.success) setCampaigns(data.campaigns || []);
        } catch (e) { console.error('loadCampaigns', e); }
    };

    const loadScheduledPosts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/meta/posts/scheduled`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (handleAuthError(res.status, data)) return;
            if (data.success) setScheduledPosts(data.posts || []);
        } catch (e) { console.error('loadScheduledPosts', e); }
    };

    const loadInsights = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/meta/insights`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (handleAuthError(res.status, data)) return;
            if (data.success) setInsights(data.insights || {});
        } catch (e) { console.error('loadInsights', e); }
    };

    const loadAdAccountBalance = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/meta/account-balance`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (data.success && data.accounts?.length > 0) setAdAccountBalance(data.accounts[0]);
        } catch (e) { console.error('loadAdAccountBalance', e); }
    };

    const checkConnection = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/meta/connection`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (data.connected && data.isValid) {
                setIsConnected(true);
                setConnection(data);
                await Promise.all([loadCampaigns(), loadScheduledPosts(), loadInsights(), loadAdAccountBalance()]);
            } else {
                setIsConnected(false);
                if (data.connected === false && data.isValid === false) {
                    toast.error('Meta session expired. Please reconnect.');
                }
            }
        } catch (e) { console.error('checkConnection', e); }
        finally { setLoading(false); }
    };

    // ── OAuth helpers ─────────────────────────────────────────────────────────
    const checkForFacebookToken = async (currentSession) => {
        if (!currentSession?.provider_token) return;
        if (oauthProcessedRef.current) return;
        const hasFB =
            currentSession?.user?.app_metadata?.provider === 'facebook' ||
            currentSession?.user?.app_metadata?.providers?.includes('facebook') ||
            currentSession?.user?.identities?.some(id => id.provider === 'facebook');
        if (hasFB) {
            oauthProcessedRef.current = true;
            await handleOAuthComplete(currentSession.provider_token, currentSession.access_token);
        }
    };

    const handleOAuthComplete = async (providerToken, authToken) => {
        setConnecting(true);
        if (authToken) authTokenRef.current = authToken;
        try {
            const res = await fetch(`${API_BASE_URL}/api/meta/connect-api-key`, {
                method: 'POST',
                headers: getAuthHeaders(authToken),
                body: JSON.stringify({ accessToken: providerToken })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Meta account connected via Facebook!');
                await checkConnection();
                window.history.replaceState({}, '', '/dashboard/agents/meta');
            } else {
                toast.error(data.error || 'OAuth connection failed');
            }
        } catch (e) { toast.error('OAuth completion failed'); }
        finally { setConnecting(false); }
    };

    const handleOAuthConnect = async () => {
        try {
            setConnecting(true);
            oauthProcessedRef.current = false;
            const { error } = await supabase.auth.linkIdentity({
                provider: 'facebook',
                options: {
                    redirectTo: window.location.origin + '/dashboard/agents/meta',
                    scopes: 'pages_manage_posts,pages_read_engagement,pages_show_list,ads_management,ads_read,business_management,instagram_basic,instagram_content_publish'
                }
            });
            if (error) {
                const { error: signInError } = await supabase.auth.signInWithOAuth({
                    provider: 'facebook',
                    options: {
                        redirectTo: window.location.origin + '/dashboard/agents/meta',
                        scopes: 'pages_manage_posts,pages_read_engagement,pages_show_list,ads_management,ads_read,business_management,instagram_basic,instagram_content_publish'
                    }
                });
                if (signInError) throw signInError;
            }
        } catch (e) {
            toast.error('Failed to start Facebook login');
            setConnecting(false);
        }
    };

    const handleConnectApiKey = async (e) => {
        e.preventDefault();
        if (!apiKeyForm.accessToken) { toast.error('Access token is required'); return; }
        setConnecting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/meta/connect-api-key`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(apiKeyForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Meta account connected successfully!');
                setShowConnectModal(false);
                setApiKeyForm({ accessToken: '', appId: '', appSecret: '' });
                await checkConnection();
            } else {
                toast.error(data.error || 'Failed to connect');
            }
        } catch (e) { toast.error('Connection failed: ' + e.message); }
        finally { setConnecting(false); }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect your Meta account?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/meta/disconnect`, { method: 'DELETE', headers: getAuthHeaders() });
            if (res.ok) {
                toast.success('Meta account disconnected');
                setIsConnected(false);
                setConnection(null);
                setCampaigns([]);
                setScheduledPosts([]);
                setInsights({});
                setAdAccountBalance(null);
            }
        } catch (e) { toast.error('Failed to disconnect'); }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetch(`${API_BASE_URL}/api/meta/refresh-accounts`, { method: 'POST', headers: getAuthHeaders() }),
                loadCampaigns(),
                loadScheduledPosts(),
                loadInsights(),
                loadAdAccountBalance()
            ]);
            await checkConnection();
            toast.success('Data refreshed');
        } catch (e) { toast.error('Refresh failed'); }
        finally { setRefreshing(false); }
    };

    // ── Session bootstrap ─────────────────────────────────────────────────────
    useEffect(() => {
        oauthProcessedRef.current = false;
        dataLoadedRef.current = false;
        const init = async () => {
            const { data: { session: s } } = await supabase.auth.getSession();
            if (s) {
                authTokenRef.current = s.access_token;
                setSession(s);
                checkForFacebookToken(s);
            } else {
                setLoading(false);
            }
        };
        init();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
            if (s) {
                authTokenRef.current = s.access_token;
                if (event === 'TOKEN_REFRESHED') return;
                setSession(s);
                if (event === 'SIGNED_IN') checkForFacebookToken(s);
            } else {
                setSession(null);
                dataLoadedRef.current = false;
                setLoading(false);
            }
        });
        return () => subscription?.unsubscribe();
    }, []);

    useEffect(() => {
        if (session?.access_token && !dataLoadedRef.current) {
            dataLoadedRef.current = true;
            checkConnection();
        }
    }, [session]);

    // ── Sidebar active check ──────────────────────────────────────────────────
    const isActive = (path) => {
        if (path === '/dashboard/agents/meta') return location.pathname === '/dashboard/agents/meta';
        return location.pathname.startsWith(path);
    };

    // ── Stats derived ─────────────────────────────────────────────────────────
    const stats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
        totalSpent: parseFloat(insights.spend || 0),
        totalImpressions: parseInt(insights.impressions || 0),
        totalConversions: parseInt(insights.conversions || 0),
        pages: connection?.pages?.length || 0
    };

    // ── Context value ─────────────────────────────────────────────────────────
    const ctx = {
        // State
        isConnected, connection, loading, refreshing, connecting,
        campaigns, scheduledPosts, insights, adAccountBalance, stats,
        // Modals
        showConnectModal, setShowConnectModal,
        showScheduleModal, setShowScheduleModal,
        connectMethod, setConnectMethod,
        apiKeyForm, setApiKeyForm,
        // Actions
        getAuthHeaders, handleDisconnect, handleRefresh,
        handleConnectApiKey, handleOAuthConnect,
        loadCampaigns, loadScheduledPosts, loadInsights, loadAdAccountBalance,
        checkConnection,
        API_BASE: API_BASE_URL,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/20 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading Meta Ads...</p>
                </div>
            </div>
        );
    }

    return (
        <MetaAdsContext.Provider value={ctx}>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/20 flex flex-col">
                <SEOHead canonicalUrl="https://www.bitlancetechhub.com/dashboard/agents/meta" noIndex={true} />

                {/* ── Sticky Header ── */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                        {/* Left: back + logo */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/agents')}
                                className="p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-colors"
                                title="Back to Agents"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                                    <Target className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-base font-bold text-white leading-none">Meta Ads Automation</h1>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {isConnected ? `${stats.pages} Page${stats.pages !== 1 ? 's' : ''} Connected` : 'Connect your Meta account'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: status + credits */}
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isConnected
                                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                                : 'bg-slate-700 text-gray-400'
                                }`}>
                                {isConnected ? <Link2 className="h-3.5 w-3.5" /> : <Unlink className="h-3.5 w-3.5" />}
                                {isConnected ? 'Connected' : 'Not Connected'}
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <Zap className="h-4 w-4 text-blue-400" />
                                <span className="text-sm font-bold text-blue-400">{credits?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Body: Sidebar + Content ── */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-56 shrink-0 border-r border-slate-700/50 bg-slate-900/50 backdrop-blur-sm flex flex-col pt-4 pb-6 px-3">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 mb-3">Navigation</p>
                        <nav className="flex flex-col gap-1">
                            {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left ${isActive(path)
                                        ? 'bg-gradient-to-r from-blue-600/80 to-indigo-600/80 text-white shadow-lg shadow-blue-900/40'
                                        : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                                        }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </nav>

                        {/* Connection quick-action */}
                        <div className="mt-auto">
                            {isConnected ? (
                                <button
                                    onClick={handleRefresh}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh Data
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowConnectModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                                >
                                    <Link2 className="h-3.5 w-3.5" />
                                    Connect Account
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Page content */}
                    <main className="flex-1 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </MetaAdsContext.Provider>
    );
};

export default MetaAdsLayout;
