import React from 'react';
import { Database, Clock, Zap, BarChart3, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';

const T = '#26CECE';

const problems = [
    {
        icon: Database,
        manualTitle: 'Manual Work',
        manualDesc: 'Leads tracked across spreadsheets, WhatsApp, and scattered tools.',
        autoTitle: 'Automated System',
        autoDesc: 'AI instantly captures and syncs every lead straight into your CRM.',
    },
    {
        icon: Clock,
        manualTitle: 'Slow Responses',
        manualDesc: 'Leads often wait hours before receiving a response, killing interest.',
        autoTitle: 'Instant Speed',
        autoDesc: 'Our system engages and qualifies new leads within 0.4 s, 24/7.',
    },
    {
        icon: Zap,
        manualTitle: 'Lost Opportunities',
        manualDesc: 'Hot leads go cold without consistent, immediate follow-ups.',
        autoTitle: 'Won Deals',
        autoDesc: 'Relentless, automated follow-up sequences until they book.',
    },
    {
        icon: BarChart3,
        manualTitle: 'No Visibility',
        manualDesc: 'Lack of a centralised place to track conversations and lead status.',
        autoTitle: 'Full Visibility',
        autoDesc: 'A centralised, real-time dashboard of every AI conversation.',
    },
];

const ProblemSection = () => (
    <section className="py-24 relative overflow-hidden bg-[#070707]">
        <ScrollReveal className="max-w-7xl mx-auto px-6">
            {/* Heading — left-aligned editorial */}
            <div className="mb-16 max-w-2xl">
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: '#555', textTransform: 'uppercase' }}>
                    The Problem
                </span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }} viewport={{ once: true }}
                    className="mt-4 text-3xl md:text-5xl font-black text-white uppercase leading-tight"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.03em' }}
                >
                    From Manual Grind<br /><span style={{ color: T }}>To Autonomous Systems</span>
                </motion.h2>
                <div className="mt-6" style={{ width: 48, height: 2, background: T }} />
                <motion.p
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 }} viewport={{ once: true }}
                    className="mt-6 text-base text-white/40 leading-relaxed"
                >
                    Traditional lead management is broken. We replace your manual bottlenecks with seamless, automated workflows.
                </motion.p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {problems.map((p, idx) => {
                    const Icon = p.icon;
                    return (
                        <TiltCard key={idx} className={`h-full ${idx === 3 ? 'hidden md:block' : ''}`}>
                            <div
                                className="h-full flex flex-col p-6 rounded group transition-all duration-300"
                                style={{ background: '#111', border: '1px solid #1E1E1E' }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = `${T}40`)}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E1E1E')}
                            >
                                {/* Before */}
                                <div className="mb-4">
                                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.18em', color: '#3A3A3A', textDecoration: 'line-through', textDecorationColor: '#ef444460', textTransform: 'uppercase' }}>
                                        Before — {p.manualTitle}
                                    </span>
                                    <p className="mt-2 text-sm text-white/25 line-through leading-relaxed" style={{ textDecorationColor: '#ef444430' }}>
                                        {p.manualDesc}
                                    </p>
                                </div>
                                {/* Divider */}
                                <div className="flex items-center gap-3 my-4 opacity-30">
                                    <div className="flex-1 h-px bg-[#1E1E1E]" />
                                    <div className="w-6 h-6 rounded flex items-center justify-center" style={{ border: '1px solid #1E1E1E' }}>
                                        <ArrowDown size={11} style={{ color: T }} />
                                    </div>
                                    <div className="flex-1 h-px bg-[#1E1E1E]" />
                                </div>
                                {/* After */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                                            style={{ background: `${T}15`, border: `1px solid ${T}30` }}>
                                            <Icon size={14} style={{ color: T }} />
                                        </div>
                                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.14em', color: T, textTransform: 'uppercase' }}>
                                            {p.autoTitle}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/80 leading-relaxed">{p.autoDesc}</p>
                                </div>
                            </div>
                        </TiltCard>
                    );
                })}
            </div>
        </ScrollReveal>
    </section>
);

export default ProblemSection;
