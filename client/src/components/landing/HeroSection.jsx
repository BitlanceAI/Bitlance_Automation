import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, Mic, MessageSquare, Edit3, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSection = ({ onOpenBooking }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const videoRef = useRef(null);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);

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
            description: "Maintain a non-stop social presence. From crafting viral tweets to scheduling daily LinkedIn carousel posts, completely hands-free."
        }
    ];

    // Rotate slides every 8 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Autoplay video when in viewport — pause when scrolled away
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (!isManuallyPaused) {
                        video.play().catch(err => console.log("Autoplay blocked:", err));
                    }
                } else {
                    video.pause();
                }
            },
            { threshold: 0.4 }
        );

        observer.observe(video);
        return () => { if (video) observer.unobserve(video); };
    }, [isManuallyPaused]);

    const handlePlay = () => setIsManuallyPaused(false);
    const handlePause = () => {
        if (videoRef.current) {
            const rect = videoRef.current.getBoundingClientRect();
            const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
            if (isInView) setIsManuallyPaused(true);
        }
    };

    return (
        <header className="relative min-h-screen flex items-center pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-visible perspective-1000">
            {/* Dynamic Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${slides[currentSlide].bgGlow} rounded-full blur-[150px] pointer-events-none transition-colors duration-1000`} />

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Left — Text + CTA */}
                <div className="flex flex-col items-start text-left">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="flex flex-col items-start w-full"
                        >
                            {/* SEO H1 */}
                            <h1 className="sr-only">
                                Bitlance Automation | AI Voice Bots &amp; Business Automation Services
                            </h1>

                            {/* Visual rotating heading */}
                            <h2 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-white">
                                {slides[currentSlide].title1} <br />
                                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${slides[currentSlide].gradient} relative inline-block`}>
                                    {slides[currentSlide].title2}
                                </span>
                            </h2>

                            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl leading-relaxed">
                                {slides[currentSlide].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto z-20">
                        <button
                            onClick={onOpenBooking}
                            className="audit-cta btn-primary group relative px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 w-full sm:w-auto"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Get Your Free AI Audit <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </div>

                {/* Right — Video (same style as WhyBitlance) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="relative w-full order-first lg:order-last group"
                >
                    {/* Ambient glow */}
                    <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-full -z-10 group-hover:bg-indigo-500/20 transition-all duration-500" />

                    <div className="aspect-video w-full rounded-xl sm:rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 relative shadow-2xl shadow-indigo-500/10">
                        <video
                            ref={videoRef}
                            src="/why_bitlance.mp4"
                            className="w-full h-full object-cover"
                            controls
                            loop
                            playsInline
                            onPlay={handlePlay}
                            onPause={handlePause}
                        />
                        {/* Bottom overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    </div>
                </motion.div>

            </div>
        </header>
    );
};

export default HeroSection;
