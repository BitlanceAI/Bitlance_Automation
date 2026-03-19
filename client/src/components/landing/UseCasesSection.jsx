import { Layout, Users, Zap, PenTool, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';

const UseCasesSection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6 text-white"
                    >
                        Built for businesses that run on conversations
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/60"
                    >
                        Perfect if you get enquiries daily and can’t afford to miss them.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Real Estate & Property", desc: "Capture every site visit enquiry, instantly send project details, and auto‑schedule site visits.", icon: Layout, color: "indigo" },
                        { title: "Clinics & Local Services", desc: "Answer pricing and service questions, share offers, and confirm bookings without a receptionist.", icon: Users, color: "blue" },
                        { title: "Agencies & SaaS", desc: "Pre-qualify leads from ads, demos, and websites, then send only sales‑ready prospects to your team.", icon: Zap, color: "violet" },
                        { title: "Education & Coaching", desc: "Handle admissions queries, share brochures, and book counselling or discovery calls on autopilot.", icon: PenTool, color: "rose" }
                    ].map((card, idx) => (
                        <TiltCard key={idx} className="h-full">
                            <div className="bg-white/5 p-8 rounded-2xl shadow-sm border border-white/10 hover:bg-white/10 transition-all h-full transform-style-3d group backdrop-blur-sm">
                                <div className={`p-3 bg-${card.color}-500/10 text-${card.color}-400 rounded-lg w-fit mb-6 transform translate-z-10 group-hover:scale-110 transition-transform ring-1 ring-${card.color}-500/20`}>
                                    <card.icon size={24} />
                                </div>
                                <h3 className="text-lg font-bold mb-3 transform translate-z-5 text-white">{card.title}</h3>
                                <p className="text-white/60 text-sm leading-relaxed transform translate-z-5">
                                    {card.desc}
                                </p>
                            </div>
                        </TiltCard>
                    ))}
                </div>

                {/* Shimmer Glass CTA */}
                <div className="mt-20 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="inline-block"
                    >
                        <Link
                            to="/apply/audit"
                            className="audit-cta group relative inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95"
                        >
                            {/* Animated Gradient Border Overlay */}
                            <div className="absolute inset-0 p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity -z-10 animate-gradient-x" />

                            {/* Shimmer Sweep Effect */}
                            <motion.div
                                animate={{
                                    x: ['-200%', '200%'],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                    repeatDelay: 1,
                                }}
                                className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] pointer-events-none"
                            />

                            <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
                            <span>Claim My Free AI Audit</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-50 group-hover:opacity-100" />

                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </Link>

                        <div className="mt-6 flex items-center justify-center gap-4 text-white/20">
                            <span className="w-8 h-[1px] bg-current" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Built For High Performance</span>
                            <span className="w-8 h-[1px] bg-current" />
                        </div>
                    </motion.div>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default UseCasesSection;
