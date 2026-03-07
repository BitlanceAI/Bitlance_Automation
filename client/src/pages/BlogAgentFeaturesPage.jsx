import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/landing/Footer';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import {
    Edit3, Cpu, Globe, Rocket, ArrowRight, Zap, Target, LineChart, ShieldCheck
} from 'lucide-react';
import ScrollReveal from '../components/ui/ScrollReveal';

const BlogAgentFeaturesPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleOpenBooking = () => {
        navigate('/apply/real-estate');
    };

    const features = [
        {
            icon: <Target className="w-6 h-6 text-orange-400" />,
            title: "Automated Keyword Targeting",
            description: "Upload an Excel sheet of niches and keywords. The AI agent analyzes search intent and automatically builds a content strategy around high-value terms."
        },
        {
            icon: <Cpu className="w-6 h-6 text-orange-400" />,
            title: "Autonomous Content Generation",
            description: "Powered by advanced language models, the agent drafts 100% unique, human-like articles that are informative, engaging, and structurally optimized."
        },
        {
            icon: <Globe className="w-6 h-6 text-orange-400" />,
            title: "Direct-to-Blog Publishing",
            description: "Say goodbye to copy-pasting. The agent logs into your CMS (like WordPress or custom backends) and hits publish. It handles formatting, tags, and images."
        },
        {
            icon: <LineChart className="w-6 h-6 text-orange-400" />,
            title: "Built-In SEO Optimization",
            description: "Every post is generated with SEO best practices: proper H1/H2 tags, optimized meta descriptions, and keyword density checks to ensure it ranks on Google."
        },
        {
            icon: <Zap className="w-6 h-6 text-orange-400" />,
            title: "Bulk Generation Capability",
            description: "Need 50 blog posts by next week? No problem. The agent can batch generate and schedule entire content calendars in minutes."
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-orange-400" />,
            title: "Plagiarism & AI Detection Safe",
            description: "Content is engineered to pass AI detection filters and guarantee zero plagiarism, ensuring your brand maintains authority and credibility."
        }
    ];

    const workflowSteps = [
        {
            step: "01",
            title: "Feed the Agent",
            desc: "Provide the AI with your core topics or an Excel sheet of specific keywords you want to rank for."
        },
        {
            step: "02",
            title: "AI Research & Outlining",
            desc: "The agent scours the web for current data, formulates an outline, and drafts the content ensuring high readability."
        },
        {
            step: "03",
            title: "Review & Refine (Optional)",
            desc: "Set the agent to 'Draft Mode' to review its work, or let it run autonomously if you trust its output."
        },
        {
            step: "04",
            title: "Live on Your Site",
            desc: "The agent formats the HTML, attaches relevant images, sets the SEO meta tags, and publishes the post live."
        }
    ];

    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-orange-500/30">
            <Navbar />

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-8"
                    >
                        <Edit3 size={16} /> SEO & Content Automation
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight"
                    >
                        Put Your SEO on <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                            Absolute Autopilot
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        The Blog AI Agent researches, writes, optimizes, and publishes high-ranking content to your website 24/7. Stop writing manually. Start dominating search results.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                        <button
                            onClick={handleOpenBooking}
                            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2"
                        >
                            Book a Live Demo <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </header>

            {/* Core Features Grid */}
            <section className="py-24 border-t border-white/5 relative z-10 bg-[#030303]">
                <div className="max-w-7xl mx-auto px-6">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything an SEO Manager Does, <br /><span className="text-orange-400">Done in Seconds.</span></h2>
                            <p className="text-white/60 max-w-2xl mx-auto text-lg">
                                Replacing costly agencies with an autonomous machine that never sleeps, never gets writer's block, and perfectly follows SEO formulas.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <ScrollReveal key={index} delay={index * 0.1}>
                                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors h-full group">
                                    <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 border border-orange-500/20 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-white/60 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works (Workflow) */}
            <section className="py-24 border-t border-white/5 relative overflow-hidden bg-gradient-to-b from-[#030303] to-[#0a0503]">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">The Content Pipeline</h2>
                            <p className="text-white/60 max-w-2xl mx-auto text-lg">
                                From raw keyword to published article without lifting a finger.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-4 gap-8">
                        {workflowSteps.map((step, index) => (
                            <ScrollReveal key={index} delay={index * 0.1} className="relative">
                                {/* Connecting Line for Desktop */}
                                {index < workflowSteps.length - 1 && (
                                    <div className="hidden md:block absolute top-[40px] left-[60%] w-[80%] h-[2px] border-t-2 border-dashed border-white/20 z-0"></div>
                                )}

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full bg-[#111] border-2 border-orange-500/30 flex items-center justify-center text-2xl font-black text-orange-400 mb-6 font-mono shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                    <p className="text-white/60 text-sm leading-relaxed px-4">
                                        {step.desc}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-24 border-t border-white/5 bg-[#030303]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-gradient-to-br from-orange-900/40 to-[#030303] border border-orange-500/20 rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Perfect for Scaling Agencies & SaaS</h2>
                            <p className="text-white/70 text-lg mb-8 leading-relaxed">
                                Don't let your domain authority sit idle. Whether you are an SEO agency managing 50 client sites, or a SaaS company trying to capture top-of-funnel leads, the Blog Agent is the ultimate infinite-content machine.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-white/80"><ShieldCheck className="text-orange-400" size={20} /> Drastically reduce freelance content costs</li>
                                <li className="flex items-center gap-3 text-white/80"><ShieldCheck className="text-orange-400" size={20} /> Publish daily to compound organic traffic</li>
                                <li className="flex items-center gap-3 text-white/80"><ShieldCheck className="text-orange-400" size={20} /> Automatically target long-tail keywords</li>
                            </ul>
                        </div>
                        <div className="flex-1 w-full flex justify-center">
                            {/* Decorative representation of compounding traffic */}
                            <div className="relative w-full max-w-sm aspect-square bg-[#111] rounded-2xl border border-white/10 p-6 flex flex-col justify-end overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent" />

                                {/* Fake Chart Bars */}
                                <div className="flex items-end justify-between h-48 gap-2 relative z-10 w-full">
                                    {[20, 35, 25, 50, 45, 70, 60, 90, 85, 120].map((height, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${(height / 120) * 100}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-sm"
                                        />
                                    ))}
                                </div>
                                <div className="mt-4 border-t border-white/10 pt-4 text-center text-xs text-white/40 tracking-widest font-mono">
                                    ORGANIC TRAFFIC GROWTH
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <FinalCtaSection onOpenBooking={handleOpenBooking} />
            <Footer />
        </div>
    );
};

export default BlogAgentFeaturesPage;
