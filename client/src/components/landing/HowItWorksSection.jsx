import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

// Reusable SVG animation per step
const StepAnimation = ({ step, colorClass }) => {
    // A helper to pick gradient stops based on Tailwind classes mapping
    const gradientStops = {
        'from-blue-500 to-cyan-500': ['#3b82f6', '#06b6d4'],
        'from-purple-500 to-indigo-500': ['#a855f7', '#6366f1'],
        'from-pink-500 to-rose-500': ['#ec4899', '#f43f5e']
    }[colorClass] || ['#6366f1', '#a855f7'];

    if (step === 1) {
        // Step 1: Strategy & Script (Nodes and Connecting Lines)
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={gradientStops[0]} />
                        <stop offset="100%" stopColor={gradientStops[1]} />
                    </linearGradient>
                </defs>
                <motion.circle
                    cx="30" cy="40" r="8"
                    fill="url(#grad1)"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                />
                <motion.circle
                    cx="70" cy="30" r="10"
                    fill="url(#grad1)"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                />
                <motion.circle
                    cx="50" cy="70" r="6"
                    fill="url(#grad1)"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                />
                <motion.line
                    x1="30" y1="40" x2="70" y2="30"
                    stroke="url(#grad1)" strokeWidth="2" strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, 20] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                />
                <motion.line
                    x1="70" y1="30" x2="50" y2="70"
                    stroke="url(#grad1)" strokeWidth="2" strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                />
                <motion.line
                    x1="50" y1="70" x2="30" y2="40"
                    stroke="url(#grad1)" strokeWidth="2" strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, 20] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                />
            </svg>
        );
    } else if (step === 2) {
        // Step 2: Setup & Integrations (Syncing & Interlocking Rings)
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
                <defs>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={gradientStops[0]} />
                        <stop offset="100%" stopColor={gradientStops[1]} />
                    </linearGradient>
                </defs>
                <motion.circle
                    cx="50" cy="50" r="20"
                    fill="none" stroke="url(#grad2)" strokeWidth="4"
                    strokeDasharray="30 10"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    style={{ originX: '50px', originY: '50px' }}
                />
                <motion.circle
                    cx="50" cy="50" r="30"
                    fill="none" stroke="url(#grad2)" strokeWidth="2" opacity="0.5"
                    strokeDasharray="20 20"
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                    style={{ originX: '50px', originY: '50px' }}
                />
                <motion.rect
                    x="45" y="45" width="10" height="10" rx="3"
                    fill="url(#grad2)"
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 45, 90] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    style={{ originX: '50px', originY: '50px' }}
                />
            </svg>
        );
    } else {
        // Step 3: Launch & Optimize (Radar / Performance Chart Waves)
        return (
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity overflow-visible">
                <defs>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={gradientStops[0]} />
                        <stop offset="100%" stopColor={gradientStops[1]} />
                    </linearGradient>
                </defs>
                <motion.path
                    d="M 10 70 Q 30 30 50 50 T 90 20"
                    fill="none" stroke="url(#grad3)" strokeWidth="4" strokeLinecap="round"
                    animate={{ pathLength: [0, 1], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                />
                <motion.circle
                    cx="90" cy="20" r="6"
                    fill="url(#grad3)"
                    animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1.5 }}
                />
                {/* Expanding ping rings */}
                <motion.circle
                    cx="50" cy="50" r="10"
                    fill="none" stroke="url(#grad3)" strokeWidth="1"
                    animate={{ scale: [1, 5], opacity: [0.8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                />
            </svg>
        );
    }
}

const ThreeDCard = ({ step, title, desc, color }) => {
    const ref = useRef(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e) => {
        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
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
            className="relative h-full min-h-[420px] w-full rounded-xl bg-white/5 border border-white/10 shadow-xl cursor-pointer backdrop-blur-sm group"
        >
            <div
                style={{
                    transform: "translateZ(75px)",
                    transformStyle: "preserve-3d",
                }}
                className="absolute inset-4 grid place-content-center rounded-xl bg-gradient-to-br from-white/10 to-transparent shadow-inner border border-white/5"
            >
                {/* 3D Content Layer */}
                <div className="text-center p-6 h-full flex flex-col items-center justify-between" style={{ transform: "translateZ(50px)" }}>
                    <div>
                        <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-tr ${color} flex items-center justify-center text-2xl font-bold text-white mb-6 shadow-lg shadow-indigo-500/20`}>
                            {step}
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
                        <p className="text-white/60 text-sm mb-6 max-w-[250px] mx-auto">
                            {desc}
                        </p>
                    </div>

                    {/* Dynamic Animation Layer */}
                    <div className="h-40 w-full mt-auto rounded-lg bg-[#0f111a] border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 shadow-inner">
                        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${color}`}></div>
                        <div className="w-24 h-24 relative z-10">
                            <StepAnimation step={step} colorClass={color} />
                        </div>
                    </div>


                </div>
            </div>
        </motion.div>
    );
};

const HowItWorksSection = () => {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm mb-2 block">Process</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white">
                        Go live in <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">3 simple steps</span>
                    </h2>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
                        We handle the complexity. You get a fully trained AI agent ready to close deals.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative z-10 max-w-6xl mx-auto">
                    {[
                        {
                            step: 1,
                            title: "Strategy & Script",
                            desc: "We analyze your business and map out conversational flows that convert.",
                            color: "from-blue-500 to-cyan-500",
                        },
                        {
                            step: 2,
                            title: "Setup & Integrations",
                            desc: "We connect the AI to your phone, website, CRM, and calendar instantly.",
                            color: "from-purple-500 to-indigo-500",
                        },
                        {
                            step: 3,
                            title: "Launch & Optimize",
                            desc: "Go live. We monitor performance and tweak the AI for maximum ROI.",
                            color: "from-pink-500 to-rose-500",
                        }
                    ].map((item, idx) => (
                        <ThreeDCard key={idx} {...item} />
                    ))}
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-1/2 left-0 w-full h-[500px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl -z-0 pointer-events-none transform -translate-y-1/2" />
            </ScrollReveal>
        </section>
    );
};

export default HowItWorksSection;
