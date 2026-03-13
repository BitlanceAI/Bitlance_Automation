import React from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2 } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const WhyBitlanceSection = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-[#030303]">
            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border border-white/5 bg-white/[0.01] rounded-[3rem] p-8 lg:p-16">
                    
                    {/* Left: Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-6 leading-tight">
                                Why Bitlance Technology?
                            </h2>
                            <p className="text-lg text-white/50 font-medium leading-relaxed max-w-lg">
                                We don't just provide tools. We build autonomous systems that handle the heavy lifting of lead engagement and sales follow-up, so you can focus on closing deals.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                "Native AI Voice Integration",
                                "Custom Trained for Your Data",
                                "Seamless CRM Automation",
                                "Zero Management Overhead"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                        <CheckCircle2 size={12} className="text-indigo-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-white/80">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <button className="px-8 py-4 rounded-full bg-white text-black font-bold text-sm tracking-tight hover:bg-white/90 transition-all">
                                Learn More About Us
                            </button>
                        </div>
                    </div>

                    {/* Right: Video Player Placeholder */}
                    <div className="relative group cursor-pointer">
                        <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 relative">
                            {/* Placeholder Aesthetic */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-rose-500/20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div 
                                    whileHover={{ scale: 1.1 }}
                                    className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl shadow-indigo-500/20"
                                >
                                    <Play size={24} className="text-black ml-1 fill-black" />
                                </motion.div>
                            </div>

                            {/* Info Overlay */}
                            <div className="absolute bottom-6 left-6 text-left">
                                <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-1">Founder Intro</p>
                                <p className="text-sm font-bold text-white">Watch how we automate sales</p>
                            </div>
                        </div>

                        {/* Ambient Glow */}
                        <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-full -z-10 group-hover:bg-indigo-500/20 transition-all duration-500" />
                    </div>

                </div>
            </ScrollReveal>
        </section>
    );
};

export default WhyBitlanceSection;
