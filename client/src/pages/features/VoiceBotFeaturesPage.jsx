import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Phone, ArrowLeft, Bot, Calendar, Database,
    BarChart3, Settings, ShieldCheck, Zap, ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

import TiltCard from '../../components/ui/TiltCard';
import ScrollReveal from '../../components/ui/ScrollReveal';
import SEOHead from '../../components/layout/SEOHead';
import CRMDashboardAnimation from '../../components/landing/CRMDashboardAnimation';

const FeatureDetail = ({ icon: Icon, title, description, color }) => (
    <div className="flex gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] transition-colors group">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center border border-${color}-400/30 group-hover:scale-110 transition-transform`}>
            <Icon className={`text-${color}-400`} size={24} />
        </div>
        <div>
            <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
            <p className="text-white/60 leading-relaxed">{description}</p>
        </div>
    </div>
);

const VoiceBotFeaturesPage = () => {
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            icon: Bot,
            title: "Human-Like Conversations",
            description: "Advanced natural language processing allows the AI to understand intent, handle interruptions, and speak with natural pacing and emotion.",
            color: "violet"
        },
        {
            icon: Phone,
            title: "Inbound & Outbound Calling",
            description: "Automatically answer every incoming customer query instantly, or run automated outbound telecalling campaigns to qualify leads at scale.",
            color: "indigo"
        },
        {
            icon: Calendar,
            title: "Automated Meeting Booking",
            description: "The AI checks your team's live calendar and schedules meetings or site visits directly during the call without human intervention.",
            color: "blue"
        },
        {
            icon: Database,
            title: "Seamless CRM Integration",
            description: "Every call transcript, summary, and extracted data point is automatically pushed to your CRM (HubSpot, Salesforce, Zoho, etc).",
            color: "emerald"
        },
        {
            icon: BarChart3,
            title: "Deep Call Analytics",
            description: "Get insights into customer sentiment, common objections, and call outcomes through auto-generated analytics dashboards.",
            color: "amber"
        },
        {
            icon: ShieldCheck,
            title: "Enterprise-Grade Security",
            description: "All conversations are encrypted, and we maintain strict compliance with data privacy regulations to protect your customers.",
            color: "rose"
        }
    ];

    const voiceBotSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "Bitlance AI Voice Agent",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description": "An autonomous AI voice agent that handles inbound and outbound calls, qualifies leads, books meetings, and syncs data to your CRM 24/7 without human intervention.",
                "offers": { "@type": "Offer", "url": "https://www.bitlancetechhub.com/apply/real-estate" },
                "featureList": [
                    "Human-like natural language conversations",
                    "Inbound and outbound calling",
                    "Automated meeting booking via Calendly",
                    "HubSpot, Salesforce, and Zoho CRM integration",
                    "Deep call analytics and sentiment analysis",
                    "Enterprise-grade encrypted calls"
                ],
                "publisher": { "@type": "Organization", "name": "Bitlance Tech Hub", "url": "https://www.bitlancetechhub.com" }
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "What is an AI voice agent?",
                        "acceptedAnswer": { "@type": "Answer", "text": "An AI voice agent is a software system that uses natural language processing and speech synthesis to conduct real phone conversations autonomously. Unlike a simple IVR, it understands context, handles objections, and completes tasks like booking meetings or qualifying leads without any human operator." }
                    },
                    {
                        "@type": "Question",
                        "name": "How does the Bitlance AI Voice Agent integrate with my CRM?",
                        "acceptedAnswer": { "@type": "Answer", "text": "The Bitlance AI Voice Agent natively integrates with HubSpot, Salesforce, and Zoho CRM. After every call, it automatically pushes the call transcript, extracted lead data, and meeting bookings directly to your CRM in real time via API." }
                    },
                    {
                        "@type": "Question",
                        "name": "Can the AI voice agent handle thousands of calls simultaneously?",
                        "acceptedAnswer": { "@type": "Answer", "text": "Yes. The Bitlance AI Voice Agent is designed for enterprise-scale concurrency. It can run thousands of parallel outbound campaigns or answer every inbound call simultaneously, with zero wait time for customers." }
                    },
                    {
                        "@type": "Question",
                        "name": "What industries benefit most from AI voice agents?",
                        "acceptedAnswer": { "@type": "Answer", "text": "AI voice agents deliver the highest ROI in real estate (lead qualification and site visit booking), insurance (policy renewal and claims intake), e-commerce (order follow-ups), and SaaS (trial-to-paid conversion calls). Any business that relies on high-volume phone outreach benefits significantly." }
                    }
                ]
            }
        ]
    };

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            <SEOHead
                title="AI Voice Agent for Sales & Lead Qualification"
                description="Deploy a hyper-realistic AI voice agent that handles thousands of concurrent calls, qualifies leads, books meetings, and syncs to your CRM 24/7. No human operators needed."
                canonicalUrl="https://www.bitlancetechhub.com/features/voice-bot"
                keywords="AI voice agent, AI calling bot, automated phone calls, AI sales agent, inbound calling AI, outbound calling automation, CRM integration voice bot"
                structuredData={voiceBotSchema}
            />

            {/* Navigation Bar (Minimal for sub-pages) */}
            <nav className="fixed top-0 w-full z-50 bg-[#030303]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="text-xl font-bold tracking-tight">
                        Bitlance<span className="text-violet-500">AI</span>
                    </div>
                    <button
                        onClick={() => navigate('/apply/real-estate')}
                        className="btn-primary px-6 py-2.5 font-semibold rounded-full transition-colors text-sm"
                    >
                        Book Demo
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-24 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
                        >
                            <Zap size={16} className="text-violet-400" />
                            <span className="text-sm font-medium text-white/80">Next-Gen Voice Intelligence</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
                        >
                            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">AI Voice Assistant</span> for Modern Teams
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xl text-white/60 leading-relaxed mb-12"
                        >
                            Deploy hyper-realistic AI voice agents that can handle thousands of concurrent calls, book meetings, qualify leads, and sync with your CRM—24/7.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                        >
                            <CRMDashboardAnimation />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid Section */}
            <section className="py-24 border-t border-white/5 relative">
                <ScrollReveal className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to scale</h2>
                        <p className="text-lg text-white/50">Stop missing calls and start converting leads on autopilot.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <TiltCard key={idx}>
                                <div className="h-full bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:border-violet-500/30 transition-all duration-300">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${feature.color}-500/20 to-transparent flex items-center justify-center mb-6 border border-${feature.color}-500/30 shadow-[0_0_15px_rgba(var(--${feature.color}-500),0.2)]`}>
                                        <feature.icon className={`text-${feature.color}-400`} size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white/90">{feature.title}</h3>
                                    <p className="text-white/50 leading-relaxed">{feature.description}</p>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            {/* How it Works / Side by Side */}
            <section className="py-24 bg-white/[0.02] border-y border-white/5 overflow-hidden">
                <ScrollReveal className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Works seamlessly with your existing stack.</h2>
                            <p className="text-lg text-white/60 mb-8 leading-relaxed">
                                We don't just build a bot; we build an entire workflow. The Bitlance AI Voice Bot integrates directly into the tools you already use every day.
                            </p>

                            <div className="space-y-4">
                                <FeatureDetail
                                    icon={Database}
                                    title="HubSpot & Salesforce Ready"
                                    description="Lead data is verified and synced to your CRM in real-time right after the call ends."
                                    color="violet"
                                />
                                <FeatureDetail
                                    icon={Calendar}
                                    title="Live Calendly Sync"
                                    description="The AI checks your availability instantly and books meetings without double-booking."
                                    color="indigo"
                                />
                                <FeatureDetail
                                    icon={Settings}
                                    title="Custom API Webhooks"
                                    description="Trigger custom automations in Zapier or Make.com based on specific call outcomes."
                                    color="blue"
                                />
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            {/* Abstract Tech Visual */}
                            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 rounded-full blur-3xl opacity-50" />
                                <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
                                <div className="absolute inset-12 border border-violet-500/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                                <div className="absolute inset-24 border border-indigo-500/30 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.5)] flex items-center justify-center">
                                    <Bot size={56} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* FAQ Section */}
            <section className="py-24 border-t border-white/5 bg-[#030303]">
                <ScrollReveal className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-white/50 text-lg">Everything you need to know before deploying your first AI voice agent.</p>
                    </div>
                    <div className="space-y-4">
                        {[
                            {
                                q: "What is an AI voice agent?",
                                a: "An AI voice agent is a software system that uses natural language processing and speech synthesis to conduct real phone conversations autonomously. Unlike a simple IVR, it understands context, handles objections, and completes tasks like booking meetings or qualifying leads without any human operator."
                            },
                            {
                                q: "How does the Bitlance AI Voice Agent integrate with my CRM?",
                                a: "The Bitlance AI Voice Agent natively integrates with HubSpot, Salesforce, and Zoho CRM. After every call, it automatically pushes the call transcript, extracted lead data, and meeting bookings directly to your CRM in real time via API."
                            },
                            {
                                q: "Can the AI voice agent handle thousands of calls simultaneously?",
                                a: "Yes. The Bitlance AI Voice Agent is designed for enterprise-scale concurrency. It can run thousands of parallel outbound campaigns or answer every inbound call simultaneously, with zero wait time for customers."
                            },
                            {
                                q: "What industries benefit most from AI voice agents?",
                                a: "AI voice agents deliver the highest ROI in real estate (lead qualification and site visit booking), insurance (policy renewal and claims intake), e-commerce (order follow-ups), and SaaS (trial-to-paid conversion calls). Any business that relies on high-volume phone outreach benefits significantly."
                            }
                        ].map((item, i) => (
                            <details key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer open:bg-white/10 transition-colors">
                                <summary className="flex items-center justify-between font-semibold text-lg text-white list-none">
                                    {item.q}
                                    <ChevronDown className="flex-shrink-0 ml-4 text-white/40 group-open:rotate-180 transition-transform" size={20} />
                                </summary>
                                <p className="mt-4 text-white/60 leading-relaxed">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </ScrollReveal>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative text-center px-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/20 blur-[100px] pointer-events-none" />

                <ScrollReveal className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to hire your new <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">superstar SDR?</span></h2>
                    <p className="text-xl text-white/60 mb-10">Stop losing leads to missed calls and slow follow-ups. See the Bitlance AI Voice Bot in action today.</p>
                    <button
                        onClick={() => navigate('/apply/real-estate')}
                        className="btn-primary inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                    >
                        Book Your Live Demo <ArrowLeft size={20} className="rotate-180" />
                    </button>
                </ScrollReveal>
            </section>

        </div>
    );
};

export default VoiceBotFeaturesPage;
