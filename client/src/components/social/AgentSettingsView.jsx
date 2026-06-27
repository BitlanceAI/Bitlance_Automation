import React, { useState } from 'react';
import BrandConfigForm from './dashboard/BrandConfigForm';
import CalendarSettings from './dashboard/CalendarSettings';
import { Sparkles, Zap } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { supabase } from '../../services/supabaseClient';

const AgentSettingsView = ({ setActiveView }) => {
    const [brandConfigs, setBrandConfigs] = useState([]);
    const [calendarConfigs, setCalendarConfigs] = useState([]);
    
    const [selectedBrandId, setSelectedBrandId] = useState('new');
    const [selectedCalendarId, setSelectedCalendarId] = useState('new');
    
    const [brandConfig, setBrandConfig] = useState(null);
    const [calendarConfig, setCalendarConfig] = useState(null);
    
    const [daysToGenerate, setDaysToGenerate] = useState(3);
    const [isGenerating, setIsGenerating] = useState(false);
    const { activeWorkspace } = useWorkspace();

    const fetchConfigs = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const headers = { 
                'Authorization': `Bearer ${token}`,
                'x-workspace-id': activeWorkspace?.id || 'default_workspace'
            };
            
            const [brandRes, calRes] = await Promise.all([
                fetch('/api/agent/brand-configs', { headers }),
                fetch('/api/agent/calendars', { headers })
            ]);
            
            const brandData = await brandRes.json();
            const calData = await calRes.json();
            
            if (brandData.success) setBrandConfigs(brandData.data);
            if (calData.success) setCalendarConfigs(calData.data);
        } catch (error) {
            console.error('Failed to fetch configs:', error);
        }
    };

    React.useEffect(() => {
        if (activeWorkspace?.id) {
            fetchConfigs();
        }
    }, [activeWorkspace?.id]);

    const handleSaveBrandConfig = async (data) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const method = selectedBrandId === 'new' ? 'POST' : 'PUT';
            const url = selectedBrandId === 'new' 
                ? '/api/agent/brand-configs' 
                : `/api/agent/brand-configs/${selectedBrandId}`;
                
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-workspace-id': activeWorkspace?.id || 'default_workspace'
                },
                body: JSON.stringify(data)
            });
            
            const result = await res.json();
            if (result.success) {
                setBrandConfig(result.data);
                setSelectedBrandId(result.data.id);
                await fetchConfigs();
                alert('Brand configuration saved successfully!');
            }
        } catch (e) {
            alert('Failed to save brand config.');
        }
    };

    const handleSaveCalendar = async (data) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            const method = selectedCalendarId === 'new' ? 'POST' : 'PUT';
            const url = selectedCalendarId === 'new' 
                ? '/api/agent/calendars' 
                : `/api/agent/calendars/${selectedCalendarId}`;
                
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-workspace-id': activeWorkspace?.id || 'default_workspace'
                },
                body: JSON.stringify(data)
            });
            
            const result = await res.json();
            if (result.success) {
                setCalendarConfig(result.data);
                setSelectedCalendarId(result.data.id);
                await fetchConfigs();
                alert('Calendar configuration saved successfully!');
            }
        } catch (e) {
            alert('Failed to save calendar config.');
        }
    };

    const handleBrandSelect = (e) => {
        const id = e.target.value;
        setSelectedBrandId(id);
        if (id === 'new') {
            setBrandConfig({ brand_name: '', brand_tone: '', brand_niche: '' });
        } else {
            const config = brandConfigs.find(b => b.id === id);
            setBrandConfig(config);
        }
    };

    const handleCalendarSelect = (e) => {
        const id = e.target.value;
        setSelectedCalendarId(id);
        if (id === 'new') {
            setCalendarConfig({ month: new Date().toLocaleString('default', { month: 'long' }), year: new Date().getFullYear().toString(), themes: [], festivals: [] });
        } else {
            const config = calendarConfigs.find(c => c.id === id);
            setCalendarConfig(config);
        }
    };

    const handleGenerate = async () => {
        if (!brandConfig || !calendarConfig) {
            alert("Please save both Brand Config and Calendar Settings first.");
            return;
        }

        setIsGenerating(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch('/api/agent/bundles/generate', {
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
                    days: daysToGenerate 
                })
            });

            const result = await res.json();
            if (result.success) {
                alert(`Successfully drafted ${daysToGenerate} posts! Redirecting to Approval Queue...`);
                if (setActiveView) setActiveView('approval_queue');
            } else {
                alert('Generation failed: ' + result.message);
            }
        } catch (error) {
            console.error('Error generating:', error);
            alert('An error occurred during generation.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-8 max-w-[1200px] mx-auto h-full overflow-y-auto">
            <div className="mb-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-white tracking-tight uppercase">AI Agent Settings</h1>
                    <p className="text-teal-50/70 font-mono text-sm mt-1">Configure your brand details and graphic assets for the autonomous AI agent.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <label className="block text-sm font-mono text-white/80 mb-2">Select Brand Profile</label>
                        <select 
                            value={selectedBrandId} 
                            onChange={handleBrandSelect}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#26cece] transition-all font-mono text-sm"
                        >
                            <option value="new">+ Create New Profile</option>
                            {brandConfigs.map(b => (
                                <option key={b.id} value={b.id}>{b.brand_name}</option>
                            ))}
                        </select>
                    </div>
                    <BrandConfigForm onSave={handleSaveBrandConfig} initialData={brandConfig} />
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-6">
                        <label className="block text-sm font-mono text-white/80 mb-2">Select Calendar Strategy</label>
                        <select 
                            value={selectedCalendarId} 
                            onChange={handleCalendarSelect}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#26cece] transition-all font-mono text-sm"
                        >
                            <option value="new">+ Create New Strategy</option>
                            {calendarConfigs.map(c => (
                                <option key={c.id} value={c.id}>{c.month} {c.year}</option>
                            ))}
                        </select>
                    </div>
                    <CalendarSettings onSave={handleSaveCalendar} initialData={calendarConfig} />
                </div>
                <div className="space-y-8">
                    {/* Placeholder for Graphic Assets Upload UI */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider mb-2">Graphic Assets</h2>
                        <p className="text-teal-50/70 text-sm font-mono mb-4">Upload images and banners for the AI to use in your posts.</p>

                        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <span className="text-2xl opacity-50">🖼️</span>
                            </div>
                            <p className="text-white/80 font-mono text-sm mb-2">Drag and drop images here</p>
                            <p className="text-white/40 text-xs font-mono">Supports JPG, PNG (Max 5MB)</p>
                            <button className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider rounded-lg transition-colors">
                                Browse Files
                            </button>
                        </div>
                    </div>
                </div>

                {/* Generate Button Card */}
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 mt-8">
                    <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-400" />
                        Trigger AI Agent
                    </h2>
                    <p className="text-white/70 text-sm font-mono mb-4">
                        Once your settings are saved, select how many days you want to plan for and click below to let the AI draft your posting schedule complete with strategies, captions, hashtags, and generated graphics.
                    </p>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-mono text-white/80 mb-2">Number of Days: {daysToGenerate}</label>
                        <input 
                            type="range" 
                            min="1" 
                            max="30" 
                            value={daysToGenerate} 
                            onChange={(e) => setDaysToGenerate(parseInt(e.target.value))}
                            className="w-full accent-[#26cece]"
                        />
                        <div className="flex justify-between text-xs text-white/40 font-mono mt-1">
                            <span>1 Day</span>
                            <span>30 Days</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !brandConfig || !calendarConfig}
                        className={`w-full py-4 rounded-xl font-bold font-mono text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                            isGenerating || !brandConfig || !calendarConfig 
                            ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                            : 'bg-[#26cece] hover:bg-[#1db8b8] text-black shadow-[0_0_20px_rgba(38,206,206,0.3)]'
                        }`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Drafting Content (This takes a minute)...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Draft {daysToGenerate}-Day Posting Plan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>

    );
};

export default AgentSettingsView;
