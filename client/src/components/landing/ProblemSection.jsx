import React from 'react';
import { Phone, MessageSquare, Share2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';

const ProblemSection = () => {
    return (
        <section className="py-20 relative overflow-hidden">
            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-6 text-white"
                    >
                        Your team is busy. Your leads won’t wait.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/60 max-w-3xl mx-auto leading-relaxed"
                    >
                        Every missed call, late reply, or slow follow‑up costs you leads, revenue, and reputation. Your prospects expect instant, clear answers on every channel.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Phone, text: "Leads drop when no one answers outside office hours.", color: "rose" },
                        { icon: MessageSquare, text: "Sales reps waste time on repetitive FAQs instead of hot leads.", color: "blue" },
                        { icon: Share2, text: "Managing WhatsApp, calls, website chat, and socials feels chaotic.", color: "violet" },
                        { icon: Users, text: "Hiring, training, and monitoring staff for basic queries is expensive.", color: "emerald" }
                    ].map((item, idx) => (
                        <TiltCard key={idx} className="h-full">
                            <div className="bg-white/5 p-6 rounded-xl shadow-sm border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-all h-full transform-style-3d backdrop-blur-sm">
                                <div className={`p-4 bg-${item.color}-500/20 text-${item.color}-400 rounded-full mb-6 transform translate-z-10 shadow-sm ring-1 ring-${item.color}-500/30`}>
                                    <item.icon size={28} />
                                </div>
                                <p className="font-medium text-gray-200 transform translate-z-5">{item.text}</p>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </ScrollReveal>
        </section>
    );
};

export default ProblemSection;
