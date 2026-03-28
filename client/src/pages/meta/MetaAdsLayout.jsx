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
            <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center relative overflow-hidden font-mono">
                {/* Brutalist background grid pattern */}
                <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="text-center z-10 relative bg-[#111111] p-10 rounded-[2px] border border-[#333] shadow-[8px_8px_0_0_#26cece]">
                    <div className="w-16 h-16 border-4 border-[#333] border-t-[#26cece] rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-[#26cece] tracking-widest uppercase font-bold text-lg">Initializing Meta Link</p>
                    <p className="text-gray-500 text-[10px] mt-2">Checking active connections...</p>
                </div>
            </div>
        );
    }

    return (
        <MetaAdsContext.Provider value={ctx}>
            <div className="min-h-screen bg-[#070707] text-white flex flex-col font-mono selection:bg-[#26cece] selection:text-[#070707]">
                <SEOHead canonicalUrl="https://www.bitlancetechhub.com/dashboard/agents/meta" noIndex={true} />

                {/* ── Sticky Header ── */}
                <header className="sticky top-0 z-50 bg-[#111111] border-b border-[#1E1E1E]">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                        {/* Left: back + logo */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/agents')}
                                className="p-2 border border-[#333] rounded-[2px] hover:bg-white hover:text-[#070707] text-gray-400 hover:-translate-x-1 hover:shadow-[4px_4px_0_0_#26cece] transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
                                title="Back to Agents"
                            >
                                <ArrowLeft size={16} /> Exit
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-[2px] bg-[#26cece] text-[#070707] border border-[#070707] shadow-[2px_2px_0_0_#333]">
                                    <Target className="h-5 w-5 fill-current" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white font-['Space_Grotesk'] tracking-tight capitalize leading-none">
                                        Meta Control Center
                                    </h1>
                                    <p className="text-[10px] uppercase font-mono text-gray-500 mt-1 tracking-widest">
                                        {isConnected ? `ACTIVE // ${stats.pages} NODE${stats.pages !== 1 ? 'S' : ''} LINKED` : 'STATUS // OFFLINE'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: status + credits */}
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-[2px] text-[10px] uppercase font-bold tracking-widest border ${isConnected
                                ? 'bg-[#070707] border-[#26cece] text-[#26cece]'
                                : 'bg-[#070707] border-red-500/50 text-red-500'
                                }`}>
                                {isConnected ? <Link2 className="h-3.5 w-3.5" /> : <Unlink className="h-3.5 w-3.5" />}
                                {isConnected ? 'Link Active' : 'Disconnected'}
                            </div>
                            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-[2px] bg-[#070707] border border-[#333]">
                                <Zap className="h-4 w-4 text-[#26cece] fill-[#26cece]" />
                                <span className="text-[12px] font-mono text-white tracking-widest">
                                    {credits?.toLocaleString() || 0} CREDITS
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Body: Sidebar + Content ── */}
                <div className="flex flex-1 overflow-hidden relative">
                    {/* Brutalist Grid Background overlay for main content area (behind everything) */}
                    <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#26cece 1px, transparent 1px), linear-gradient(90deg, #26cece 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

                    {/* Sidebar */}
                    <aside className="w-64 shrink-0 border-r border-[#1E1E1E] bg-[#111111] flex flex-col pt-6 pb-6 px-4 z-10 relative">
                        <p className="text-[10px] font-bold uppercase font-['Space_Grotesk'] tracking-widest text-[#26cece] mb-4 pl-2 opacity-80 border-b border-[#333] pb-2">Modules</p>
                        <nav className="flex flex-col gap-2">
                            {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                                <button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-[2px] text-[12px] font-mono tracking-widest uppercase transition-all duration-200 w-full text-left border ${isActive(path)
                                        ? 'bg-[#26cece] border-[#070707] text-[#070707] font-bold shadow-[4px_4px_0_0_#333] translate-x-1'
                                        : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-[#333] hover:bg-[#070707]'
                                        }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </nav>

                        {/* Connection quick-action */}
                        <div className="mt-auto pt-6 border-t border-[#333]">
                            {isConnected ? (
                                <button
                                    onClick={handleRefresh}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[2px] bg-[#070707] border border-[#333] hover:border-[#26cece] text-gray-400 hover:text-white text-[10px] font-mono tracking-widest uppercase transition-all hover:shadow-[4px_4px_0_0_#26cece] hover:-translate-y-1"
                                >
                                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-[#26cece]' : ''}`} />
                                    {refreshing ? 'Syncing...' : 'Force Sync'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowConnectModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[2px] bg-[#26cece] border border-[#070707] hover:bg-white text-[#070707] text-[12px] font-bold font-['Space_Grotesk'] uppercase tracking-widest transition-all hover:shadow-[4px_4px_0_0_#333] hover:-translate-y-1"
                                >
                                    <Link2 className="h-4 w-4" />
                                    Link Account
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
