import React, { useRef } from 'react';
import { Globe, Zap, Shield, BarChart3, Bot, CheckCircle, Award, TrendingUp } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import NumberTicker from '../ui/NumberTicker';
import ScrollReveal from '../ui/ScrollReveal';

// Reusable SVG animation per stat
const StatAnimation = ({ type }) => {
    if (type === 'chart') {
        // +40% enquires: Rising bar chart
        return (
            <svg viewBox="0 0 100 100" className="absolute -bottom-4 right-0 w-32 h-32 opacity-10 pointer-events-none">
                <defs>
                    <linearGradient id="statGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
                        <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                </defs>
                <motion.rect x="20" y="60" width="10" height="20" fill="url(#statGrad1)" rx="2"
                    animate={{ height: [20, 25, 20], y: [60, 55, 60] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} />
                <motion.rect x="45" y="45" width="10" height="35" fill="url(#statGrad1)" rx="2"
                    animate={{ height: [35, 45, 35], y: [45, 35, 45] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.2 }} />
                <motion.rect x="70" y="20" width="10" height="60" fill="url(#statGrad1)" rx="2"
                    animate={{ height: [60, 75, 60], y: [20, 5, 20] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 0.4 }} />
            </svg>
        );
    } else if (type === 'multiplier') {
        // 2x increase: Interlocking expanding gears/circles
        return (
            <svg viewBox="0 0 100 100" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.07] pointer-events-none">
                <defs>
                    <linearGradient id="statGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
                <motion.circle cx="50" cy="50" r="30" fill="none" stroke="url(#statGrad2)" strokeWidth="4" strokeDasharray="20 10"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                    style={{ originX: '50px', originY: '50px' }} />
                <motion.circle cx="50" cy="50" r="40" fill="none" stroke="url(#statGrad2)" strokeWidth="2" strokeDasharray="15 15" opacity="0.6"
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                    style={{ originX: '50px', originY: '50px' }} />
            </svg>
        );
    } else {
        // < 10s: Stopwatch / Pulse rings
        return (
            <svg viewBox="0 0 100 100" className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                <defs>
                    <linearGradient id="statGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>
                <motion.circle cx="70" cy="30" r="20" fill="none" stroke="url(#statGrad3)" strokeWidth="3" />
                <motion.line x1="70" y1="30" x2="70" y2="18" stroke="url(#statGrad3)" strokeWidth="3" strokeLinecap="round"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ originX: '70px', originY: '30px' }} />
                {/* Pinging pulse */}
                <motion.circle cx="70" cy="30" r="20" fill="none" stroke="url(#statGrad3)" strokeWidth="2"
                    animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }} />
            </svg>
        );
    }
};

const StatCard = ({ delay, value, symbol, text, type, direction = "up", start = 0 }) => {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    const handleMouseMove = (e) => {
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            className="group relative bg-[#0f111a] backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl hover:border-indigo-500/50 transition-colors flex flex-col items-center justify-center gap-3 overflow-hidden"
        >
            <StatAnimation type={type} />

            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div style={{ transform: "translateZ(30px)" }} className="relative z-10 text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center mb-2 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                {symbol === '+' && <span>+</span>}
                {symbol === '<' && <span className="mr-2">&lt;</span>}
                <NumberTicker value={value} start={start} direction={direction} />
                {symbol !== '+' && symbol !== '<' && <span>{symbol}</span>}
            </div>
            <p style={{ transform: "translateZ(20px)" }} className="relative z-10 text-gray-300 text-center font-medium opacity-80 group-hover:opacity-100 transition-opacity max-w-[200px]">
                {text}
            </p>
        </motion.div>
    );
};

const SocialProofSection = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-[#05060f] to-[#0a0c16] text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

            {/* Ambient Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-extrabold mb-6"
                    >
                        Teams are closing <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">more deals</span> with less effort
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-24 max-w-6xl mx-auto perspective-1000">
                    <StatCard
                        delay={0}
                        value={40}
                        symbol="+"
                        text="more enquiries handled without adding staff."
                        type="chart"
                    />
                    <StatCard
                        delay={0.1}
                        value={2}
                        symbol="×"
                        text="increase in booked appointments from same ad spend."
                        type="multiplier"
                    />
                    <StatCard
                        delay={0.2}
                        value={10}
                        symbol="<"
                        text="response time."
                        start={60}
                        direction="down"
                        type="time"
                    />
                </div>

                <div className="text-center opacity-40 font-semibold text-xs uppercase tracking-[0.2em] mb-10">
                    Trusted by teams in real estate, healthcare, education, and local services
                </div>

                {/* Marquee Effect */}
                <div className="relative flex overflow-hidden mask-linear-gradient">
                    <motion.div
                        className="flex gap-20 items-center whitespace-nowrap opacity-40 hover:opacity-100 hover:grayscale-0 grayscale transition-all duration-500"
                        animate={{ x: [0, -1500] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 35
                        }}
                    >
                        {[...Array(2)].map((_, i) => (
                            <React.Fragment key={i}>
                                <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white/80"><Globe className="w-8 h-8 text-indigo-400" /> GlobalRealty</div>
                                <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white/80"><Zap className="w-8 h-8 text-yellow-400" /> MedCare</div>
                                <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white/80"><Shield className="w-8 h-8 text-blue-400" /> EduTech</div>
                                <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white/80"><BarChart3 className="w-8 h-8 text-green-400" /> ServicePro</div>
                                <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white/80"><Bot className="w-8 h-8 text-purple-400" /> AutoBot</div>
                                <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white/80"><CheckCircle className="w-8 h-8 text-emerald-400" /> LeadGenius</div>
                                <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white/80"><Award className="w-8 h-8 text-rose-400" /> TopTier</div>
                                <div className="flex items-center gap-3 font-extrabold text-2xl tracking-tight text-white/80"><TrendingUp className="w-8 h-8 text-orange-400" /> GrowthX</div>
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default SocialProofSection;
