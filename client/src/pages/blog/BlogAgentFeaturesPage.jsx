import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/landing/Footer';
import FinalCtaSection from '../../components/landing/FinalCtaSection';
import SEOHead from '../../components/layout/SEOHead';
import {
    Cpu, Globe, ArrowRight, Zap, Target, LineChart,
    ShieldCheck, ChevronDown, Search, Tag, Wand2, Rss, Play
} from 'lucide-react';
import ScrollReveal from '../../components/ui/ScrollReveal';

const TEAL = '#26CECE';

// Paste your YouTube / Loom / video URL here to show it on the page.
// Leave empty to show a placeholder panel instead.
const VIDEO_URL = 'https://app.heygen.com/embeds/7981e04d73cc48c8b6a3f9bc13895398';

const BlogAgentFeaturesPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleOpenBooking = () => {
        navigate('/dashboard/agents/seo');
    };

    const features = [
        {
            icon: <Target className="w-6 h-6" style={{ color: TEAL }} />,
            title: "Automated Keyword Targeting",
            description: "Upload an Excel sheet of niches and keywords. The AI agent analyzes search intent and automatically builds a content strategy around high-value terms."
        },
        {
            icon: <Cpu className="w-6 h-6" style={{ color: TEAL }} />,
            title: "Autonomous Content Generation",
            description: "Powered by advanced language models, the agent drafts 100% unique, human-like articles that are informative, engaging, and structurally optimized."
        },
        {
            icon: <Globe className="w-6 h-6" style={{ color: TEAL }} />,
            title: "Direct-to-Blog Publishing",
            description: "Say goodbye to copy-pasting. The agent logs into your CMS (like WordPress or custom backends) and hits publish. It handles formatting, tags, and images."
        },
        {
            icon: <LineChart className="w-6 h-6" style={{ color: TEAL }} />,
            title: "Built-In SEO Optimization",
            description: "Every post is generated with SEO best practices: proper H1/H2 tags, optimized meta descriptions, and keyword density checks to ensure it ranks on Google."
        },
        {
            icon: <Zap className="w-6 h-6" style={{ color: TEAL }} />,
            title: "Bulk Generation Capability",
            description: "Need 50 blog posts by next week? No problem. The agent can batch generate and schedule entire content calendars in minutes."
        },
        {
            icon: <ShieldCheck className="w-6 h-6" style={{ color: TEAL }} />,
            title: "Plagiarism & AI Detection Safe",
            description: "Content is engineered to pass AI detection filters and guarantee zero plagiarism, ensuring your brand maintains authority and credibility."
        }
    ];

    const workflowSteps = [
        {
            icon: <Search className="w-8 h-8" style={{ color: TEAL }} />,
            step: "01",
            badge: "SerpAPI",
            title: "Trending Topics",
            desc: "Searches Google in real-time to find trending topics and People Also Ask questions for your industry."
        },
        {
            icon: <Tag className="w-8 h-8" style={{ color: TEAL }} />,
            step: "02",
            badge: "SerpAPI",
            title: "Keyword Research",
            desc: "Extracts related searches and PAA signals from Google to build a real, rankable keyword set."
        },
        {
            icon: <Wand2 className="w-8 h-8" style={{ color: TEAL }} />,
            step: "03",
            badge: "Perplexity AI",
            title: "Content Generation",
            desc: "Injects SERP-sourced topic and keywords into a writing prompt to craft a fully SEO-optimized article."
        },
        {
            icon: <ShieldCheck className="w-8 h-8" style={{ color: TEAL }} />,
            step: "04",
            badge: "SerpAPI",
            title: "Plagiarism Check",
            desc: "Runs exact-phrase Google searches on key sentences to verify the content is original before publishing."
        },
        {
            icon: <Globe className="w-8 h-8" style={{ color: TEAL }} />,
            step: "05",
            badge: "WordPress",
            title: "Auto-Publish",
            desc: "Posts directly to your website with images, SEO title, and tags — fully hands-free."
        }
    ];

    const blogAgentSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "Bitlance Blog AI Agent",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description": "An autonomous AI agent that researches topics, writes SEO-optimized blog posts, and publishes them directly to your website 24/7.",
                "offers": { "@type": "Offer", "url": "https://www.bitlancetechhub.com/dashboard/agents/seo" },
                "featureList": [
                    "Automated keyword targeting from Excel uploads",
                    "Autonomous long-form content generation",
                    "Direct CMS publishing (WordPress and custom backends)",
                    "Built-in SEO optimization with meta descriptions",
                    "Bulk generation and scheduling capability",
                    "Plagiarism and AI detection safe content"
                ],
                "publisher": { "@type": "Organization", "name": "Bitlance Tech Hub", "url": "https://www.bitlancetechhub.com" }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Can AI really write SEO-optimized blog content?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Modern large language models, when guided by a structured SEO agent like Bitlance's Blog AI Agent, can produce articles that include proper H1/H2 structure, optimized meta descriptions, natural keyword density, and topical depth." }
                    },
                    {
                        "@type": "Question",
                        "name": "How many blog posts can the Blog AI Agent generate per day?",
                        "acceptedAnswer": { "@type": "Answer", "text": "The Bitlance Blog AI Agent can generate and publish dozens of articles per day depending on your plan. Bulk mode lets you upload an Excel sheet of keywords and schedule an entire content calendar in minutes." }
                    },
                    {
                        "@type": "Question",
                        "name": "Does the Blog AI Agent post directly to WordPress?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Yes. The agent can authenticate with your WordPress CMS via the REST API and publish posts directly — including formatting, featured image attachment, category and tag assignment, and meta SEO fields." }
                    },
                    {
                        "@type": "Question",
                        "name": "Will AI-generated content pass Google's quality guidelines?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Google's Helpful Content guidelines focus on whether content is useful to readers, not whether it was written by a human. The Blog AI Agent produces factually grounded, well-structured content that passes AI detection checks." }
                    }
                ]
            }
        ]
    };

    return (
        <div className="min-h-screen text-white" style={{ background: '#070707' }}>
            <SEOHead
                title="AI Blog Writing Agent — Automated SEO Content at Scale"
                description="The Bitlance Blog AI Agent researches, writes, optimizes, and publishes high-ranking SEO articles to your site 24/7. Stop writing manually. Generate 50+ posts a week automatically."
                canonicalUrl="https://www.bitlancetechhub.com/features/blog-agent"
                keywords="AI blog writer, automated SEO content, AI content agent, blog automation, auto-publish WordPress, AI writing tool, SEO content generator"
                structuredData={blogAgentSchema}
            />
            <Navbar />

            {/* Hero Section */}
            <header className="relative pt-36 pb-24 overflow-hidden" style={{ borderBottom: '1px solid #1E1E1E' }}>
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-40"
                    style={{ background: `${TEAL}18` }}
                />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 mb-8"
                        style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 11,
                            letterSpacing: '0.14em',
                            color: TEAL,
                            textTransform: 'uppercase',
                        }}
                    >
                        <Rss size={14} /> Content Automation Engine
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.06] tracking-tight"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
                    >
                        Put Your SEO on <br />
                        <span style={{ color: TEAL }}>Absolute Autopilot</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed"
                        style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                        The Blog AI Agent researches, writes, optimizes, and publishes high-ranking content to your
                        website 24/7. Stop writing manually. Start dominating search results.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <button
                            onClick={handleOpenBooking}
                            className="group inline-flex items-center gap-3 font-bold text-base transition-all"
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
                            Try the SEO AI Agent <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </header>

            {/* Video Section */}
            <section className="py-20 relative z-10" style={{ borderBottom: '1px solid #1E1E1E' }}>
                <div className="max-w-5xl mx-auto px-6">
                    <ScrollReveal>
                        <div className="text-center mb-10">
                            <div
                                className="inline-block mb-3"
                                style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 11,
                                    letterSpacing: '0.14em',
                                    color: TEAL,
                                    textTransform: 'uppercase',
                                }}
                            >
                                SEE IT IN ACTION
                            </div>
                            <h2
                                className="text-3xl md:text-4xl font-extrabold"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
                            >
                                Watch the Agent <span style={{ color: TEAL }}>Work Live</span>
                            </h2>
                        </div>

                        {VIDEO_URL ? (
                            <div
                                className="relative w-full overflow-hidden"
                                style={{
                                    border: `1px solid ${TEAL}40`,
                                    borderRadius: 2,
                                    aspectRatio: '16/9',
                                    boxShadow: `0 0 60px -10px ${TEAL}20`,
                                }}
                            >
                                <iframe
                                    src={
                                        VIDEO_URL.includes('youtube.com/watch')
                                            ? VIDEO_URL.replace('watch?v=', 'embed/')
                                            : VIDEO_URL.includes('youtu.be/')
                                            ? VIDEO_URL.replace('youtu.be/', 'www.youtube.com/embed/')
                                            : VIDEO_URL
                                    }
                                    title="SEO AI Agent Demo"
                                    className="absolute inset-0 w-full h-full"
                                    allow="encrypted-media; fullscreen;"
                                    allowFullScreen
                                    style={{ border: 'none' }}
                                />
                            </div>
                        ) : (
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                                className="relative w-full flex flex-col items-center justify-center gap-5 cursor-default"
                                style={{
                                    aspectRatio: '16/9',
                                    background: '#0D0D0D',
                                    border: `1px dashed ${TEAL}40`,
                                    borderRadius: 2,
                                }}
                            >
                                {/* Animated glow orb */}
                                <div
                                    className="absolute inset-0 rounded-sm pointer-events-none"
                                    style={{ background: `radial-gradient(ellipse at center, ${TEAL}08 0%, transparent 70%)` }}
                                />
                                <div
                                    className="w-16 h-16 flex items-center justify-center"
                                    style={{
                                        background: `${TEAL}15`,
                                        border: `1px solid ${TEAL}40`,
                                        borderRadius: 2,
                                    }}
                                >
                                    <Play size={28} style={{ color: TEAL }} />
                                </div>
                                <div className="text-center">
                                    <p
                                        className="text-white/60 text-sm mb-1"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        Demo video coming soon
                                    </p>
                                    <p
                                        className="text-white/30 text-xs"
                                        style={{ fontFamily: "'DM Mono', monospace" }}
                                    >
                                        Set VIDEO_URL in BlogAgentFeaturesPage.jsx to embed
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </ScrollReveal>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="py-24 relative z-10" style={{ borderBottom: '1px solid #1E1E1E' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <div
                                className="inline-block mb-4"
                                style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 11,
                                    letterSpacing: '0.14em',
                                    color: TEAL,
                                    textTransform: 'uppercase',
                                }}
                            >
                                CAPABILITIES
                            </div>
                            <h2
                                className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
                            >
                                Everything an SEO Manager Does,{' '}
                                <span style={{ color: TEAL }}>Done in Seconds.</span>
                            </h2>
                            <p className="text-white/50 max-w-2xl mx-auto text-base" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Replacing costly agencies with an autonomous machine that never sleeps, never gets
                                writer's block, and perfectly follows SEO formulas.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <ScrollReveal key={index} delay={index * 0.08}>
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full p-8"
                                    style={{
                                        background: '#111',
                                        border: '1px solid #1E1E1E',
                                        borderRadius: 2,
                                    }}
                                >
                                    <div
                                        className="w-14 h-14 flex items-center justify-center mb-6"
                                        style={{
                                            background: `${TEAL}10`,
                                            border: `1px solid ${TEAL}30`,
                                            borderRadius: 2,
                                        }}
                                    >
                                        {feature.icon}
                                    </div>
                                    <h3
                                        className="text-lg font-bold mb-3 text-white"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/50 leading-relaxed text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                                        {feature.description}
                                    </p>
                                </motion.div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works — Workflow Pipeline */}
            <section className="py-24 relative overflow-hidden" style={{ borderBottom: '1px solid #1E1E1E' }}>
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-30"
                    style={{ background: `${TEAL}0A` }}
                />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <div
                                className="inline-block mb-4"
                                style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 11,
                                    letterSpacing: '0.14em',
                                    color: TEAL,
                                    textTransform: 'uppercase',
                                }}
                            >
                                PIPELINE
                            </div>
                            <h2
                                className="text-3xl md:text-5xl font-extrabold mb-4"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
                            >
                                The Content Pipeline
                            </h2>
                            <p className="text-white/50 max-w-xl mx-auto text-base" style={{ fontFamily: "'DM Mono', monospace" }}>
                                From raw keyword to published article — without lifting a finger.
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Connecting line */}
                    <div className="hidden md:block relative mb-0">
                        <div className="absolute top-[50px] left-[8%] right-[8%] h-[1px] border-t border-[#1E1E1E] z-0">
                            <motion.div
                                className="absolute inset-0 h-[1px] w-1/5 -top-[1px]"
                                style={{ background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)` }}
                                animate={{ left: ['-20%', '100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-5 gap-6 relative z-10">
                        {workflowSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.12 }}
                                viewport={{ once: true, margin: '-50px' }}
                                className="flex flex-col items-center text-center group"
                            >
                                {/* Icon Box */}
                                <div
                                    className="relative w-24 h-24 mb-6 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2"
                                    style={{
                                        background: '#111',
                                        border: '1px solid #1E1E1E',
                                        borderRadius: 2,
                                        boxShadow: `0 8px 30px -10px ${TEAL}15`,
                                    }}
                                >
                                    {step.icon}
                                    <div
                                        className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center text-xs font-bold"
                                        style={{
                                            background: TEAL,
                                            color: '#070707',
                                            borderRadius: 2,
                                            fontFamily: "'DM Mono', monospace",
                                        }}
                                    >
                                        {step.step}
                                    </div>
                                </div>

                                <h3
                                    className="text-base font-bold text-white mb-1"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {step.title}
                                </h3>
                                <div
                                    className="inline-block mb-2 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase"
                                    style={{
                                        background: `${TEAL}15`,
                                        color: TEAL,
                                        border: `1px solid ${TEAL}30`,
                                        borderRadius: 2,
                                        fontFamily: "'DM Mono', monospace",
                                    }}
                                >
                                    {step.badge}
                                </div>
                                <p
                                    className="text-xs text-white/50 leading-relaxed px-1"
                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                >
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases — Split Panel */}
            <section className="py-24" style={{ borderBottom: '1px solid #1E1E1E' }}>
                <div className="max-w-7xl mx-auto px-6">
                    <div
                        className="flex flex-col md:flex-row items-center gap-12 p-10 md:p-14"
                        style={{
                            background: '#111',
                            border: '1px solid #1E1E1E',
                            borderRadius: 2,
                        }}
                    >
                        <div className="flex-1">
                            <div
                                className="inline-block mb-4"
                                style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 11,
                                    letterSpacing: '0.14em',
                                    color: TEAL,
                                    textTransform: 'uppercase',
                                }}
                            >
                                USE CASES
                            </div>
                            <h2
                                className="text-3xl md:text-4xl font-extrabold mb-6"
                                style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
                            >
                                Perfect for Scaling Agencies &amp; SaaS
                            </h2>
                            <p className="text-white/60 text-base mb-8 leading-relaxed" style={{ fontFamily: "'DM Mono', monospace" }}>
                                Don't let your domain authority sit idle. Whether you are an SEO agency managing 50
                                client sites, or a SaaS company trying to capture top-of-funnel leads, the Blog Agent
                                is the ultimate infinite-content machine.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Drastically reduce freelance content costs',
                                    'Publish daily to compound organic traffic',
                                    'Automatically target long-tail keywords',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/80 text-sm" style={{ fontFamily: "'DM Mono', monospace" }}>
                                        <div
                                            className="w-5 h-5 flex-shrink-0 flex items-center justify-center"
                                            style={{ background: `${TEAL}15`, border: `1px solid ${TEAL}40`, borderRadius: 2 }}
                                        >
                                            <ShieldCheck size={12} style={{ color: TEAL }} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Traffic chart */}
                        <div className="flex-1 w-full flex justify-center">
                            <div
                                className="relative w-full max-w-sm aspect-square p-6 flex flex-col justify-end overflow-hidden"
                                style={{ background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 2 }}
                            >
                                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${TEAL}08, transparent)` }} />
                                <div className="flex items-end justify-between h-48 gap-2 relative z-10 w-full">
                                    {[20, 35, 25, 50, 45, 70, 60, 90, 85, 120].map((height, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${(height / 120) * 100}%` }}
                                            transition={{ duration: 1, delay: i * 0.08 }}
                                            viewport={{ once: true }}
                                            className="w-full rounded-t-none"
                                            style={{ background: `linear-gradient(to top, ${TEAL}, ${TEAL}80)`, borderRadius: '1px 1px 0 0' }}
                                        />
                                    ))}
                                </div>
                                <div
                                    className="mt-4 pt-4 text-center text-[10px] tracking-widest"
                                    style={{ borderTop: '1px solid #1E1E1E', color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono', monospace" }}
                                >
                                    ORGANIC TRAFFIC GROWTH
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24" style={{ borderBottom: '1px solid #1E1E1E' }}>
                <ScrollReveal className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <div
                            className="inline-block mb-4"
                            style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 11,
                                letterSpacing: '0.14em',
                                color: TEAL,
                                textTransform: 'uppercase',
                            }}
                        >
                            FAQ
                        </div>
                        <h2
                            className="text-3xl md:text-4xl font-extrabold mb-4"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}
                        >
                            Frequently Asked Questions
                        </h2>
                        <p className="text-white/50 text-base" style={{ fontFamily: "'DM Mono', monospace" }}>
                            Common questions about AI-generated SEO content and the Blog AI Agent.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {[
                            {
                                q: "Can AI really write SEO-optimized blog content?",
                                a: "Yes. Modern large language models, when guided by a structured SEO agent like Bitlance's Blog AI Agent, can produce articles that include proper H1/H2 structure, optimized meta descriptions, natural keyword density, and topical depth — all factors Google's ranking algorithm rewards."
                            },
                            {
                                q: "How many blog posts can the Blog AI Agent generate per day?",
                                a: "The Bitlance Blog AI Agent can generate and publish dozens of articles per day depending on your plan. Bulk mode lets you upload an Excel sheet of keywords and schedule an entire content calendar in minutes."
                            },
                            {
                                q: "Does the Blog AI Agent post directly to WordPress?",
                                a: "Yes. The agent can authenticate with your WordPress CMS via the REST API and publish posts directly — including formatting, featured image attachment, category and tag assignment, and meta SEO fields — without you needing to copy-paste anything."
                            },
                            {
                                q: "Will AI-generated content pass Google's quality guidelines?",
                                a: "Google's Helpful Content guidelines focus on whether content is useful to readers, not whether it was written by a human. The Blog AI Agent is engineered to produce factually grounded, well-structured, and informative content. It ensures zero plagiarism and passes AI detection checks, maintaining your site's authority."
                            }
                        ].map((item, i) => (
                            <details
                                key={i}
                                className="group cursor-pointer"
                                style={{ background: '#111', border: '1px solid #1E1E1E', borderRadius: 2 }}
                            >
                                <summary
                                    className="flex items-center justify-between p-6 font-semibold text-white list-none"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {item.q}
                                    <ChevronDown
                                        className="flex-shrink-0 ml-4 group-open:rotate-180 transition-transform"
                                        size={18}
                                        style={{ color: TEAL }}
                                    />
                                </summary>
                                <p
                                    className="px-6 pb-6 text-white/60 leading-relaxed text-sm"
                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                >
                                    {item.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            {/* Final CTA */}
            <FinalCtaSection onOpenBooking={handleOpenBooking} />
            <Footer />
        </div>
    );
};

export default BlogAgentFeaturesPage;
