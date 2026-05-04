import React from 'react';
import { Search, Tag, Wand2, ShieldCheck, Globe, ArrowRight, Rss, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import { useNavigate } from 'react-router-dom';

const TEAL = '#26CECE';

const BlogAgentSection = ({ onOpenBooking }) => {
    const navigate = useNavigate();

    const workflowSteps = [
        {
            icon: <Search className="w-8 h-8" style={{ color: TEAL }} />,
            title: "Trending Topics",
            badge: "SerpAPI",
            desc: "Searches Google in real-time to find trending topics and People Also Ask questions for your industry.",
            delay: 0.2
        },
        {
            icon: <Tag className="w-8 h-8" style={{ color: TEAL }} />,
            title: "Keyword Research",
            badge: "SerpAPI",
            desc: "Extracts related searches and PAA signals from Google to build a real, rankable keyword set.",
            delay: 0.35
        },
        {
            icon: <Wand2 className="w-8 h-8" style={{ color: TEAL }} />,
            title: "Content Generation",
            badge: "Perplexity AI",
            desc: "Injects SERP-sourced topic and keywords into a writing prompt to craft a fully SEO-optimized article.",
            delay: 0.5
        },
        {
            icon: <ShieldCheck className="w-8 h-8" style={{ color: TEAL }} />,
            title: "Plagiarism Check",
            badge: "SerpAPI",
            desc: "Runs exact-phrase Google searches on key sentences to verify the content is original before publishing.",
            delay: 0.65
        },
        {
            icon: <Globe className="w-8 h-8" style={{ color: TEAL }} />,
            title: "Auto-Publish",
            badge: "WordPress",
            desc: "Posts directly to your website with images, SEO title, and tags — fully hands-free.",
            delay: 0.8
        }
    ];

    return (
        <section className="py-12 relative overflow-hidden bg-transparent" style={{ borderTop: '1px solid #1E1E1E' }}>
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
                        className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tight mb-6 leading-[1.08] text-black"
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
                        className="text-base md:text-lg font-medium text-black mx-auto max-w-xl leading-relaxed"
                    >
                        Stop writing manually. Our autonomous agent takes your keywords and turns them into
                        fully-formatted, SEO-optimized blog posts published straight to your website.
                    </motion.p>
                </div>

                {/* Animated Workflow Brutalist */}
                <div className="mt-20 relative max-w-6xl mx-auto pb-12">

                    {/* Connecting line (Desktop only) */}
                    <div className="hidden md:block absolute top-[50px] left-[8%] right-[8%] h-[1px] border-t border-gray-200 z-0">
                        <motion.div
                            className="absolute inset-0 h-[1px] w-1/4 -top-[1px]"
                            style={{ background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)` }}
                            animate={{ left: ['-25%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    <div className="grid md:grid-cols-5 gap-6 relative z-10">
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
                                    className="relative w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2"
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 2,
                                        boxShadow: `0 8px 30px -10px ${TEAL}15`
                                    }}
                                >
                                    {step.icon}

                                    {/* Step number badge */}
                                    <div className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center text-xs font-extrabold"
                                        style={{
                                            background: TEAL,
                                            color: '#000',
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
                                    <h3 className="text-base font-extrabold text-black mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                        {step.title}
                                    </h3>
                                    {/* Source badge (SerpAPI / Perplexity AI / WordPress) */}
                                    <div className="inline-block mb-2 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase"
                                        style={{
                                            background: `${TEAL}15`,
                                            color: TEAL,
                                            border: `1px solid ${TEAL}30`,
                                            borderRadius: 2,
                                            fontFamily: "'DM Mono', monospace"
                                        }}>
                                        {step.badge}
                                    </div>
                                    <p className="text-xs text-gray-700 leading-relaxed px-1" style={{ fontFamily: "'DM Mono', monospace" }}>
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
                    className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-4"
                >
                    <button
                        onClick={() => navigate('/dashboard/agents/seo')}
                        className="group inline-flex items-center gap-3 font-extrabold text-base transition-all"
                        style={{
                            background: TEAL,
                            color: '#000',
                            padding: '16px 32px',
                            borderRadius: 2,
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: '-0.01em',
                            fontFamily: "'Space Grotesk', sans-serif",
                        }}
                    >
                        Try the SEO AI Agent <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/features/blog-agent')}
                        className="group inline-flex items-center gap-3 font-extrabold text-base transition-all"
                        style={{
                            background: 'transparent',
                            color: TEAL,
                            padding: '15px 32px',
                            borderRadius: 2,
                            border: `1px solid ${TEAL}50`,
                            cursor: 'pointer',
                            letterSpacing: '-0.01em',
                            fontFamily: "'Space Grotesk', sans-serif",
                        }}
                    >
                        How Our Agent Works <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>

            </ScrollReveal>
        </section>
    );
};

export default BlogAgentSection;
