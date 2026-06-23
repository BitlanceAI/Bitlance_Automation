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
        manualDesc: 'Leads buried in messy spreadsheets, WhatsApp threads, and scattered CRM.',
        autoTitle: 'Automated System',
        autoDesc: 'Every lead auto-captured, synced to your CRM, and followed up — instantly.',
    },
    {
        icon: Clock,
        manualTitle: 'Slow Responses',
        manualDesc: 'Long wait times for your leads. Half have already moved on.',
        autoTitle: 'Instant Speed',
        autoDesc: 'AI agent answers in 0.4 seconds — before they open a competitor\'s page.',
    },
    {
        icon: Zap,
        manualTitle: 'Lost Opportunities',
        manualDesc: 'Hot leads go cold. Follow-ups depend on someone remembering to call.',
        autoTitle: 'Won Deals',
        autoDesc: 'Relentless long-term follow-up sequences. Hot leads stay hot until they book — or buy.',
    },
    {
        icon: BarChart3,
        manualTitle: 'No Visibility',
        manualDesc: "No idea where leads are, what was said, or what's still open.",
        autoTitle: 'Full Visibility',
        autoDesc: 'Every conversation recorded in a simple dashboard — full visibility guaranteed.',
    },
];

const ProblemSection = () => (
    <section className="py-12 relative overflow-hidden bg-teal-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[140px] pointer-events-none"
            style={{ background: `${T}08` }} />

        <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Heading */}
            <div className="mb-16 max-w-2xl">
                <span className="text-teal-200"
                    style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Every unanswered lead is a closed deal — for your competitor.
                </span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }} viewport={{ once: true }}
                    className="mt-4 text-3xl md:text-5xl font-black uppercase leading-tight text-white"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.03em' }}
                >
                    From Manual Grind<br /><span style={{ color: T }}>To Autonomous Systems</span>
                </motion.h2>
                <div className="mt-6 rounded-full" style={{ width: 48, height: 2, background: T }} />
                <motion.p
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 }} viewport={{ once: true }}
                    className="mt-6 text-base leading-relaxed text-teal-100"
                >
                    Here's what your business looks like right now vs. what it could look like in 48 hours.
                </motion.p>
            </div>

            {/* Two Column Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 mt-12">
                
                {/* Column 1: Before */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold font-mono text-sm border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            1
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                            The Old Way (Manual)
                        </h3>
                    </div>
                    
                    {problems.map((p, idx) => (
                        <TiltCard key={`before-${idx}`} className="w-full">
                            <div className="flex items-center gap-5 p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-sm transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/5 group"
                                style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-400 flex-shrink-0 border border-red-500/20 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-red-400/80 mb-1 block"
                                        style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                                        {p.manualTitle}
                                    </span>
                                    <p className="text-sm md:text-base font-medium text-white/70 leading-relaxed">
                                        {p.manualDesc}
                                    </p>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>

                {/* Column 2: After */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold font-mono text-sm border shadow-[0_0_15px_rgba(38,206,206,0.15)]"
                             style={{ background: `${T}15`, color: T, borderColor: `${T}30` }}>
                            2
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                            The New Way (Automated)
                        </h3>
                    </div>
                    
                    {problems.map((p, idx) => {
                        const Icon = p.icon;
                        return (
                            <TiltCard key={`after-${idx}`} className="w-full">
                                <div className="flex items-center gap-5 p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 shadow-sm transition-all duration-300 hover:border-teal-400/60 group"
                                    style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', ':hover': { backgroundColor: `${T}08` } }}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border group-hover:scale-110 transition-transform duration-300"
                                         style={{ background: `${T}15`, color: T, borderColor: `${T}30` }}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="mb-1 block"
                                            style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600, color: T }}>
                                            {p.autoTitle}
                                        </span>
                                        <p className="text-sm md:text-base font-medium text-teal-50 leading-relaxed">
                                            {p.autoDesc}
                                        </p>
                                    </div>
                                </div>
                            </TiltCard>
                        )
                    })}
                </div>
            </div>
        </ScrollReveal>
    </section>
);

export default ProblemSection;
