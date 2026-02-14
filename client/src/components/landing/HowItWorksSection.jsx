import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

const ThreeDCard = ({ step, title, desc, color, image, index }) => {
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
            className="relative h-[400px] w-full rounded-xl bg-white dark:bg-slate-800 shadow-xl cursor-pointer"
        >
            <div
                style={{
                    transform: "translateZ(75px)",
                    transformStyle: "preserve-3d",
                }}
                className="absolute inset-4 grid place-content-center rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-slate-700 dark:to-slate-800 shadow-inner"
            >
                {/* 3D Content Layer */}
                <div className="text-center p-6" style={{ transform: "translateZ(50px)" }}>
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-tr ${color} flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-lg`}>
                        {step}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {desc}
                    </p>

                    {/* Dynamic Image Layer */}
                    <div className="h-48 w-full rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${color}`}></div>

                        <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    </div>

                    <div className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Hover to tilt
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const HowItWorksSection = () => {
    return (
        <section className="py-32 bg-gray-50 dark:bg-slate-900 overflow-hidden">
            <ScrollReveal className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-24">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-sm mb-2 block">Process</span>
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
                        Go live in <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">3 simple steps</span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        We handle the complexity. You get a fully trained AI agent ready to close deals.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative z-10">
                    {[
                        {
                            step: 1,
                            title: "Strategy & Script",
                            desc: "We analyze your business and map out conversational flows that convert.",
                            color: "from-blue-500 to-cyan-500",
                            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=60"
                        },
                        {
                            step: 2,
                            title: "Setup & Integrations",
                            desc: "We connect the AI to your phone, website, CRM, and calendar instantly.",
                            color: "from-purple-500 to-indigo-500",
                            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=60"
                        },
                        {
                            step: 3,
                            title: "Launch & Optimize",
                            desc: "Go live. We monitor performance and tweak the AI for maximum ROI.",
                            color: "from-pink-500 to-rose-500",
                            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=60"
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
