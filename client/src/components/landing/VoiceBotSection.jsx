import React from 'react';
import { Phone, Star, Clock, Maximize, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TiltCard from '../ui/TiltCard';
import ScrollReveal from '../ui/ScrollReveal';
import { useNavigate } from 'react-router-dom';

const TEAL = '#26CECE';

const VoiceBotSection = ({ onOpenBooking }) => {
    const navigate = useNavigate();
    return (
        <section className="py-12 relative overflow-hidden bg-[#070707]">
            {/* Background glowing effects */}
            <div 
                className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-1000"
                style={{ background: `${TEAL}0D` }}
            />

            <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Content & Features */}
                    <div className="flex flex-col items-start text-left">
                        {/* Agent badge */}
                        <div className="inline-flex items-center gap-2 mb-6" style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 11,
                            letterSpacing: '0.14em',
                            color: TEAL,
                            textTransform: 'uppercase',
                        }}>
                            <Phone size={14} /> VOICE AGENTS
                        </div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-[1.08] text-white"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
                        >
                            Empower Your Business with<br />
                            <span style={{ color: TEAL }}>
                                Bitlance AI Voice Agents
                            </span>
                        </motion.h2>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="text-base md:text-lg text-white/60 mb-8 max-w-xl leading-relaxed"
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
                            whileHover={{ backgroundColor: '#35DFDF' }}
                            whileTap={{ scale: 0.97 }}
                            className="group inline-flex items-center gap-3 font-bold text-base transition-all mb-12"
                            style={{
                                background: TEAL,
                                color: '#070707',
                                padding: '16px 32px',
                                borderRadius: 2,
                                border: 'none',
                                cursor: 'pointer',
                                letterSpacing: '-0.01em',
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>

                        {/* Brutalist Features List */}
                        <div className="grid sm:grid-cols-2 gap-4 w-full">
                            {[
                                { icon: Star, title: "Pure Precision", desc: "99.8% accuracy in every call." },
                                { icon: Clock, title: "Always Active", desc: "24/7 support without overhead." },
                                { icon: Maximize, title: "Rapid Scale", desc: "10,000+ simultaneous calls." },
                                { icon: Target, title: "Smart Logic", desc: "Niche-specific custom training." }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 flex items-start gap-4 transition-all group relative overflow-hidden"
                                    style={{
                                        background: '#111',
                                        border: '1px solid #1E1E1E',
                                        borderRadius: 2,
                                    }}
                                >
                                    <div className="w-8 h-8 shrink-0 flex items-center justify-center" style={{ border: `1px solid ${TEAL}40`, background: `${TEAL}10`, borderRadius: 2 }}>
                                        <feature.icon size={16} style={{ color: TEAL }} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{feature.title}</h4>
                                        <p className="text-white/50 text-xs leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: AI Video Agent */}
                    <div className="relative w-full flex items-center justify-center lg:justify-end group lg:h-[600px]">
                        {/* Teal ambient glow beneath */}
                        <div className="absolute -inset-4 rounded-xl blur-2xl -z-10 transition-opacity duration-500 opacity-60"
                            style={{ background: `${TEAL}12` }} />

                        {/* Main Display Container */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            className="relative z-10 w-full max-w-2xl"
                        >
                            <div className="aspect-video w-full overflow-hidden border relative shadow-2xl"
                                style={{ background: '#111', borderColor: '#1E1E1E', borderRadius: 2, boxShadow: `0 32px 80px -20px ${TEAL}18` }}>
                                {/* Camera dot */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#2A2A2A] rounded border border-[#333] z-20 flex items-center justify-center">
                                    <div className="w-0.5 h-0.5 bg-white rounded-full bg-opacity-50" />
                                </div>

                                <video
                                    src="/ai_voice_agent.mp4"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                />

                                {/* Screen Glare */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
                            </div>

                            {/* Floating Analytics Card Brutalist */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -bottom-6 -left-6 md:-left-12 p-5 z-20 hidden sm:block shadow-2xl"
                                style={{
                                    background: '#070707',
                                    border: `1px solid ${TEAL}`,
                                    borderRadius: 2,
                                    borderLeftWidth: 4,
                                }}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2" style={{ background: TEAL, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.14em', color: TEAL, textTransform: 'uppercase' }}>
                                            Neural Engine Active
                                        </span>
                                    </div>
                                    <div className="flex gap-8">
                                        <div>
                                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Response Time</p>
                                            <p className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>0.4s</p>
                                        </div>
                                        <div>
                                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Accuracy</p>
                                            <p className="text-xl font-bold" style={{ color: TEAL, fontFamily: "'Space Grotesk', sans-serif" }}>99.8%</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                </div>
            </ScrollReveal>
        </section>
    );
};

export default VoiceBotSection;
