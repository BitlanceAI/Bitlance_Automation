import React from 'react';
import { Database, Clock, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';

const ProblemSection = () => {
    const problems = [
        {
            title: "Manual Work",
            description: "Leads tracked across spreadsheets, WhatsApp, and scattered tools.",
            icon: <Database className="text-rose-400" size={24} />,
            color: "rose"
        },
        {
            title: "Slow Responses",
            description: "Leads often wait hours before receiving a response, killing interest.",
            icon: <Clock className="text-amber-400" size={24} />,
            color: "amber"
        },
        {
            title: "Lost Opportunities",
            description: "Hot leads go cold without consistent, immediate follow-ups.",
            icon: <Zap className="text-blue-400" size={24} />,
            color: "blue"
        },
        {
            title: "No Visibility",
            description: "Lack of a centralized place to track conversations and lead status.",
            icon: <BarChart3 className="text-indigo-400" size={24} />,
            color: "indigo"
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-[#030303]">
            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black mb-6 text-white uppercase tracking-tighter"
                    >
                        Most Businesses Lose Leads <br />
                        <span className="text-rose-500">Before They Even Respond</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/40 max-w-2xl mx-auto font-medium"
                    >
                        Traditional lead management is broken. Every minute you wait, your prospect is already talking to your competitor.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {problems.map((problem, idx) => (
                        <TiltCard key={idx} className="h-full">
                            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[2rem] h-full flex flex-col items-start hover:bg-white/[0.04] transition-all duration-500 group">
                                <div className={`w-12 h-12 rounded-2xl bg-${problem.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    {problem.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                                    {problem.title}
                                </h3>
                                <p className="text-sm text-white/40 leading-relaxed font-medium">
                                    {problem.description}
                                </p>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </ScrollReveal>
        </section>
    );
};

export default ProblemSection;
