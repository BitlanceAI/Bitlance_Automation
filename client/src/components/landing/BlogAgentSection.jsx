import React from 'react';
import { Database, FileText, Wand2, Globe, ArrowRight, Rss, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import { useNavigate } from 'react-router-dom';

const TEAL = '#26CECE';

const BlogAgentSection = ({ onOpenBooking }) => {
    const navigate = useNavigate();

    const workflowSteps = [
        {
            icon: <Database className="w-8 h-8" style={{ color: TEAL }} />,
            title: "Data Ingestion",
            desc: "Provide your niche or keyword list via Excel.",
            delay: 0.2
        },
        {
            icon: <FileText className="w-8 h-8" style={{ color: TEAL }} />,
            title: "Outline & Research",
            desc: "AI extracts trends and builds a structured outline.",
            delay: 0.4
        },
        {
            icon: <Wand2 className="w-8 h-8" style={{ color: TEAL }} />,
            title: "Content Generation",
            desc: "Crafts SEO-optimized content with engaging titles.",
            delay: 0.6
        },
        {
            icon: <Globe className="w-8 h-8" style={{ color: TEAL }} />,
            title: "Auto-Publish",
            desc: "Posts directly to your blog with images and tags.",
            delay: 0.8
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-[#070707]" style={{ borderTop: '1px solid #1E1E1E' }}>
            {/* Background glowing effects */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-1000 opacity-60"
                style={{ background: `${TEAL}0A` }}
            />

            <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header Subtext */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 mb-6"
                        style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 11,
                            letterSpacing: '0.14em',
                            color: TEAL,
                            textTransform: 'uppercase',
                        }}
                    >
                        <Rss size={14} /> CONTENT AUTOMATION ENGINE
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-[1.08] text-white"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
                    >
                        Automate Your SEO with the<br />
                        <span style={{ color: TEAL }}>
                            Blog AI Agent
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-base md:text-lg text-white/60 mx-auto max-w-xl leading-relaxed"
                    >
                        Stop writing manually. Our autonomous agent takes your keywords and turns them into
                        fully-formatted, SEO-optimized blog posts published straight to your website.
                    </motion.p>
                </div>

                {/* Animated Workflow Brutalist */}
                <div className="mt-20 relative max-w-6xl mx-auto pb-12">

                    {/* Connecting line (Desktop only) */}
                    <div className="hidden md:block absolute top-[50px] left-[10%] right-[10%] h-[1px] border-t border-[#1E1E1E] z-0">
                        {/* Animated gradient bar moving across the line */}
                        <motion.div
                            className="absolute inset-0 h-[1px] w-1/3 -top-[1px]"
                            style={{ background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)` }}
                            animate={{ left: ['-33%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative z-10">
                        {workflowSteps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center relative text-center group">

                                {/* Mobile connector arrow */}
                                {index < workflowSteps.length - 1 && (
                                    <div className="md:hidden my-4 transform translate-y-2" style={{ color: '#1E1E1E' }}>
                                        <ArrowDown size={24} />
                                    </div>
                                )}

                                {/* Icon Square */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: step.delay }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    className="relative w-24 h-24 md:w-28 md:h-28 mb-8 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2"
                                    style={{
                                        background: '#111',
                                        border: '1px solid #1E1E1E',
                                        borderRadius: 2,
                                        boxShadow: `0 8px 30px -10px ${TEAL}15`
                                    }}
                                >
                                    {step.icon}

                                    {/* Number Badge Brutalist */}
                                    <div className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center text-sm font-bold"
                                        style={{
                                            background: TEAL,
                                            color: '#070707',
                                            border: 'none',
                                            borderRadius: 2,
                                            fontFamily: "'DM Mono', monospace"
                                        }}>
                                        0{index + 1}
                                    </div>
                                </motion.div>

                                {/* Text Content */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: step.delay + 0.2 }}
                                    viewport={{ once: true }}
                                >
                                    <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{step.title}</h3>
                                    <p className="text-sm text-white/50 leading-relaxed px-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                                        {step.desc}
                                    </p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-16 flex justify-center"
                >
                    <button
                        onClick={() => navigate('/features/blog-agent')}
                        whileHover={{ backgroundColor: '#35DFDF' }}
                        whileTap={{ scale: 0.97 }}
                        className="group inline-flex items-center gap-3 font-bold text-base transition-all mx-auto"
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
                        See the Blog Agent in Action <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>

            </ScrollReveal>
        </section>
    );
};

export default BlogAgentSection;
