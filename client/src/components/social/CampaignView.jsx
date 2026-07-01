import React, { useState, useEffect } from 'react';
import BrandConfigForm from './dashboard/BrandConfigForm';
import CalendarSettings from './dashboard/CalendarSettings';
import {
    Sparkles, Zap, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
    CalendarDays, LayoutGrid, Plus, Instagram, Facebook, Twitter,
    Linkedin, Clock, Hash, CheckCircle2, Loader2, Settings, Edit2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { supabase } from '../../services/supabaseClient';
import API_BASE_URL from '../../config';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const PlatformIcon = ({ p }) => {
    if (p === 'instagram') return <Instagram className="w-3 h-3 text-pink-400" />;
    if (p === 'facebook')  return <Facebook className="w-3 h-3 text-blue-400" />;
    if (p === 'twitter')   return <Twitter className="w-3 h-3 text-sky-400" />;
    if (p === 'linkedin')  return <Linkedin className="w-3 h-3 text-blue-300" />;
    return null;
};

const PostCard = ({ post }) => (
    <div className="bg-[#26cece]/5 border border-[#26cece]/20 rounded-lg p-2 text-left group hover:border-[#26cece]/40 transition-colors">
        <p className="text-[10px] text-white/70 font-mono line-clamp-2 leading-relaxed">{post.caption}</p>
        {post.hashtags?.length > 0 && (
            <p className="text-[9px] text-[#26cece]/60 font-mono mt-1 truncate">
                #{post.hashtags.slice(0, 3).join(' #')}
            </p>
        )}
        <div className="flex items-center justify-between mt-1.5">
            <div className="flex gap-1">
                {(post.platforms || ['instagram']).map(p => <PlatformIcon key={p} p={p} />)}
            </div>
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Draft
            </span>
        </div>
    </div>
);

export default function CampaignView({ setActiveView }) {
    const { activeWorkspace } = useWorkspace();

    // Settings state
    const [brandConfigs, setBrandConfigs] = useState([]);
    const [calendarConfigs, setCalendarConfigs] = useState([]);
    const [selectedBrandId, setSelectedBrandId] = useState('new');
    const [selectedCalendarId, setSelectedCalendarId] = useState('new');
    const [brandConfig, setBrandConfig] = useState(null);
    const [calendarConfig, setCalendarConfig] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [brandFormOpen, setBrandFormOpen] = useState(false);
    const [calFormOpen, setCalFormOpen] = useState(false);

    // Calendar/grid state
    const today = new Date();
    const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date(today);
        d.setDate(d.getDate() - d.getDay());
        return d;
    });

    // Generated posts: { [dateKey]: [ post, ... ] }
    const [generatedPosts, setGeneratedPosts] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [daysToGenerate, setDaysToGenerate] = useState(7);
    const [isCustomDays, setIsCustomDays] = useState(false);
    const [generateGraphics, setGenerateGraphics] = useState(false);

    const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    // --- Data fetching ---
    const fetchConfigs = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const headers = {
                'Authorization': `Bearer ${token}`,
                'x-workspace-id': activeWorkspace?.id || 'default_workspace'
            };
            const [brandRes, calRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/agent/brand-configs`, { headers }),
                fetch(`${API_BASE_URL}/api/agent/calendars`, { headers })
            ]);
            const brandData = await brandRes.json();
            const calData = await calRes.json();
            if (brandData.success) {
                setBrandConfigs(brandData.data);
                // Auto-select first brand config if none selected yet
                if (brandData.data.length > 0 && !brandConfig) {
                    setSelectedBrandId(brandData.data[0]._id);
                    setBrandConfig(brandData.data[0]);
                }
            }
            if (calData.success) {
                setCalendarConfigs(calData.data);
                // Auto-select first calendar config if none selected yet
                if (calData.data.length > 0 && !calendarConfig) {
                    setSelectedCalendarId(calData.data[0]._id);
                    setCalendarConfig(calData.data[0]);
                }
            }
        } catch (e) {
            console.error('Failed to fetch configs:', e);
        }
    };

    useEffect(() => { if (activeWorkspace?.id) fetchConfigs(); }, [activeWorkspace?.id]);

    // --- Save handlers ---
    const handleSaveBrandConfig = async (data) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const method = selectedBrandId === 'new' ? 'POST' : 'PUT';
            const url = selectedBrandId === 'new' ? `${API_BASE_URL}/api/agent/brand-configs` : `${API_BASE_URL}/api/agent/brand-configs/${selectedBrandId}`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'x-workspace-id': activeWorkspace?.id || 'default_workspace' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                setBrandConfig(result.data);
                setSelectedBrandId(result.data._id);
                await fetchConfigs();
                setBrandFormOpen(false);
            }
        } catch (e) { alert('Failed to save brand config.'); }
    };

    const handleSaveCalendar = async (data) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const method = selectedCalendarId === 'new' ? 'POST' : 'PUT';
            const url = selectedCalendarId === 'new' ? `${API_BASE_URL}/api/agent/calendars` : `${API_BASE_URL}/api/agent/calendars/${selectedCalendarId}`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'x-workspace-id': activeWorkspace?.id || 'default_workspace' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                setCalendarConfig(result.data);
                setSelectedCalendarId(result.data._id);
                await fetchConfigs();
                setCalFormOpen(false);
            }
        } catch (e) { alert('Failed to save calendar config.'); }
    };

    const handleBrandSelect = (id) => {
        setSelectedBrandId(id);
        setBrandConfig(id === 'new' ? { brand_name: '', brand_tone: '', brand_niche: '' } : brandConfigs.find(b => b._id === id) || null);
    };

    const handleCalendarSelect = (id) => {
        setSelectedCalendarId(id);
        setCalendarConfig(id === 'new'
            ? { month: MONTHS[today.getMonth()], year: today.getFullYear().toString(), themes: [], festivals: [] }
            : calendarConfigs.find(c => c._id === id) || null);
    };

    // --- Generate ---
    const handleGenerate = async () => {
        if (!brandConfig || !calendarConfig) {
            alert('Please save both Brand Config and Calendar Settings first.');
            return;
        }
        setIsGenerating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const res = await fetch(`${API_BASE_URL}/api/agent/bundles/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-workspace-id': activeWorkspace?.id || 'default_workspace'
                },
                body: JSON.stringify({
                    workspace_id: activeWorkspace?.id || 'default_workspace',
                    brand_config: brandConfig,
                    calendar: calendarConfig,
                    days: daysToGenerate,
                    generate_graphics: generateGraphics
                })
            });
            const result = await res.json();
            if (result.success) {
                // Distribute returned posts across grid cells
                const posts = result.posts || result.data || [];
                const map = {};
                posts.forEach((post, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const key = dateKey(d);
                    if (!map[key]) map[key] = [];
                    map[key].push(post);
                });
                setGeneratedPosts(map);
            } else {
                alert('Generation failed: ' + result.message);
            }
        } catch (e) {
            console.error('Error generating:', e);
            alert('An error occurred during generation.');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Calendar grid helpers ---
    const getMonthDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
        return cells;
    };

    const getWeekDays = () => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            return d;
        });
    };

    const prevPeriod = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else {
            const d = new Date(weekStart);
            d.setDate(d.getDate() - 7);
            setWeekStart(d);
        }
    };

    const nextPeriod = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + 7);
            setWeekStart(d);
        }
    };

    const periodLabel = viewMode === 'month'
        ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
        : (() => {
            const end = new Date(weekStart);
            end.setDate(weekStart.getDate() + 6);
            return `${weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        })();

    const isToday = (d) => d && dateKey(d) === dateKey(today);

    const DayCell = ({ date, compact = false }) => {
        if (!date) return <div className="bg-white/[0.01] rounded-xl min-h-[90px]" />;
        const key = dateKey(date);
        const posts = generatedPosts[key] || [];
        return (
            <div className={`rounded-xl border transition-colors flex flex-col gap-1.5 ${
                compact ? 'p-2 min-h-[90px]' : 'p-3 min-h-[140px]'
            } ${isToday(date)
                ? 'bg-[#26cece]/5 border-[#26cece]/30'
                : 'bg-white/[0.02] border-white/8 hover:border-white/15'}`}
            >
                <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold font-mono ${isToday(date) ? 'text-[#26cece]' : 'text-white/50'}`}>
                        {date.getDate()}
                    </span>
                    {posts.length === 0 && (
                        <button
                            title="Generate for this day"
                            className="w-5 h-5 rounded-full bg-white/10 hover:bg-[#26cece]/20 flex items-center justify-center text-white/40 hover:text-[#26cece] transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                    {posts.length > 0 && (
                        <span className="text-[9px] font-mono text-[#26cece]/60">{posts.length} post{posts.length > 1 ? 's' : ''}</span>
                    )}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                    {posts.map((post, i) => <PostCard key={i} post={post} />)}
                </div>
            </div>
        );
    };

    const monthCells = getMonthDays();
    const weekDays = getWeekDays();

    const canGenerate = !!brandConfig && !!calendarConfig;

    return (
        <div className="flex h-full overflow-hidden bg-transparent">

            {/* ── LEFT SIDEBAR: Settings ──────────────────────────── */}
            <div className="w-[280px] flex-shrink-0 border-r border-white/10 flex flex-col bg-white/[0.02] overflow-y-auto">
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <h2 className="text-[13px] font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider">AI Campaigns</h2>
                    </div>
                    <p className="text-[10px] text-white/40 font-mono">Configure brand & generate your campaigns</p>
                </div>

                <div className="flex-1 p-4 space-y-4">

                    {/* Brand Profile */}
                    <div>
                        <button
                            onClick={() => setBrandFormOpen(v => !v)}
                            className="w-full flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors mb-2"
                        >
                            <span className="flex items-center gap-1.5"><Settings className="w-3 h-3" /> Brand Profile</span>
                            {brandFormOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <select
                            value={selectedBrandId}
                            onChange={e => handleBrandSelect(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[12px] font-mono focus:outline-none focus:border-[#26cece]/50 transition-colors appearance-none"
                        >
                            <option value="new" className="bg-[#1a1a2e]">+ Create New Profile</option>
                            {brandConfigs.map(b => <option key={b._id} value={b._id} className="bg-[#1a1a2e]">{b.brand_name}</option>)}
                        </select>
                        {brandFormOpen && (
                            <div className="mt-3">
                                <BrandConfigForm onSave={handleSaveBrandConfig} initialData={brandConfig} />
                            </div>
                        )}
                        {brandConfig && !brandFormOpen && (
                            <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                                <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> {brandConfig.brand_name || 'Brand'} ready
                                </p>
                                <button
                                    onClick={() => setBrandFormOpen(true)}
                                    className="text-[10px] font-mono text-[#26cece] hover:text-white flex items-center gap-1 transition-colors bg-[#26cece]/10 px-2 py-0.5 rounded"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Calendar Strategy */}
                    <div>
                        <button
                            onClick={() => setCalFormOpen(v => !v)}
                            className="w-full flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors mb-2"
                        >
                            <span className="flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Calendar Strategy</span>
                            {calFormOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        <select
                            value={selectedCalendarId}
                            onChange={e => handleCalendarSelect(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-[12px] font-mono focus:outline-none focus:border-[#26cece]/50 transition-colors appearance-none"
                        >
                            <option value="new" className="bg-[#1a1a2e]">+ Create New Strategy</option>
                            {calendarConfigs.map(c => <option key={c._id} value={c._id} className="bg-[#1a1a2e]">{c.month} {c.year}</option>)}
                        </select>
                        {calFormOpen && (
                            <div className="mt-3">
                                <CalendarSettings onSave={handleSaveCalendar} initialData={calendarConfig} />
                            </div>
                        )}
                        {calendarConfig && !calFormOpen && (
                            <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                                <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> {calendarConfig.month} {calendarConfig.year} ready
                                </p>
                                <button
                                    onClick={() => setCalFormOpen(true)}
                                    className="text-[10px] font-mono text-[#26cece] hover:text-white flex items-center gap-1 transition-colors bg-[#26cece]/10 px-2 py-0.5 rounded"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Generate trigger */}
                    <div className="pt-2 border-t border-white/10">
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-mono text-white/60 uppercase tracking-widest">Plan Duration</label>
                                <span className="text-[11px] font-mono text-[#26cece]">{daysToGenerate}d</span>
                            </div>
                            <div className="flex gap-1.5 flex-wrap items-center">
                                {[7, 14, 30].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => { setDaysToGenerate(d); setIsCustomDays(false); }}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-colors ${
                                            !isCustomDays && daysToGenerate === d
                                                ? 'bg-[#26cece]/20 border border-[#26cece]/40 text-[#26cece]'
                                                : 'bg-white/5 border border-white/10 text-white/50 hover:text-white/80'
                                        }`}
                                    >
                                        {d === 7 ? '1 Week' : d === 14 ? '2 Weeks' : '1 Month'}
                                    </button>
                                ))}
                                {isCustomDays ? (
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={daysToGenerate}
                                            onChange={(e) => setDaysToGenerate(parseInt(e.target.value) || 1)}
                                            className="w-16 px-2 py-1.5 bg-[#26cece]/10 border border-[#26cece]/30 rounded-lg text-[11px] font-mono text-[#26cece] focus:outline-none focus:border-[#26cece] text-center"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => setIsCustomDays(false)}
                                            className="p-1 rounded text-white/40 hover:text-white/80"
                                            title="Close Custom Input"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsCustomDays(true)}
                                        className="px-3 py-1.5 rounded-lg text-[11px] font-mono bg-white/5 border border-white/10 text-white/50 hover:text-white/80 transition-colors"
                                    >
                                        Custom
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3 px-1 mt-3 border-t border-white/5 pt-3">
                            <input 
                                type="checkbox" 
                                id="generate_graphics"
                                checked={generateGraphics}
                                onChange={(e) => setGenerateGraphics(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-[#26cece] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <label htmlFor="generate_graphics" className="text-[10px] font-mono text-white/60 cursor-pointer select-none">
                                Generate Graphics during drafting
                            </label>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !canGenerate}
                            className={`w-full py-3 rounded-xl font-bold font-mono text-[12px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                isGenerating || !canGenerate
                                    ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                                    : 'bg-[#26cece] hover:bg-[#1db8b8] text-black shadow-[0_0_20px_rgba(38,206,206,0.2)]'
                            }`}
                        >
                            {isGenerating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                            ) : (
                                <><Zap className="w-4 h-4" /> Generate Plan</>
                            )}
                        </button>

                        {!canGenerate && (
                            <p className="text-[10px] font-mono text-white/30 text-center mt-2">
                                Save brand & calendar config first
                            </p>
                        )}
                        
                        {canGenerate && !generateGraphics && (
                            <p className="text-[9px] font-mono text-amber-400/80 text-center mt-3 leading-relaxed">
                                * Graphics will be generated later at posting.
                            </p>
                        )}
                        {canGenerate && generateGraphics && (
                            <p className="text-[9px] font-mono text-[#26cece]/60 text-center mt-3 leading-relaxed">
                                * AI will generate both text & graphics. This takes longer.
                            </p>
                        )}

                        {Object.keys(generatedPosts).length > 0 && (
                            <button
                                onClick={() => setActiveView?.('approval_queue')}
                                className="w-full mt-3 py-2.5 rounded-xl font-mono text-[11px] uppercase tracking-wider border border-[#26cece]/30 text-[#26cece] hover:bg-[#26cece]/10 transition-colors"
                            >
                                View Approval Queue →
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Content Calendar Grid ────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Grid toolbar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <button onClick={prevPeriod} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[13px] font-bold font-['Space_Grotesk'] text-white min-w-[180px] text-center">{periodLabel}</span>
                        <button onClick={nextPeriod} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('week')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-colors ${
                                viewMode === 'week' ? 'bg-[#26cece]/20 text-[#26cece] border border-[#26cece]/30' : 'text-white/50 hover:text-white/80'
                            }`}
                        >
                            <CalendarDays className="w-3 h-3" /> Week
                        </button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider transition-colors ${
                                viewMode === 'month' ? 'bg-[#26cece]/20 text-[#26cece] border border-[#26cece]/30' : 'text-white/50 hover:text-white/80'
                            }`}
                        >
                            <LayoutGrid className="w-3 h-3" /> Month
                        </button>
                    </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 px-4 pt-3 pb-1 gap-2">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-[10px] font-mono uppercase tracking-widest text-white/30">{d}</div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {viewMode === 'week' ? (
                        <div className="grid grid-cols-7 gap-2">
                            {weekDays.map((date, i) => (
                                <DayCell key={i} date={date} compact={false} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {monthCells.map((date, i) => (
                                <DayCell key={i} date={date} compact={true} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 px-6 py-2.5 border-t border-white/10 bg-white/[0.02]">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Legend</span>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#26cece]/20 border border-[#26cece]/30" /> Today
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> AI Draft
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
                        <Plus className="w-3 h-3 text-white/30" /> Add post
                    </span>
                    {isGenerating && (
                        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-mono text-[#26cece]">
                            <Loader2 className="w-3 h-3 animate-spin" /> AI is drafting your content…
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
