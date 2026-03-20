import React from 'react';
import { Phone, Star, Clock, Maximize, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';
import { useNavigate } from 'react-router-dom';

const VoiceBotSection = ({ onOpenBooking }) => {
    const navigate = useNavigate();
    return (
        <section className="py-24 relative overflow-hidden bg-[#030303]">
            {/* Background glowing effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

            <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Content & Features */}
                    <div className="space-y-12">
                        <div className="text-left">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="text-3xl md:text-5xl font-extrabold mb-6 text-white leading-[1.2]"
                            >
                                Empower Your Business with<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                                    Bitlance AI Voice Agents
                                </span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                viewport={{ once: true }}
                                className="text-xl text-white/60 mb-8 max-w-xl"
                            >
                                Scale your business with AI agents that handle leads and
                                bookings 24/7 with human-level accuracy.
                            </motion.p>
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                viewport={{ once: true }}
                                onClick={() => navigate('/features/voice-bot')}
                                className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all hover:scale-105"
                            >
                                Get Started <ArrowRight size={18} />
                            </motion.button>
                        </div>

                        {/* Compact Features List - Single column or tighter grid */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: Star, title: "Pure Precision", desc: "99.8% accuracy in every call.", color: "from-yellow-400 to-amber-500" },
                                { icon: Clock, title: "Always Active", desc: "24/7 support without overhead.", color: "from-red-400 to-rose-500" },
                                { icon: Maximize, title: "Rapid Scale", desc: "10,000+ simultaneous calls.", color: "from-blue-400 to-cyan-500" },
                                { icon: Target, title: "Smart Logic", desc: "Niche-specific custom training.", color: "from-emerald-400 to-teal-500" }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-all group flex items-start gap-4"
                                >
                                    <div className={`w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                                        <feature.icon size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-0.5">{feature.title}</h4>
                                        <p className="text-white/40 text-[11px] leading-tight">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: AI Video Agent */}
                    <div className="relative lg:h-[600px] flex items-center justify-center lg:justify-end">
                        <div className="relative group w-full max-w-2xl">
                            {/* Decorative Background Elements */}
                            <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-[120px] -z-10 group-hover:bg-indigo-500/20 transition-all duration-700" />

                            {/* Main Display Container (Desktop/Laptop Style) */}
                            <motion.div
                                initial={{ opacity: 0, x: 50, rotateY: -10 }}
                                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{ perspective: "1000px" }}
                                className="relative z-10"
                            >
                                {/* Screen Frame */}
                                <div className="relative aspect-video bg-[#0A0A0A] rounded-xl overflow-hidden border-[6px] border-[#1A1A1A] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_rgba(139,92,246,0.2)]">
                                    {/* Camera dot */}
                                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/10 z-20" />

                                    <video
                                        src="/ai_voice_agent.mp4"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        controls
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Screen Glare */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
                                </div>

                                {/* Stand / Base (Laptop look) */}
                                <div className="relative -mt-1 h-2 mx-auto w-[90%] bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] rounded-b-xl shadow-lg border-x border-b border-white/5" />
                                <div className="mt-0.5 mx-auto w-[25%] h-1 bg-[#222] rounded-full opacity-50" />
                            </motion.div>

                            {/* Floating Analytics Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -bottom-6 -left-6 md:-left-12 bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl z-20 hidden sm:block border-l-violet-500/50 border-l-[3px]"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Neural Engine Active</span>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-[9px] text-white/30 uppercase mb-0.5">Response Time</p>
                                            <p className="text-lg font-mono font-bold text-white">0.4s</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-white/30 uppercase mb-0.5">Accuracy</p>
                                            <p className="text-lg font-mono font-bold text-violet-400">99.8%</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>
            </ScrollReveal>
        </section>
    );
};

export default VoiceBotSection;
