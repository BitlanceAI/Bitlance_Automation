import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ui/ScrollReveal';

const T = '#26CECE';

const features = [
    'Native AI Voice Integration',
    'Custom Trained for Your Data',
    'Seamless CRM Automation',
    'Zero Management Overhead',
];

const WhyBitlanceSection = () => {
    const videoRef = useRef(null);
    const [manualPause, setManualPause] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { if (!manualPause) video.play().catch(() => {}); } else { video.pause(); } },
            { threshold: 0.5 }
        );
        obs.observe(video);
        return () => { if (video) obs.unobserve(video); };
    }, [manualPause]);

    return (
        <section className="py-24 relative overflow-hidden bg-[#070707]">
            <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6">
                <div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center p-4 sm:p-8 lg:p-14 rounded"
                    style={{ background: '#0D0D0D', border: '1px solid #1A1A1A' }}
                >
                    {/* Left: Content */}
                    <div className="space-y-8 order-2 lg:order-1">
                        <div>
                            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: T, textTransform: 'uppercase' }}>
                                Why Bitlance
                            </span>
                            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase leading-tight"
                                style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.03em' }}>
                                Why Bitlance Technology?
                            </h2>
                            <div className="mt-5" style={{ width: 48, height: 2, background: T }} />
                            <p className="mt-5 text-base text-white/50 leading-relaxed max-w-lg">
                                We don't just provide tools. We build autonomous systems that handle the heavy lifting of lead engagement and sales follow-up — so you can focus on closing deals.
                            </p>
                        </div>

                        {/* Feature list — left-border style */}
                        <div className="space-y-3 border-l-2 pl-5" style={{ borderColor: '#1E1E1E' }}>
                            {features.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -12 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.35, delay: idx * 0.07 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle2 size={14} style={{ color: T, flexShrink: 0 }} />
                                    <span className="text-sm font-medium text-white/80"
                                        style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                                        {item}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Video */}
                    <div className="relative group order-1 lg:order-2 w-full">
                        <div className="aspect-video w-full rounded overflow-hidden relative shadow-2xl"
                            style={{ background: '#111', border: '1px solid #1E1E1E', boxShadow: `0 24px 60px -16px ${T}18` }}>
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
                        <div className="absolute -inset-3 rounded blur-2xl -z-10 opacity-50 group-hover:opacity-80 transition-opacity"
                            style={{ background: `${T}10` }} />
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.15 }} viewport={{ once: true }}
                    >
                        <Link
                            to="/apply"
                            className="audit-cta inline-flex items-center gap-3 font-bold uppercase tracking-widest text-sm transition-all group"
                            style={{
                                background: 'transparent',
                                border: `1px solid #1E1E1E`,
                                color: '#EFEFEF',
                                padding: '18px 40px',
                                borderRadius: 2,
                                fontFamily: "'Space Grotesk',sans-serif",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = T;
                                e.currentTarget.style.color = T;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#1E1E1E';
                                e.currentTarget.style.color = '#EFEFEF';
                            }}
                        >
                            <Sparkles size={18} style={{ color: T }} className="group-hover:rotate-12 transition-transform" />
                            Get Free Audit
                        </Link>
                        <p className="mt-4 text-white/30 text-xs uppercase tracking-widest"
                            style={{ fontFamily: "'DM Mono',monospace" }}>
                            Takes less than 2 minutes · No card required
                        </p>
                    </motion.div>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default WhyBitlanceSection;
