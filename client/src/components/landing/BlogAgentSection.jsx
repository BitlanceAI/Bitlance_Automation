import React from 'react';
import { Database, FileText, Wand2, Globe, ArrowRight, Rss, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';
import { useNavigate } from 'react-router-dom';

const BlogAgentSection = ({ onOpenBooking }) => {
    const navigate = useNavigate();

    const workflowSteps = [
        {
            icon: <Database className="w-8 h-8 text-cyan-400" />,
            title: "Data Ingestion",
            desc: "Provide your niche or keyword list via Excel.",
            color: "from-cyan-500/20 to-blue-500/20",
            border: "border-cyan-500/30",
            delay: 0.2
        },
        {
            icon: <FileText className="w-8 h-8 text-purple-400" />,
            title: "Outline & Research",
            desc: "AI extracts trends and builds a structured outline.",
            color: "from-purple-500/20 to-fuchsia-500/20",
            border: "border-purple-500/30",
            delay: 0.4
        },
        {
            icon: <Wand2 className="w-8 h-8 text-amber-400" />,
            title: "Content Generation",
            desc: "Crafts SEO-optimized content with engaging titles.",
            color: "from-amber-500/20 to-orange-500/20",
            border: "border-amber-500/30",
            delay: 0.6
        },
        {
            icon: <Globe className="w-8 h-8 text-emerald-400" />,
            title: "Auto-Publish",
            desc: "Posts directly to your blog with images and tags.",
            color: "from-emerald-500/20 to-green-500/20",
            border: "border-emerald-500/30",
            delay: 0.8
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-[#030303] border-t border-white/5">
            {/* Background glowing effects */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header Subtext */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium mb-6"
                    >
                        <Rss size={16} /> Content Automation Engine
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-extrabold mb-6 text-white leading-tight"
                    >
                        Automate Your SEO with the<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                            Blog AI Agent
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/60 mb-8"
                    >
                        Stop writing manually. Our autonomous agent takes your keywords and turns them into
                        fully-formatted, SEO-optimized blog posts published straight to your website.
                    </motion.p>
                </div>

                {/* Animated Workflow */}
                <div className="mt-20 relative max-w-6xl mx-auto pb-12">

                    {/* Connecting dotted line (Desktop only) */}
                    <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-white/20 z-0">
                        {/* Animated gradient bar moving across the line */}
                        <motion.div
                            className="absolute inset-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-1/3 -top-[2px]"
                            animate={{ left: ['-33%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative z-10">
                        {workflowSteps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center relative text-center group">

                                {/* Mobile connector arrow */}
                                {index < workflowSteps.length - 1 && (
                                    <div className="md:hidden text-white/20 my-4 transform translate-y-2">
                                        <ArrowDown size={24} />
                                    </div>
                                )}

                                {/* Icon Bubble */}
                                <motion.div
                                    initial={{ opacity: 0, y: 40, scale: 0.8 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.6, delay: step.delay, type: "spring" }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    className={`relative w-28 h-28 md:w-32 md:h-32 mb-6 rounded-[2rem] bg-gradient-to-br ${step.color} border ${step.border} flex items-center justify-center backdrop-blur-md shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105`}
                                >
                                    <div className="absolute inset-0 bg-white/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    {step.icon}

                                    {/* Number Badge */}
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-black font-bold rounded-full flex items-center justify-center text-sm shadow-lg">
                                        {index + 1}
                                    </div>
                                </motion.div>

                                {/* Text Content */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: step.delay + 0.3 }}
                                    viewport={{ once: true }}
                                >
                                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-white/50 leading-relaxed px-2">
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
                    transition={{ duration: 0.5, delay: 1 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <button
                        onClick={() => navigate('/features/blog-agent')}
                        className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold transition-all hover:scale-105"
                    >
                        See the Blog Agent in Action <ArrowRight size={18} />
                    </button>
                </motion.div>

            </ScrollReveal>
        </section>
    );
};

export default BlogAgentSection;
