import React, { useState, useEffect } from 'react';
import { ArrowRight, Mic, MessageSquare, Edit3, Play, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoModal from '../ui/VideoModal';

const TEAL = '#26CECE';

const slides = [
    {
        id: 'seo-agent',
        title1: 'Automate Your Traffic with the',
        title2: 'GEO (Generative) AI Agent',
        icon: Edit3,
        description: 'Stop writing manually. Our autonomous agent runs keyword research and turns them into fully-formatted, GEO-optimised blog posts.',
        features: ['Keyword Research', 'Auto-Publishing', 'SERP Tracking'],
    },
    {
        id: 'voice-agent',
        title1: 'Turn Missed Opportunities Into',
        title2: 'Closed Deals',
        icon: Mic,
        description: 'Deploy a 24/7 AI Voice Agent that talks to your leads, answers questions, and books appointments automatically over the phone.',
        features: ['Inbound & Outbound Calling', 'Natural Human Voices', 'Appointment Scheduling'],
    },
    {
        id: 'whatsapp-agent',
        title1: 'Engage Website Visitors with',
        title2: 'WhatsApp Automation',
        icon: MessageSquare,
        description: "Capture leads instantly and follow up with a WhatsApp broadcasting AI trained on your company's proprietary data.",
        features: ['Bulk Broadcasting', 'Instant Responses', 'Lead Segmentation'],
    },
    {
        id: 'graphic-agent',
        title1: 'Generate Stunning Visuals with the',
        title2: 'Graphic AI Agent',
        icon: ImageIcon,
        description: 'Instantly produce high-converting ad creatives, thumbnails, and social graphics without a designer. Automated and branded for your business.',
        features: ['Ad Creatives', 'Blog Thumbnails', 'Social Graphics'],
    }
];

const HeroSection = ({ onOpenBooking }) => {
    const [current, setCurrent] = useState(0);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (isHovering) return; // Pause on hover
        const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 8000);
        return () => clearInterval(t);
    }, [isHovering]);

    const slide = slides[current];
    const Icon = slide.icon;

    return (
        <header className="relative min-h-screen flex items-center pt-28 pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/50 z-0" />
            
            {/* Multi-layer ambient glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] pointer-events-none z-0"
                style={{ background: `${TEAL}15` }} />

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{ backgroundImage: 'linear-gradient(#26CECE 1px, transparent 1px), linear-gradient(90deg, #26CECE 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-0" />

            <div className="max-w-4xl mx-auto px-6 relative z-10 w-full flex flex-col items-center text-center">

                {/* Text Content */}
                <div 
                    className="flex flex-col items-center cursor-default"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {/* Slide indicators */}
                    <div className="flex items-center gap-3 mb-10">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                aria-label={`Slide ${i + 1}`}
                                className="group relative outline-none"
                                style={{ padding: '8px 4px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                <motion.div
                                    animate={{
                                        width: i === current ? 48 : 12,
                                        background: i === current ? TEAL : 'rgba(255,255,255,0.3)',
                                    }}
                                    whileHover={{ scaleY: 1.5, background: i === current ? TEAL : 'rgba(255,255,255,0.6)' }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        height: 4,
                                        borderRadius: 2,
                                    }}
                                />
                                {/* Glow effect on active indicator */}
                                {i === current && (
                                    <div className="absolute inset-0 top-1/2 -translate-y-1/2 blur-[4px] bg-teal-400/40 w-12 h-2 rounded-full -z-10" />
                                )}
                            </button>
                        ))}
                    </div>

                    <h1 className="sr-only">Bitlance Automation | AI Voice Bots &amp; Business Automation Services</h1>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full flex flex-col items-center"
                        >
                            {/* Agent badge — glassmorphism pill */}
                            <motion.div 
                                whileHover={{ scale: 1.05, background: 'rgba(38,206,206,0.2)' }}
                                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full transition-colors cursor-default"
                                style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    letterSpacing: '0.14em',
                                    color: TEAL,
                                    textTransform: 'uppercase',
                                    background: 'rgba(38,206,206,0.12)',
                                    border: '1px solid rgba(38,206,206,0.3)',
                                    backdropFilter: 'blur(12px)',
                                }}>
                                <Icon size={16} /> {slide.id.replace('-', ' ')}
                            </motion.div>

                            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] text-white"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.04em' }}>
                                {slide.title1}<br />
                                <span style={{ color: TEAL }}>{slide.title2}</span>
                            </h2>

                            <p className="text-lg md:text-xl font-medium text-white/80 mb-10 max-w-2xl leading-relaxed">
                                {slide.description}
                            </p>

                            {/* Feature tags — glass chips */}
                            <div className="flex flex-wrap justify-center gap-3 mb-12">
                                {slide.features.map((f, i) => (
                                    <motion.span 
                                        key={f} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 + 0.3 }}
                                        whileHover={{ 
                                            scale: 1.05, 
                                            y: -2,
                                            background: 'rgba(255,255,255,0.15)',
                                            borderColor: 'rgba(255,255,255,0.4)',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                                        }}
                                        className="cursor-default"
                                        style={{
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            letterSpacing: '0.1em',
                                            color: '#fff',
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            borderRadius: 6,
                                            padding: '6px 16px',
                                            textTransform: 'uppercase',
                                            background: 'rgba(255,255,255,0.05)',
                                            backdropFilter: 'blur(8px)',
                                        }}>
                                        {f}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                        <motion.button
                            onClick={onOpenBooking}
                            whileHover={{ backgroundColor: '#35DFDF', scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="audit-cta group inline-flex items-center gap-3 font-black text-lg transition-all"
                            style={{
                                background: TEAL,
                                color: '#000',
                                padding: '20px 40px',
                                borderRadius: 8,
                                border: 'none',
                                cursor: 'pointer',
                                letterSpacing: '-0.01em',
                                fontFamily: "'Space Grotesk', sans-serif",
                                boxShadow: `0 20px 40px ${TEAL}30`,
                            }}
                        >
                            Get Free Audit
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>

                        <motion.button
                            onClick={() => setIsVideoOpen(true)}
                            whileHover={{ background: 'rgba(255,255,255,0.1)', scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="group inline-flex items-center gap-3 font-black text-lg transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                padding: '20px 40px',
                                borderRadius: 8,
                                border: '1px solid rgba(255,255,255,0.2)',
                                cursor: 'pointer',
                                letterSpacing: '-0.01em',
                                fontFamily: "'Space Grotesk', sans-serif",
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-teal-400/20 transition-colors">
                                <Play size={16} className="fill-white group-hover:fill-teal-400 text-white group-hover:text-teal-400 ml-0.5" />
                            </div>
                            Watch Demo
                        </motion.button>
                    </div>
                </div>
            </div>

            <VideoModal 
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
                videoSrc="/why_bitlance.mp4"
            />
        </header>
    );
};

export default HeroSection;


