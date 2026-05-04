import React from 'react';
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
    return (
        <section className="py-12 relative overflow-hidden bg-transparent">
            {/* Ambient glows */}
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] -translate-y-1/2 rounded-full blur-[120px] pointer-events-none"
                style={{ background: `${T}07` }} />
            <div className="absolute top-1/2 right-0 w-[300px] h-[300px] -translate-y-1/2 rounded-full blur-[100px] pointer-events-none"
                style={{ background: '#8B5CF607' }} />

            <ScrollReveal className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Main glass card */}
                <div
                    className="flex flex-col items-center text-center p-8 sm:p-12 lg:p-16 rounded-2xl"
                    style={{
                        background: 'rgba(255,255,255,0.9)',
                        border: '1px solid rgba(38,206,206,0.1)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.03) inset`,
                    }}
                >
                    <div className="space-y-8 flex flex-col items-center">
                        <div className="flex flex-col items-center">
                            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: T, textTransform: 'uppercase' }}>
                                Why Bitlance
                            </span>
                            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-black uppercase leading-tight max-w-3xl"
                                style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.03em' }}>
                                Why Bitlance Technology?
                            </h2>
                            <div className="mt-6" style={{ width: 48, height: 2, background: T }} />
                            <p className="mt-6 text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl">
                                We don't just provide tools. We build autonomous systems that handle the heavy lifting of lead engagement and sales follow-up — so you can focus on closing deals.
                            </p>
                        </div>

                        {/* Feature list — centered flex wrap */}
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                            {features.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, delay: idx * 0.07 }}
                                    whileHover={{ 
                                        scale: 1.05, 
                                        y: -2,
                                        background: 'rgba(38,206,206,0.08)',
                                        borderColor: 'rgba(38,206,206,0.3)',
                                        boxShadow: '0 8px 24px rgba(38,206,206,0.1)'
                                    }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-3 px-5 py-3 rounded-full cursor-default"
                                    style={{
                                        background: 'rgba(38,206,206,0.02)',
                                        border: '1px solid rgba(38,206,206,0.1)',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <div className="bg-teal-500/10 p-1 rounded-full">
                                        <CheckCircle2 size={14} style={{ color: '#0F5252', flexShrink: 0 }} />
                                    </div>
                                    <span className="text-sm font-bold text-black"
                                        style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '0.02em' }}>
                                        {item}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.15 }} viewport={{ once: true }}
                    >
                        <Link
                            to="/apply"
                            className="audit-cta inline-flex items-center gap-3 font-extrabold uppercase tracking-widest text-sm transition-all group"
                            style={{
                                background: 'rgba(38,206,206,0.1)',
                                border: `1px solid rgba(38,206,206,0.4)`,
                                color: '#070707',
                                padding: '18px 40px',
                                borderRadius: 8,
                                fontFamily: "'Space Grotesk',sans-serif",
                                backdropFilter: 'blur(8px)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = T;
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.background = T;
                                e.currentTarget.style.boxShadow = `0 0 32px ${T}50`;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(38,206,206,0.4)';
                                e.currentTarget.style.color = '#070707';
                                e.currentTarget.style.background = 'rgba(38,206,206,0.1)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Sparkles size={18} style={{ color: '#0F5252' }} className="group-hover:rotate-12 group-hover:scale-110 transition-all" />
                            Get Free Audit
                        </Link>
                        <p className="mt-5 text-gray-600 text-xs uppercase tracking-widest"
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
