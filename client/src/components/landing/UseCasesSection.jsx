import React from 'react';
import { Layout, Users, Zap, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';

const UseCasesSection = () => {
    return (
        <section className="py-24 bg-gray-50 dark:bg-slate-900 overflow-hidden">
            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6"
                    >
                        Built for businesses that run on conversations
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-gray-600 dark:text-gray-300"
                    >
                        Perfect if you get enquiries daily and can’t afford to miss them.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Real Estate & Property", desc: "Capture every site visit enquiry, instantly send project details, and auto‑schedule site visits.", icon: Layout, color: "indigo" },
                        { title: "Clinics & Local Services", desc: "Answer pricing and service questions, share offers, and confirm bookings without a receptionist.", icon: Users, color: "blue" },
                        { title: "Agencies & SaaS", desc: "Pre-qualify leads from ads, demos, and websites, then send only sales‑ready prospects to your team.", icon: Zap, color: "purple" },
                        { title: "Education & Coaching", desc: "Handle admissions queries, share brochures, and book counselling or discovery calls on autopilot.", icon: PenTool, color: "pink" }
                    ].map((card, idx) => (
                        <TiltCard key={idx} className="h-full">
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-2xl transition-all h-full transform-style-3d group">
                                <div className={`p-3 bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-600 dark:text-${card.color}-400 rounded-lg w-fit mb-6 transform translate-z-10 group-hover:scale-110 transition-transform`}>
                                    <card.icon size={24} />
                                </div>
                                <h3 className="text-lg font-bold mb-3 transform translate-z-5">{card.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transform translate-z-5">
                                    {card.desc}
                                </p>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </ScrollReveal>
        </section>
    );
};

export default UseCasesSection;
