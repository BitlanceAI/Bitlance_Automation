import React from 'react';
import { Database, Clock, Zap, BarChart3, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';

const ProblemSection = () => {
    const problems = [
        {
            icon: <Database className="text-rose-400" size={24} />,
            color: "rose",
            manualTitle: "Manual Work",
            manualDesc: "Leads tracked across spreadsheets, WhatsApp, and scattered tools.",
            autoTitle: "Automated System",
            autoDesc: "AI instantly captures and syncs every lead straight into your CRM."
        },
        {
            icon: <Clock className="text-amber-400" size={24} />,
            color: "amber",
            manualTitle: "Slow Responses",
            manualDesc: "Leads often wait hours before receiving a response, killing interest.",
            autoTitle: "Instant Speed",
            autoDesc: "Our system engages and qualifies new leads within 0.4s, 24/7."
        },
        {
            icon: <Zap className="text-blue-400" size={24} />,
            color: "blue",
            manualTitle: "Lost Opportunities",
            manualDesc: "Hot leads go cold without consistent, immediate follow-ups.",
            autoTitle: "Won Deals",
            autoDesc: "Relentless, automated follow-up sequences until they book."
        },
        {
            icon: <BarChart3 className="text-indigo-400" size={24} />,
            color: "indigo",
            manualTitle: "No Visibility",
            manualDesc: "Lack of a centralized place to track conversations and lead status.",
            autoTitle: "Full Visibility",
            autoDesc: "A centralized, real-time dashboard of every AI conversation."
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
                        From Manual Grind <br />
                        <span className="text-indigo-500">To Autonomous Systems</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/40 max-w-2xl mx-auto font-medium"
                    >
                        Traditional lead management is broken. Discover how we replace your manual bottlenecks with seamless, automated workflows.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {problems.map((problem, idx) => (
                        <TiltCard key={idx} className="h-full">
                            <div className="bg-white/[0.02] border border-white/10 p-6 md:p-8 rounded-[2rem] h-full flex flex-col hover:bg-white/[0.04] transition-all duration-500 group">
                                <div className="flex-1">
                                    {/* Manual State */}
                                    <div className="mb-4">
                                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 line-through decoration-rose-500/50">
                                            {problem.manualTitle}
                                        </h4>
                                        <p className="text-sm text-white/40 line-through decoration-rose-500/50 font-medium">
                                            {problem.manualDesc}
                                        </p>
                                    </div>

                                    {/* Separator / Arrow */}
                                    <div className="flex items-center gap-4 my-6 opacity-50">
                                        <div className="h-px bg-white/10 flex-1"></div>
                                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                                            <ArrowDown className="text-indigo-400" size={14} />
                                        </div>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>

                                    {/* Automated State */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-8 h-8 rounded-lg bg-${problem.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                {React.cloneElement(problem.icon, { size: 16 })}
                                            </div>
                                            <h4 className={`text-xs font-bold text-${problem.color}-400 uppercase tracking-wider`}>
                                                {problem.autoTitle}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-white/90 font-medium leading-relaxed">
                                            {problem.autoDesc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </ScrollReveal>
        </section>
    );
};

export default ProblemSection;
