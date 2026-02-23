import React, { useRef } from 'react';
import { ArrowRight, Play, Zap } from 'lucide-react'; // Removed unused icons
import { motion, useScroll, useTransform } from 'framer-motion';
// import NumberTicker from '../ui/NumberTicker'; // Assuming used elsewhere or removing if part of old viz
import Spline from '@splinetool/react-spline';

const HeroSection = ({ onOpenBooking }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);


    return (
        <header ref={ref} className="relative pt-24 pb-16 lg:pt-48 lg:pb-32 overflow-hidden perspective-1000">
            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center">

                    {/* Left Column: Text Content */}
                    <div className="text-center lg:text-left flex flex-col items-center">
                        {/* Badge */}
                        {/* <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg mb-8"
                        >
                            <span className="flex h-2 w-2 relative mr-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 font-bold text-sm">
                                AI Agents v2.0 Live
                            </span>
                        </motion.div> */}

                        {/* Main Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-white"
                        >
                            Turn Missed Opportunities Into <br className="hidden md:block" />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 relative inline-block">
                                Closed Deals
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-400/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span>
                        </motion.h1>

                        {/* Subheading */}
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-lg md:text-xl text-white/60 mb-8 lg:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Deploy a 24/7 smart assistant that talks to your leads, answers questions, and books appointments automatically.
                        </motion.p>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 items-center mb-12 lg:mb-0 w-full lg:w-auto"
                        >
                            <button
                                onClick={onOpenBooking}
                                className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 overflow-hidden transition-all hover:scale-105 w-full sm:w-auto"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Book a Live Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </button>

                            <button className="px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-semibold border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 w-full sm:w-auto">
                                <Play size={16} className="fill-current" /> Watch Overview
                            </button>
                        </motion.div>

                        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 hidden lg:block">
                            No credit card required · Go live in 48 hours
                        </div>
                    </div>

                    {/* Right Column: 3D Visualization */}
                    <div className="relative w-[50vw]  h-full min-h-[400px] md:min-h-[600px] lg:min-h-[700px] flex items-center justify-center mt-8 lg:mt-0">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full rounded-2xl overflow-hidden "
                        >
                            <Spline
                                scene="https://prod.spline.design/M6cpWkK3umnhRoUB/scene.splinecode"
                                className="w-full h-full !scale-125 md:!scale-113 origin-center"
                            />
                        </motion.div>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default HeroSection;
