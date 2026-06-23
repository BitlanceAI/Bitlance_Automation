import React from 'react';
import { ArrowRight, MessageCircle, ShieldCheck, Zap, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

const T = '#26CECE';

const guarantees = [
    { icon: Zap,        text: 'Live in 48 hours' },
    { icon: Clock,      text: 'No long-term lock-in' },
    { icon: TrendingUp, text: '30-day money back' },
    { icon: ShieldCheck, text: 'Free setup audit' },
];

const FinalCtaSection = ({ onOpenBooking }) => (
    <section className="py-20 bg-teal-900 relative overflow-hidden">

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
            {/* Light mode */}
            <div className="dark:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px]"
                style={{ background: 'rgba(38,206,206,0.08)' }} />
            <div className="dark:hidden absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full blur-[120px]"
                style={{ background: 'rgba(124,58,237,0.05)' }} />
            {/* Dark mode */}
            <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[150px]"
                style={{ background: 'rgba(38,206,206,0.10)' }} />
            <div className="hidden dark:block absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full blur-[120px]"
                style={{ background: 'rgba(124,58,237,0.07)' }} />
        </div>

        <ScrollReveal className="max-w-4xl mx-auto px-5 relative z-10">

            {/* Main card */}
            <div className="rounded-3xl overflow-hidden
                bg-white/5 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
                style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            >
                {/* Top teal accent bar */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${T}, transparent)` }} />

                <div className="px-8 py-14 md:px-16 md:py-16 text-center">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl mb-8
                        bg-white/[0.06] border border-white/[0.1] text-teal-300"
                        style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T }} />
                        Limited slots — Book your free audit today
                    </div>

                    {/* Headline */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6
                        text-white"
                        style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.03em' }}
                    >
                        Every lead that goes unanswered tonight is revenue{' '}
                        <span className="block mt-1" style={{ color: T }}>someone else collects tomorrow.</span>
                    </h2>

                    {/* Divider */}
                    <div className="mx-auto mb-7 rounded-full" style={{ width: 48, height: 3, background: T }} />

                    {/* Subtext */}
                    <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-12
                        text-teal-50/70"
                    >
                        In a free 15-minute audit, we'll show you exactly how many deals you're leaving on the table —
                        and have your AI agent live within 48 hours.
                    </p>

                    {/* Guarantee chips */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {guarantees.map(({ icon: Icon, text }) => (
                            <div key={text}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold
                                    bg-white/[0.05] border border-white/[0.09] text-white/65"
                            >
                                <Icon size={13} style={{ color: T }} />
                                {text}
                            </div>
                        ))}
                    </div>

                    {/* Primary CTA */}
                    <motion.button
                        onClick={onOpenBooking}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="audit-cta group inline-flex items-center gap-3 font-black text-lg w-full sm:w-auto
                            justify-center transition-all"
                        style={{
                            background: T,
                            color: '#000',
                            padding: '18px 52px',
                            borderRadius: 20,
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: "'Space Grotesk',sans-serif",
                            letterSpacing: '-0.01em',
                            boxShadow: `0 16px 48px rgba(38,206,206,0.32), 0 4px 12px rgba(0,0,0,0.08)`,
                        }}
                    >
                        Get My Free Audit
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>

                    {/* Text under button */}
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <p className="text-sm font-medium text-white/80">
                            No commitment. No credit card. Just a straight conversation about your business.
                        </p>
                    </div>

                    {/* WhatsApp fallback */}
                    <div className="mt-8 flex flex-col items-center gap-3">
                        <p className="text-sm text-teal-100/70" style={{ fontFamily: "'DM Mono', monospace" }}>
                            Still not sure? See it in action <ArrowRight size={14} className="inline ml-1" />
                        </p>
                        <a
                            href="https://wa.me/917030951331"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold
                                transition-all duration-200 hover:scale-[1.02]
                                text-white/60 bg-white/[0.05] border border-white/[0.09] hover:text-teal-400 hover:border-teal-500/40 mt-2"
                        >
                            <MessageCircle size={15} style={{ color: '#25D366' }} />
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </ScrollReveal>
    </section>
);

export default FinalCtaSection;
