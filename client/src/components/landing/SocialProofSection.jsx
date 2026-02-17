import React from 'react';
import { Globe, Zap, Shield, BarChart3, Bot, CheckCircle, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import NumberTicker from '../ui/NumberTicker';
import ScrollReveal from '../ui/ScrollReveal';

const SocialProofSection = () => {
    return (
        <section className="py-20 bg-indigo-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-6"
                    >
                        Teams are closing more deals with less effort
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center font-semibold text-lg hover:bg-white/20 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                        <div className="text-4xl md:text-5xl font-bold text-indigo-300 flex items-center">
                            +<NumberTicker value={40} />%
                        </div>
                        <p className="text-gray-200">more enquiries handled without adding staff.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center font-semibold text-lg hover:bg-white/20 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                        <div className="text-4xl md:text-5xl font-bold text-indigo-300 flex items-center">
                            <NumberTicker value={2} />×
                        </div>
                        <p className="text-gray-200">increase in booked appointments from same ad spend.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-center font-semibold text-lg hover:bg-white/20 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                        <div className="text-4xl md:text-5xl font-bold text-indigo-300 flex items-center">
                            &lt; <NumberTicker value={10} start={60} direction="down" />s
                        </div>
                        <p className="text-gray-200">response time.</p>
                    </motion.div>
                </div>

                <div className="text-center opacity-60 text-sm uppercase tracking-widest mb-8">Trusted by teams in real estate, healthcare, education, and local services</div>

                {/* Marquee Effect */}
                <div className="relative flex overflow-hidden mask-linear-gradient">
                    <motion.div
                        className="flex gap-16 items-center whitespace-nowrap opacity-50 grayscale"
                        animate={{ x: [0, -1000] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 25
                        }}
                    >
                        {[...Array(2)].map((_, i) => (
                            <React.Fragment key={i}>
                                <div className="flex items-center gap-2 font-bold text-xl"><Globe className="w-8 h-8" /> GlobalRealty</div>
                                <div className="flex items-center gap-2 font-bold text-xl"><Zap className="w-8 h-8" /> MedCare</div>
                                <div className="flex items-center gap-2 font-bold text-xl"><Shield className="w-8 h-8" /> EduTech</div>
                                <div className="flex items-center gap-2 font-bold text-xl"><BarChart3 className="w-8 h-8" /> ServicePro</div>
                                <div className="flex items-center gap-2 font-bold text-xl"><Bot className="w-8 h-8" /> AutoBot</div>
                                <div className="flex items-center gap-2 font-bold text-xl"><CheckCircle className="w-8 h-8" /> LeadGenius</div>
                                <div className="flex items-center gap-2 font-bold text-xl"><Award className="w-8 h-8" /> TopTier</div>
                                <div className="flex items-center gap-2 font-bold text-xl"><TrendingUp className="w-8 h-8" /> GrowthX</div>
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default SocialProofSection;
