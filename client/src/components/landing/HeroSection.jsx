import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, Play, Mic, MessageSquare, Edit3, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSection = ({ onOpenBooking }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 'voice-agent',
            title1: "Turn Missed Opportunities Into",
            title2: "Closed Deals",
            gradient: "from-violet-400 via-indigo-400 to-purple-400",
            bgGlow: "bg-violet-600/20",
            icon: <Mic size={32} className="text-violet-400" />,
            description: "Deploy a 24/7 AI Voice Bot that talks to your leads, answers questions, and books appointments automatically over the phone.",
            features: ["Inbound & Outbound Calling", "Natural Human Voices", "Appointment Scheduling"]
        },
        {
            id: 'chat-agent',
            title1: "Engage Website Visitors with",
            title2: "Smart Chatbots",
            gradient: "from-blue-400 via-cyan-400 to-teal-400",
            bgGlow: "bg-cyan-600/20",
            icon: <MessageSquare size={32} className="text-cyan-400" />,
            description: "Capture leads instantly and provide instant customer support with an AI agent trained specifically on your company's proprietary data.",
            features: ["24/7 Instant Responses", "Fulfills Support Tickets", "Multi-lingual Support"]
        },
        {
            id: 'blog-agent',
            title1: "Automate Your SEO with the",
            title2: "Blog AI Agent",
            gradient: "from-amber-400 via-orange-400 to-rose-400",
            bgGlow: "bg-orange-600/20",
            icon: <Edit3 size={32} className="text-orange-400" />,
            description: "Stop writing manually. Our autonomous agent takes your keywords and turns them into fully-formatted, SEO-optimized blog posts.",
            features: ["Keyword Research", "Auto-Publishing", "High-Ranking Content"]
        },
        {
            id: 'social-agent',
            title1: "Dominate Every Feed with the",
            title2: "Social Media Agent",
            gradient: "from-pink-400 via-rose-400 to-red-400",
            bgGlow: "bg-pink-600/20",
            icon: <Share2 size={32} className="text-pink-400" />,
            description: "Maintain a non-stop social presence. From crafting viral tweets to scheduling daily LinkedIn carousel posts, completely hands-free.",
            features: ["Cross-Platform Posting", "Visual Content Gen", "Engagement Tracking"]
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <header className="relative min-h-[90vh] flex items-center pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden perspective-1000">
            {/* Dynamic Background Glow based on active slide */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${slides[currentSlide].bgGlow} rounded-full blur-[150px] pointer-events-none transition-colors duration-1000`} />

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center flex flex-col items-center">

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center max-w-4xl"
                    >
                        {/* Agent Icon Badge */}
                        <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl inline-block">
                            {slides[currentSlide].icon}
                        </div>

                        {/* Main Heading (SEO Valid H1) */}
                        <h1 className="sr-only">
                            Bitlance Automation | AI Voice Bots & Business Automation Services
                        </h1>

                        {/* Visual Rotating Heading */}
                        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-white">
                            {slides[currentSlide].title1} <br className="hidden md:block" />
                            <span className={`bg-clip-text text-transparent bg-gradient-to-r ${slides[currentSlide].gradient} relative inline-block`}>
                                {slides[currentSlide].title2}
                            </span>
                        </h2>

                        {/* Subheading */}
                        <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed h-[80px] sm:h-[60px] flex items-center justify-center">
                            {slides[currentSlide].description}
                        </p>

                        {/* Features List */}
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                            {slides[currentSlide].features.map((feat, idx) => (
                                <span key={idx} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80">
                                    ✓ {feat}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Buttons (Static below slider) */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 items-center w-full z-20">
                    <button
                        onClick={onOpenBooking}
                        className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 overflow-hidden transition-all hover:scale-105 w-full sm:w-auto"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Book a Live Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>

                    <button className="px-8 py-4 rounded-full bg-white/10 text-white backdrop-blur-md font-semibold border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                        <Play size={16} className="fill-current" /> Watch Overview
                    </button>
                </div>

                <div className="mt-8 text-sm text-gray-500 hidden lg:block">
                    No credit card required · Go live in 48 hours
                </div>

                {/* Slider Pagination Dots */}
                <div className="mt-16 flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`transition-all duration-300 rounded-full ${currentSlide === index
                                ? 'w-10 h-2 bg-indigo-500'
                                : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </header>
    );
};

export default HeroSection;
