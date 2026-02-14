import React, { useRef } from 'react';
import { ArrowRight, Play, Bot, MessageSquare, Zap, Shield } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import NumberTicker from '../ui/NumberTicker';

const HeroSection = ({ onOpenBooking }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <header ref={ref} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden perspective-1000">
            {/* Dynamic Background */}
            <motion.div
                style={{ y: backgroundY }}
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 -z-20"
            />

            {/* Animated Blobs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[100px] -z-10"
            />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    x: [0, 100, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[100px] -z-10"
            />

            <div className="max-w-7xl mx-auto px-6 text-center relative z-10">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-100 dark:border-slate-700 shadow-lg mb-8"
                >
                    <span className="flex h-2 w-2 relative mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-bold text-sm">
                        AI Agents v2.0 Live
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.div style={{ y: textY }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-gray-900 dark:text-white"
                    >
                        Turn Missed Opportunities Into <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 relative">
                            Closed Deals
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-400/30 dark:text-indigo-600/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        Deploy a 24/7 smart assistant that talks to your leads, answers questions, and books appointments automatically—without hiring extra staff.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row justify-center gap-4 items-center mb-20"
                    >
                        <button
                            onClick={onOpenBooking}
                            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 overflow-hidden transition-all hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Book a Live Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>

                        <button className="px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                            <Play size={16} className="fill-current" /> Watch 2‑Minute Overview
                        </button>
                    </motion.div>
                </motion.div>

                {/* 3D Floating Elements Visualization */}
                <div className="relative h-64 md:h-96 w-full max-w-4xl mx-auto perspective-1000">
                    <motion.div
                        initial={{ opacity: 0, rotateX: 20, scale: 0.8 }}
                        animate={{ opacity: 1, rotateX: 10, scale: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="relative w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 rounded-t-2xl shadow-2xl border border-gray-700 border-b-0 overflow-hidden transform-style-3d shadow-indigo-500/20"
                    >
                        {/* Mock Chat Interface */}
                        <div className="absolute top-0 left-0 w-full h-8 bg-gray-800 flex items-center px-4 gap-2 border-b border-gray-700">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="p-8 space-y-4 mt-8">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white"><Bot size={20} /></div>
                                <div className="bg-gray-700 text-gray-200 p-4 rounded-2xl rounded-tl-none max-w-md shadow-lg">
                                    <p>Hello! I noticed you're looking to scale your sales team. How can I help you automate your lead qualification today?</p>
                                </div>
                            </div>
                            <div className="flex gap-4 flex-row-reverse">
                                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">You</div>
                                <div className="bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none max-w-md shadow-lg">
                                    <p>I have too many leads and can't answer them all in time. Can you handle WhatsApp enquiries?</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white"><Bot size={20} /></div>
                                <div className="bg-gray-700 text-gray-200 p-4 rounded-2xl rounded-tl-none max-w-md shadow-lg">
                                    <p>Absolutely! I can connect to your WhatsApp Business API, qualify leads 24/7, and book meetings directly to your calendar.</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-8 top-20 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600 flex items-center gap-3"
                        >
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600"><Zap size={20} /></div>
                            <div>
                                <div className="text-xs text-gray-500">Response Time</div>
                                <div className="font-bold text-gray-900 dark:text-white">Under <NumberTicker value={2} />s</div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -left-8 top-40 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600 flex items-center gap-3"
                        >
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Shield size={20} /></div>
                            <div>
                                <div className="text-xs text-gray-500">Security</div>
                                <div className="font-bold text-gray-900 dark:text-white">Enterprise Ready</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
                    No credit card required · Go live in 48 hours
                </div>
            </div>
        </header>
    );
};

export default HeroSection;
