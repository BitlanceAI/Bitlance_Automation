import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, Mic, MessageSquare, Edit3, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TEAL = '#26CECE';

const slides = [
    {
        id: 'voice-agent',
        title1: 'Turn Missed Opportunities Into',
        title2: 'Closed Deals',
        icon: Mic,
        description: 'Deploy a 24/7 AI Voice Bot that talks to your leads, answers questions, and books appointments automatically over the phone.',
        features: ['Inbound & Outbound Calling', 'Natural Human Voices', 'Appointment Scheduling'],
    },
    {
        id: 'chat-agent',
        title1: 'Engage Website Visitors with',
        title2: 'Smart Chatbots',
        icon: MessageSquare,
        description: "Capture leads instantly and provide instant customer support with an AI agent trained specifically on your company's proprietary data.",
        features: ['24/7 Instant Responses', 'Fulfils Support Tickets', 'Multi-lingual Support'],
    },
    {
        id: 'blog-agent',
        title1: 'Automate Your SEO with the',
        title2: 'Blog AI Agent',
        icon: Edit3,
        description: 'Stop writing manually. Our autonomous agent takes your keywords and turns them into fully-formatted, SEO-optimised blog posts.',
        features: ['Keyword Research', 'Auto-Publishing', 'High-Ranking Content'],
    },
    {
        id: 'social-agent',
        title1: 'Dominate Every Feed with the',
        title2: 'Social Media Agent',
        icon: Share2,
        description: 'Maintain a non-stop social presence. From crafting viral tweets to scheduling daily LinkedIn carousel posts, completely hands-free.',
        features: ['Multi-platform Scheduling', 'AI Copywriting', 'Analytics Reporting'],
    },
];

const HeroSection = ({ onOpenBooking }) => {
    const [current, setCurrent] = useState(0);
    const videoRef = useRef(null);
    const [manualPause, setManualPause] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 8000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { if (!manualPause) video.play().catch(() => {}); } else { video.pause(); } },
            { threshold: 0.4 }
        );
        obs.observe(video);
        return () => { if (video) obs.unobserve(video); };
    }, [manualPause]);

    const slide = slides[current];
    const Icon = slide.icon;

    return (
        <header className="relative min-h-screen flex items-center pt-20 pb-8 lg:pt-24 lg:pb-12 overflow-hidden bg-[#070707]">
            {/* Multi-layer ambient glows */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none"
                style={{ background: `${TEAL}0A` }} />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
                style={{ background: '#8B5CF608' }} />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none"
                style={{ background: '#EC489908' }} />

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{ backgroundImage: 'linear-gradient(#26CECE 1px, transparent 1px), linear-gradient(90deg, #26CECE 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070707] to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Left — text */}
                <div className="flex flex-col items-start text-left">
                    {/* Slide indicators */}
                    <div className="flex items-center gap-3 mb-8">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                aria-label={`Slide ${i + 1}`}
                                style={{
                                    width: i === current ? 32 : 8,
                                    height: 3,
                                    background: i === current ? TEAL : '#2A2A2A',
                                    borderRadius: 2,
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        ))}
                    </div>

                    <h1 className="sr-only">Bitlance Automation | AI Voice Bots &amp; Business Automation Services</h1>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full"
                        >
                            {/* Agent badge — glassmorphism pill */}
                            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full"
                                style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 11,
                                    letterSpacing: '0.14em',
                                    color: TEAL,
                                    textTransform: 'uppercase',
                                    background: 'rgba(38,206,206,0.08)',
                                    border: '1px solid rgba(38,206,206,0.2)',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                <Icon size={14} /> {slide.id.replace('-', ' ')}
                            </div>

                            <h2 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-[1.08] text-white"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                                {slide.title1}<br />
                                <span style={{ color: TEAL }}>{slide.title2}</span>
                            </h2>

                            <p className="text-base md:text-lg text-white/60 mb-8 max-w-xl leading-relaxed">
                                {slide.description}
                            </p>

                            {/* Feature tags — glass chips */}
                            <div className="flex flex-wrap gap-2 mb-10">
                                {slide.features.map(f => (
                                    <span key={f} style={{
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: 11,
                                        letterSpacing: '0.1em',
                                        color: '#888',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        borderRadius: 4,
                                        padding: '5px 12px',
                                        textTransform: 'uppercase',
                                        background: 'rgba(255,255,255,0.04)',
                                        backdropFilter: 'blur(6px)',
                                    }}>
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* CTA */}
                    <motion.button
                        onClick={onOpenBooking}
                        whileHover={{ backgroundColor: '#35DFDF', scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="audit-cta group inline-flex items-center gap-3 font-bold text-base transition-all"
                        style={{
                            background: TEAL,
                            color: '#070707',
                            padding: '16px 32px',
                            borderRadius: 4,
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: '-0.01em',
                            fontFamily: "'Space Grotesk', sans-serif",
                            boxShadow: `0 0 32px ${TEAL}30, 0 8px 24px rgba(0,0,0,0.4)`,
                        }}
                    >
                        Get Free Audit
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </div>

                {/* Right — video with glassmorphism frame */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.3 }}
                    className="relative w-full order-first lg:order-last group"
                >
                    {/* Outer glow */}
                    <div className="absolute -inset-4 rounded-2xl blur-2xl -z-10 transition-opacity duration-500 group-hover:opacity-100 opacity-60"
                        style={{ background: `${TEAL}12` }} />

                    {/* Glass frame */}
                    <div className="p-1.5 rounded-2xl"
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(38,206,206,0.15)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: `0 32px 80px -20px ${TEAL}20, 0 0 0 1px rgba(255,255,255,0.04) inset`,
                        }}>
                        <div className="aspect-video w-full rounded-xl overflow-hidden relative"
                            style={{ background: '#111' }}>
                            <video
                                ref={videoRef}
                                src="/why_bitlance.mp4"
                                className="w-full h-full object-cover"
                                controls loop playsInline
                                onPlay={() => setManualPause(false)}
                                onPause={() => {
                                    if (videoRef.current) {
                                        const r = videoRef.current.getBoundingClientRect();
                                        if (r.top >= 0 && r.bottom <= window.innerHeight) setManualPause(true);
                                    }
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </header>
    );
};

export default HeroSection;
