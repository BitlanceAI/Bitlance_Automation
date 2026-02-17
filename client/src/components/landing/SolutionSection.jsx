import React from 'react';
import { MessageCircle, Check, Calendar, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

const SolutionSection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm">Consideration</span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mt-2 mb-6 text-white"
                    >
                        What would happen to your revenue if every lead got a response in under 5 minutes, automatically?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-xl text-white/60 max-w-3xl mx-auto"
                    >
                        Are your best salespeople spending time chasing unqualified leads instead of talking to ready-to-buy prospects?
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {[
                        {
                            title: "Manual Work",
                            desc: "How much time does your team waste every week updating sheets, reports, and follow-up lists manually?",
                            icon: MessageCircle,
                            color: "indigo"
                        },
                        {
                            title: "Visibility",
                            desc: "Do you have one place where you can see every lead, every conversation, and every follow-up status in real time?",
                            icon: Check,
                            color: "emerald"
                        },
                        {
                            title: "Lost Opportunities",
                            desc: "How many ‘hot’ leads go cold because nobody sent a reminder message or follow-up sequence?",
                            icon: Calendar,
                            color: "violet"
                        },
                        {
                            title: "Data-Driven Decisions",
                            desc: "If you could see which campaigns and ads actually bring leads that convert, what decisions would you change this month?",
                            icon: Globe,
                            color: "blue"
                        }
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="flex gap-6 group"
                        >
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-${feature.color}-500/10 text-${feature.color}-400 group-hover:scale-110 transition-transform ring-1 ring-${feature.color}-500/20`}>
                                <feature.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-indigo-400 transition-colors">{feature.title}</h3>
                                <p className="text-white/60 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </ScrollReveal>
        </section>
    );
};

export default SolutionSection;
