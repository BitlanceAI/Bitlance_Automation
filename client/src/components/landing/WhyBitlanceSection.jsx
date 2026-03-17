import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ui/ScrollReveal';

const WhyBitlanceSection = () => {
    const videoRef = useRef(null);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);

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
            { threshold: 0.5 }
        );

        observer.observe(video);
        return () => {
            if (video) observer.unobserve(video);
        };
    }, [isManuallyPaused]);

    const handlePlay = () => {
        setIsManuallyPaused(false);
    };

    const handlePause = () => {
        // If the video is paused and it's not due to scrolling away 
        // We set manually paused to true if the pause event fires while the video is still in view
        if (videoRef.current) {
            // Check if element is still in viewport when pause is triggered
            const rect = videoRef.current.getBoundingClientRect();
            const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
            if (isInView) {
                setIsManuallyPaused(true);
            }
        }
    };
    return (
        <section className="py-24 relative overflow-hidden bg-[#030303]">
            <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center border border-white/5 bg-white/[0.01] rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 lg:p-16">

                    {/* Left: Content */}
                    <div className="space-y-8 order-2 lg:order-1">
                        <div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4 sm:mb-6 leading-tight">
                                Why Bitlance Technology?
                            </h2>
                            <p className="text-base sm:text-lg text-white/50 font-medium leading-relaxed max-w-lg">
                                We don't just provide tools. We build autonomous systems that handle the heavy lifting of lead engagement and sales follow-up, so you can focus on closing deals.
                            </p>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {[
                                "Native AI Voice Integration",
                                "Custom Trained for Your Data",
                                "Seamless CRM Automation",
                                "Zero Management Overhead"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                        <CheckCircle2 size={12} className="text-indigo-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-white/80">{item}</span>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Right: Video Player */}
                    <div className="relative group order-1 lg:order-2 w-full">
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
                            {/* Subtle Overlay to maintain text readability if needed, though here it's just a player */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* Ambient Glow */}
                        <div className="absolute -inset-4 bg-indigo-500/10 blur-2xl rounded-full -z-10 group-hover:bg-indigo-500/20 transition-all duration-500" />
                    </div>

                </div>

                {/* Centered Large CTA */}
                <div className="mt-20 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <Link
                            to="/apply/audit"
                            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-10 py-5 rounded-2xl text-white font-black uppercase tracking-widest text-base hover:bg-white/10 transition-all group relative overflow-hidden"
                        >
                            <Sparkles className="w-6 h-6 text-indigo-400 group-hover:rotate-12 transition-transform" />
                            Claim My Free AI Audit
                            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-white/30 text-xs mt-4 font-medium uppercase tracking-widest">Takes less than 2 minutes • No card required</p>
                    </motion.div>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default WhyBitlanceSection;
