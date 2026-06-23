import React, { useState } from 'react';
import { Search, Tag, Wand2, ShieldCheck, Globe, ArrowRight, ArrowDown, Phone, Star, Clock, Maximize, Target, MessageCircle, Image as ImageIcon, Zap, Bot, Layout, Palette, Users, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import { useNavigate } from 'react-router-dom';

const TEAL = '#26CECE';

const BLOG_WORKFLOW_STEPS = [
    { icon: <Search className="w-8 h-8" style={{ color: TEAL }} />, title: "Trending Topics", badge: "SerpAPI", desc: "Searches Google in real-time to find trending topics and People Also Ask questions for your industry.", delay: 0.1 },
    { icon: <Tag className="w-8 h-8" style={{ color: TEAL }} />, title: "Keyword Research", badge: "SerpAPI", desc: "Extracts related searches and PAA signals from Google to build a real, rankable keyword set.", delay: 0.2 },
    { icon: <Wand2 className="w-8 h-8" style={{ color: TEAL }} />, title: "Content Generation", badge: "Perplexity AI", desc: "Injects SERP-sourced topic and keywords into a writing prompt to craft a fully GEO-optimized article.", delay: 0.3 },
    { icon: <ShieldCheck className="w-8 h-8" style={{ color: TEAL }} />, title: "Plagiarism Check", badge: "SerpAPI", desc: "Runs exact-phrase Google searches on key sentences to verify the content is original before publishing.", delay: 0.4 },
    { icon: <Globe className="w-8 h-8" style={{ color: TEAL }} />, title: "Auto-Publish", badge: "WordPress", desc: "Posts directly to your website with images, GEO title, and tags — fully hands-free.", delay: 0.5 }
];

const VOICE_FEATURES = [
    { title: "Pure Precision", desc: "99.8% accuracy in every call. No dropped details.", icon: Star },
    { title: "Always Active", desc: "24/7 support without overhead or sick days.", icon: Clock },
    { title: "Rapid Scale", desc: "Handle 10,000+ simultaneous calls instantly.", icon: Maximize },
    { title: "Smart Logic", desc: "Niche-specific custom training for your business.", icon: Target }
];

const WHATSAPP_FEATURES = [
    { icon: Zap, title: "Instant Reply", desc: "0.2s response to every lead." },
    { icon: MessageCircle, title: "Smart Chat", desc: "Context-aware conversations." },
    { icon: Layout, title: "Rich Media", desc: "Auto-send PDFs & catalogs." },
    { icon: Bot, title: "Auto-Booking", desc: "Syncs directly to your calendar." }
];

const GRAPHIC_FEATURES = [
    { icon: ImageIcon, title: "High-Res Art", desc: "4K quality image generation." },
    { icon: Palette, title: "Brand Kits", desc: "Matches your brand colors." },
    { icon: Zap, title: "Batch Create", desc: "Generate 50+ posts instantly." },
    { icon: Target, title: "Ad Optimized", desc: "Designed to drive clicks." }
];


// Individual Agent Components
const BlogAgentContent = ({ navigate }) => {
    const workflowSteps = BLOG_WORKFLOW_STEPS;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="w-full"
        >
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 leading-[1.08] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                    Automate Your GEO with the<br /><span style={{ color: TEAL }}>Blog AI Agent</span>
                </h2>
                <p className="text-base font-medium text-white mx-auto max-w-xl leading-relaxed">
                    Stop writing manually. Our autonomous agent takes your keywords and turns them into
                    fully-formatted, GEO-optimized blog posts published straight to your website.
                </p>
            </div>

            <div className="relative max-w-6xl mx-auto pb-8">
                {/* Connecting line (Desktop only) */}
                <div className="hidden md:block absolute top-[50px] left-[8%] right-[8%] h-[1px] border-t border-white/10 z-0">
                    <motion.div className="absolute inset-0 h-[1px] w-1/4 -top-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)` }} animate={{ left: ['-25%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                </div>

                <div className="grid md:grid-cols-5 gap-6 relative z-10">
                    {workflowSteps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center relative text-center group">
                            {index < workflowSteps.length - 1 && (
                                <div className="md:hidden my-4 transform translate-y-2" style={{ color: '#1E1E1E' }}><ArrowDown size={24} /></div>
                            )}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: step.delay }}
                                className="relative w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 bg-white/5"
                                style={{ background: 'transparent', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 2, boxShadow: `0 8px 30px -10px ${TEAL}15` }}
                            >
                                {step.icon}
                                <div className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center text-xs font-extrabold" style={{ background: TEAL, color: '#000', borderRadius: 2, fontFamily: "'DM Mono', monospace" }}>
                                    0{index + 1}
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: step.delay + 0.2 }}>
                                <h3 className="text-base font-extrabold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{step.title}</h3>
                                <div className="inline-block mb-2 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase" style={{ background: `${TEAL}15`, color: TEAL, border: `1px solid ${TEAL}30`, borderRadius: 2, fontFamily: "'DM Mono', monospace" }}>{step.badge}</div>
                                <p className="text-xs text-teal-50/90 leading-relaxed px-1" style={{ fontFamily: "'DM Mono', monospace" }}>{step.desc}</p>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <button onClick={() => navigate('/dashboard/agents/geo')} className="group inline-flex items-center gap-3 font-extrabold text-base transition-all hover:bg-black hover:text-white" style={{ background: TEAL, color: '#000', padding: '16px 32px', borderRadius: 2, border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Try the GEO (Generative) AI Agent <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

const VoiceAgentContent = ({ navigate }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center">
                <h2 className="text-3xl md:text-5xl lg:text-5xl font-black mb-6 text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Empower Your Business with <br/><span style={{ color: TEAL }}>AI Voice Agents</span>
                </h2>
                <p className="text-lg font-medium text-white mb-16 max-w-2xl leading-relaxed mx-auto">
                    Scale your business with AI agents that handle leads and bookings 24/7 with human-level accuracy.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12 text-left">
                    {VOICE_FEATURES.map((card, idx) => (
                        <div key={idx} className="p-8 h-full transition-all group flex flex-col hover:border-[#26CECE] bg-white/5" style={{ background: 'transparent', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 2 }}>
                            <div className="p-3 w-fit mb-6 transition-transform group-hover:scale-110" style={{ background: `${TEAL}15`, color: TEAL, border: `1px solid ${TEAL}40`, borderRadius: 2 }}>
                                <card.icon size={24} />
                            </div>
                            <h3 className="text-xl font-black mb-3 text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{card.title}</h3>
                            <p className="font-medium text-white text-sm leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {card.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <button onClick={() => navigate('/features/voice-bot')} className="group inline-flex items-center gap-3 font-extrabold text-base transition-all hover:bg-black hover:text-white" style={{ background: TEAL, color: '#000', padding: '16px 32px', borderRadius: 2, border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Try Voice Agent <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

const WhatsAppAgentContent = ({ navigate }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
             <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="flex flex-col items-start text-left">
                    <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black tracking-tight mb-6 leading-[1.08] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                        Convert Leads Instantly with<br /><span style={{ color: '#25D366' }}>WhatsApp AI Agents</span>
                    </h2>
                    <p className="text-base font-medium text-white mb-8 max-w-xl leading-relaxed">
                        Don't let leads go cold. Our WhatsApp AI answers queries, sends brochures, and schedules meetings instantly, 24/7.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 w-full mb-8">
                        {WHATSAPP_FEATURES.map((feature, idx) => (
                            <div key={idx} className="p-4 flex items-start gap-4 transition-all group relative overflow-hidden bg-white/5" style={{ background: 'transparent', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 2 }}>
                                <div className="w-8 h-8 shrink-0 flex items-center justify-center" style={{ border: `1px solid #25D36640`, background: `#25D36610`, borderRadius: 2 }}>
                                    <feature.icon size={16} style={{ color: '#25D366' }} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{feature.title}</h4>
                                    <p className="text-teal-50/90 text-xs leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/features/whatsapp-bot')} className="group inline-flex items-center gap-3 font-extrabold text-base transition-all hover:bg-black hover:text-white" style={{ background: '#25D366', color: '#fff', padding: '16px 32px', borderRadius: 2, border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
                        Try WhatsApp Agent <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="relative w-full flex items-center justify-center lg:justify-end group lg:h-[500px]">
                    <div className="absolute -inset-4 rounded-xl blur-2xl -z-10 opacity-60" style={{ background: `#25D36612` }} />
                    <div className="relative z-10 w-full max-w-sm">
                        <div className="aspect-[9/16] w-full overflow-hidden border relative shadow-2xl bg-teal-950 flex items-center justify-center" style={{ borderColor: '#1E1E1E', borderRadius: 24, boxShadow: `0 32px 80px -20px #25D36630`, border: '8px solid #222' }}>
                            {/* Placeholder for WhatsApp Agent Demo Image/Video */}
                            <div className="text-center p-6">
                                <MessageCircle size={48} color="#25D366" className="mx-auto mb-4" />
                                <p className="font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Interactive WhatsApp Demo</p>
                                <p className="text-sm text-gray-500 mt-2">Chatbot UI Simulation goes here</p>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-[#128C7E] to-[#25D366] opacity-10 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const GraphicAgentContent = ({ navigate }) => {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="flex flex-col items-start text-left">
                    <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black tracking-tight mb-6 leading-[1.08] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                        Generate Stunning Visuals with<br /><span style={{ color: '#8B5CF6' }}>Graphic AI Agents</span>
                    </h2>
                    <p className="text-base font-medium text-white mb-8 max-w-xl leading-relaxed">
                        Create ad creatives, social media posts, and product graphics in seconds. Just type what you need and watch it generate.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 w-full mb-8">
                        {GRAPHIC_FEATURES.map((feature, idx) => (
                            <div key={idx} className="p-4 flex items-start gap-4 transition-all group relative overflow-hidden bg-white/5" style={{ background: 'transparent', border: '1px solid rgba(128,128,128,0.2)', borderRadius: 2 }}>
                                <div className="w-8 h-8 shrink-0 flex items-center justify-center" style={{ border: `1px solid #8B5CF640`, background: `#8B5CF610`, borderRadius: 2 }}>
                                    <feature.icon size={16} style={{ color: '#8B5CF6' }} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{feature.title}</h4>
                                    <p className="text-teal-50/90 text-xs leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/dashboard/graphic-agents')} className="group inline-flex items-center gap-3 font-extrabold text-base transition-all hover:bg-black hover:text-white" style={{ background: '#8B5CF6', color: '#fff', padding: '16px 32px', borderRadius: 2, border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
                        Try Graphic Agent <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="relative w-full flex items-center justify-center lg:justify-end group lg:h-[500px]">
                    <div className="absolute -inset-4 rounded-xl blur-2xl -z-10 opacity-60" style={{ background: `#8B5CF612` }} />
                    <div className="relative z-10 w-full max-w-xl grid grid-cols-2 gap-4">
                        <div className="aspect-square bg-white/5 rounded-md shadow-lg border border-white/10 flex items-center justify-center overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop" alt="AI Generated" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                         <div className="aspect-square bg-white/5 rounded-md shadow-lg border border-white/10 flex items-center justify-center overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop" alt="AI Generated" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                         <div className="aspect-square bg-white/5 rounded-md shadow-lg border border-white/10 flex items-center justify-center overflow-hidden">
                             <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop" alt="AI Generated" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </div>
                         <div className="aspect-square bg-white/5 rounded-md shadow-lg border border-white/10 flex items-center justify-center overflow-hidden relative">
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-10">
                                <span className="text-white font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>+ Generating...</span>
                            </div>
                             <img src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop" alt="AI Generated" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


const IntegratedAgentsSection = ({ onOpenBooking }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('blog');

    const tabs = [
        { id: 'blog', label: 'GEO Blog Agent', icon: Globe, color: TEAL },
        { id: 'voice', label: 'AI Voice Agent', icon: Phone, color: TEAL },
        { id: 'whatsapp', label: 'WhatsApp Agent', icon: MessageCircle, color: '#25D366' },
        { id: 'graphic', label: 'Graphic AI Agent', icon: Palette, color: '#8B5CF6' }
    ];

    return (
        <section className="py-16 relative overflow-hidden bg-teal-900" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-1000 opacity-60" style={{ background: `${TEAL}0A` }} />

            <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                     <div className="inline-flex items-center gap-2 mb-4" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.14em', color: TEAL, textTransform: 'uppercase' }}>
                        <Wand2 size={14} /> UNIFIED AI PLATFORM
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-[1.08] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                        One Platform. <span style={{ color: TEAL }}>Infinite Capabilities.</span>
                    </h2>
                </div>

                {/* Agent Selection Tabs */}
                <div className="flex flex-wrap justify-center gap-3 mb-16">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="relative flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300"
                                style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    background: isActive ? tab.color : 'rgba(255,255,255,0.05)',
                                    color: isActive ? (tab.id === 'graphic' || tab.id === 'whatsapp' ? '#fff' : '#000') : '#ccfbfb',
                                    border: `1px solid ${isActive ? tab.color : 'rgba(255,255,255,0.1)'}`,
                                    boxShadow: isActive ? `0 8px 24px -8px ${tab.color}80` : 'none',
                                }}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute inset-0 rounded-full border-2"
                                        style={{ borderColor: tab.color, opacity: 0.3 }}
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Active Content Area */}
                <div className="min-h-[600px] flex items-center">
                    <AnimatePresence mode="wait">
                        {activeTab === 'blog' && <BlogAgentContent key="blog" navigate={navigate} />}
                        {activeTab === 'voice' && <VoiceAgentContent key="voice" navigate={navigate} />}
                        {activeTab === 'whatsapp' && <WhatsAppAgentContent key="whatsapp" navigate={navigate} />}
                        {activeTab === 'graphic' && <GraphicAgentContent key="graphic" navigate={navigate} />}
                    </AnimatePresence>
                </div>

            </ScrollReveal>
        </section>
    );
};

export default IntegratedAgentsSection;
