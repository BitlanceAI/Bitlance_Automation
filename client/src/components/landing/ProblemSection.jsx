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
    <section className="py-12 relative overflow-hidden bg-transparent">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px] pointer-events-none"
            style={{ background: `${T}08` }} />

        <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Heading */}
            <div className="mb-16 max-w-2xl">
                <span className="text-slate-500 dark:text-slate-400"
                    style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    The Problem
                </span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }} viewport={{ once: true }}
                    className="mt-4 text-3xl md:text-5xl font-black uppercase leading-tight text-slate-900 dark:text-white"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.03em' }}
                >
                    From Manual Grind<br /><span style={{ color: T }}>To Autonomous Systems</span>
                </motion.h2>
                <div className="mt-6 rounded-full" style={{ width: 48, height: 2, background: T }} />
                <motion.p
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 }} viewport={{ once: true }}
                    className="mt-6 text-base leading-relaxed text-slate-600 dark:text-slate-400"
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
                                className="h-full flex flex-col p-6 rounded-2xl group transition-all duration-300 border
                                    bg-white border-slate-200/80 shadow-sm hover:border-teal-300
                                    dark:bg-white/[0.04] dark:border-white/[0.07] dark:hover:border-[#26CECE35]"
                                style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
                            >
                                {/* Before */}
                                <div className="mb-4">
                                    <span className="text-slate-400 dark:text-slate-500"
                                        style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.18em', textDecoration: 'line-through', textDecorationColor: '#ef444460', textTransform: 'uppercase' }}>
                                        Before — {p.manualTitle}
                                    </span>
                                    <p className="mt-2 text-sm leading-relaxed line-through text-slate-400 dark:text-white/30"
                                        style={{ textDecorationColor: '#ef444430' }}>
                                        {p.manualDesc}
                                    </p>
                                </div>
                                {/* Divider */}
                                <div className="flex items-center gap-3 my-4 opacity-40">
                                    <div className="flex-1 h-px bg-slate-300 dark:bg-white/10" />
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center border border-slate-200 dark:border-white/10"
                                        style={{ background: 'rgba(38,206,206,0.08)' }}>
                                        <ArrowDown size={11} style={{ color: T }} />
                                    </div>
                                    <div className="flex-1 h-px bg-slate-300 dark:bg-white/10" />
                                </div>
                                {/* After */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                                            style={{ background: `${T}15`, border: `1px solid ${T}30` }}>
                                            <Icon size={14} style={{ color: T }} />
                                        </div>
                                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '0.14em', color: T, textTransform: 'uppercase' }}>
                                            {p.autoTitle}
                                        </span>
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-800 dark:text-white/80">{p.autoDesc}</p>
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
