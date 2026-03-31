import React from 'react';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const T = '#26CECE';

const FinalCtaSection = ({ onOpenBooking }) => (
    <section className="py-12 relative overflow-hidden bg-[#070707]">
        {/* Strong teal glow at center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[140px] pointer-events-none"
            style={{ background: `${T}0C` }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[240px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: `${T}07` }} />

        <ScrollReveal className="max-w-4xl mx-auto px-6 text-center relative z-10">
            {/* Glass container */}
            <div
                className="rounded-2xl p-10 md:p-16"
                style={{
                    background: 'rgba(13,13,13,0.65)',
                    border: '1px solid rgba(38,206,206,0.12)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset, 0 0 60px ${T}08`,
                }}
            >
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: '#555', textTransform: 'uppercase' }}>
                    Final Step
                </span>

                <h2 className="mt-6 text-3xl md:text-5xl font-black text-white uppercase leading-tight"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.03em' }}>
                    Do you want to see how many more deals you can close if your follow-ups run{' '}
                    <span style={{ color: T }}>100% on autopilot?</span>
                </h2>

                {/* Teal accent rule */}
                <div className="mt-8 mb-8 mx-auto" style={{ width: 48, height: 2, background: T }} />

                <p className="text-base text-white/50 mb-12 max-w-xl mx-auto leading-relaxed">
                    Every lead that goes unanswered is revenue someone else is collecting. If we show you a live dashboard of your leads, follow-ups, and conversions in one screen — would 15 minutes be worth it?
                </p>

                <div className="flex flex-col items-center gap-8">
                    <button
                        onClick={onOpenBooking}
                        className="audit-cta font-black text-xl uppercase tracking-tight transition-all w-full sm:w-auto"
                        style={{
                            background: T,
                            color: '#070707',
                            padding: '18px 56px',
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: "'Space Grotesk',sans-serif",
                            boxShadow: `0 0 40px ${T}35, 0 8px 32px rgba(0,0,0,0.5)`,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = '#35DFDF';
                            e.currentTarget.style.boxShadow = `0 0 60px ${T}50, 0 8px 32px rgba(0,0,0,0.5)`;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = T;
                            e.currentTarget.style.boxShadow = `0 0 40px ${T}35, 0 8px 32px rgba(0,0,0,0.5)`;
                        }}
                    >
                        Get Free Audit
                    </button>

                    <div className="flex flex-col items-center gap-4">
                        <a
                            href="https://wa.me/917030951331"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors"
                            style={{ color: '#444', fontFamily: "'DM Mono',monospace" }}
                            onMouseEnter={e => (e.currentTarget.style.color = T)}
                            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                        >
                            <MessageCircle size={14} /> Prefer WhatsApp? Chat with our AI agent
                        </a>

                        <div
                            className="flex items-center gap-2 text-xs uppercase tracking-widest px-4 py-2 rounded-lg"
                            style={{
                                color: '#444',
                                fontFamily: "'DM Mono',monospace",
                                border: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(255,255,255,0.02)',
                                backdropFilter: 'blur(6px)',
                            }}
                        >
                            <ShieldCheck size={12} style={{ color: '#22c55e' }} />
                            No commitment · Cancel anytime · 30-day money back guarantee
                        </div>
                    </div>
                </div>
            </div>
        </ScrollReveal>
    </section>
);

export default FinalCtaSection;
