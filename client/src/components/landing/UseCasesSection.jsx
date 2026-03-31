import { Layout, Users, Zap, PenTool, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';

const TEAL = '#26CECE';

const UseCasesSection = () => {
    return (
        <section className="py-12 relative overflow-hidden bg-[#070707]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl lg:text-5xl font-extrabold mb-6 text-white tracking-tight"
                    >
                        Built for businesses that run on conversations
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/60 mb-2"
                    >
                        Perfect if you get enquiries daily and can’t afford to miss them.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Real Estate & Property", desc: "Capture every site visit enquiry, instantly send project details, and auto-schedule site visits.", icon: Layout },
                        { title: "Clinics & Local Services", desc: "Answer pricing and service questions, share offers, and confirm bookings without a receptionist.", icon: Users },
                        { title: "Agencies & SaaS", desc: "Pre-qualify leads from ads, demos, and websites, then send only sales-ready prospects to your team.", icon: Zap },
                        { title: "Education & Coaching", desc: "Handle admissions queries, share brochures, and book counselling or discovery calls on autopilot.", icon: PenTool }
                    ].map((card, idx) => (
                        <TiltCard key={idx} className="h-full">
                            <div 
                                className="p-8 h-full transition-all group flex flex-col hover:border-[#26CECE]"
                                style={{
                                    background: '#111111',
                                    border: '1px solid #1E1E1E',
                                    borderRadius: 2,
                                }}
                            >
                                <div 
                                    className="p-3 w-fit mb-6 transition-transform group-hover:scale-110"
                                    style={{
                                        background: `${TEAL}15`,
                                        color: TEAL,
                                        border: `1px solid ${TEAL}40`,
                                        borderRadius: 2
                                    }}
                                >
                                    <card.icon size={24} />
                                </div>
                                <h3 className="text-xl font-extrabold mb-3 text-white tracking-tight">{card.title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                    {card.desc}
                                </p>
                            </div>
                        </TiltCard>
                    ))}
                </div>

                {/* Brutalist Solid CTA */}
                <div className="mt-20 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="inline-block"
                    >
                        <Link
                            to="/apply"
                            className="audit-cta group inline-flex items-center gap-3 font-bold text-base transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: TEAL,
                                color: '#070707',
                                padding: '16px 32px',
                                borderRadius: 2,
                                border: 'none',
                                cursor: 'pointer',
                                letterSpacing: '-0.01em',
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            Get Free Audit
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="mt-6 flex items-center justify-center gap-4 text-white/40" style={{ fontFamily: "'DM Mono', monospace" }}>
                            <span className="w-8 h-[1px] bg-current" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Built For High Performance</span>
                            <span className="w-8 h-[1px] bg-current" />
                        </div>
                    </motion.div>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default UseCasesSection;
