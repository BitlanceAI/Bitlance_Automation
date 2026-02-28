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
                {/* Header Subtext */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-extrabold mb-4 text-white"
                    >
                        Unleash Game-Changing Results with<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                            Bitlance AI Voice Bot Technology
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/60 mb-8 max-w-2xl mx-auto"
                    >
                        Transform your business with Bitlance AI Voice Bot! Our cutting-edge
                        technology energizes interactions, slashes response times, and supercharges
                        your business efficiency.
                    </motion.p>
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        onClick={() => navigate('/features/voice-bot')}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:scale-105 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    >
                        Explore Features <ArrowRight size={18} />
                    </motion.button>
                </div>

                {/* Main Feature Layout */}
                <div className="relative mt-20 max-w-5xl mx-auto">

                    {/* Central Glowing Phone Icon - Hidden on small mobile, visible on md+ */}
                    <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-20">
                        <div className="relative flex items-center justify-center">
                            {/* Outer Rings */}
                            <div className="absolute w-48 h-48 border border-violet-500/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            <div className="absolute w-40 h-40 border border-violet-500/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
                            <div className="absolute w-32 h-32 border border-violet-500/60 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />

                            {/* Inner Circle */}
                            <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] z-10">
                                <Phone size={40} className="text-white fill-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 gap-x-32 gap-y-12 lg:gap-y-24">

                        {/* Box 1 */}
                        <TiltCard>
                            <div className="bg-white/[0.03] backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-all h-full transform-style-3d group relative overflow-hidden">
                                {/* Top right icon accent */}
                                <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-all">
                                    <Star size={24} className="text-white fill-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white transform translate-z-5 pr-8">Precision Redefined</h3>
                                <p className="text-white/60 text-sm leading-relaxed transform translate-z-5">
                                    Boost your business performance with cutting-edge AI voice bot technology, delivering accurate and contextually relevant interactions.
                                </p>
                            </div>
                        </TiltCard>

                        {/* Box 2 */}
                        <TiltCard>
                            <div className="bg-white/[0.03] backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-all h-full transform-style-3d group relative overflow-hidden">
                                <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-all">
                                    <Clock size={24} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white transform translate-z-5 pr-8">Round-the-Clock Support</h3>
                                <p className="text-white/60 text-sm leading-relaxed transform translate-z-5">
                                    24/7 support with swift resolution of all customer queries, maximizing satisfaction with our always-active voice bot solution.
                                </p>
                            </div>
                        </TiltCard>

                        {/* Box 3 */}
                        <TiltCard>
                            <div className="bg-white/[0.03] backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-all h-full transform-style-3d group relative overflow-hidden">
                                <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-all">
                                    <Maximize size={24} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white transform translate-z-5 pr-8">Seamless Scalability</h3>
                                <p className="text-white/60 text-sm leading-relaxed transform translate-z-5">
                                    Designed to grow with your business, our voice bot scales effortlessly from startups to global enterprises.
                                </p>
                            </div>
                        </TiltCard>

                        {/* Box 4 */}
                        <TiltCard>
                            <div className="bg-white/[0.03] backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:bg-white/[0.06] transition-all h-full transform-style-3d group relative overflow-hidden">
                                <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg rotate-12 group-hover:rotate-0 transition-all">
                                    <Target size={24} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white transform translate-z-5 pr-8">Industry-Specific Customization</h3>
                                <p className="text-white/60 text-sm leading-relaxed transform translate-z-5">
                                    Expertly tailored solutions ensuring each industry gets exactly what it needs for maximum effectiveness.
                                </p>
                            </div>
                        </TiltCard>

                    </div>
                </div>

            </ScrollReveal>
        </section>
    );
};

export default VoiceBotSection;
