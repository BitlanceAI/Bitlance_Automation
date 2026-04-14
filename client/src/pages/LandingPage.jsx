import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import VoiceBotSection from '../components/landing/VoiceBotSection';
import UseCasesSection from '../components/landing/UseCasesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import BlogAgentSection from '../components/landing/BlogAgentSection';
import WhyBitlanceSection from '../components/landing/WhyBitlanceSection';
import AgentPricingSection from '../components/landing/AgentPricingSection';
import Footer from '../components/landing/Footer';
import ScrollToTopButton from '../components/ui/ScrollToTopButton';

import { ElegantShape } from '../components/ui/shape-landing-hero';
import SEOHead from '../components/layout/SEOHead';
import LoginReminderPopup from '../components/ui/LoginReminderPopup';
import BitlanceChatbot from '../components/ui/BitlanceChatbot';

const LandingPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Capture ad redirect params (name, email, phone, UTMs) and persist to localStorage
    // so they're available when the user navigates to /apply/audit later
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const hasTrackingParam = ['name', 'fn', 'email', 'phone', 'phoneno', 'ph',
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'
        ].some(k => params.has(k));

        if (hasTrackingParam) {
            // Save contact prefill data
            const contact = {
                name: params.get('name') || params.get('fn') || '',
                email: params.get('email') || '',
                phone: params.get('phone') || params.get('phoneno') || params.get('ph') || '',
            };
            localStorage.setItem('adPrefillData', JSON.stringify(contact));

            // Save UTM data
            const utm = {
                utmSource: params.get('utm_source') || '',
                utmMedium: params.get('utm_medium') || '',
                utmCampaign: params.get('utm_campaign') || '',
                utmContent: params.get('utm_content') || '',
                utmTerm: params.get('utm_term') || '',
                fbclid: params.get('fbclid') || '',
                referrer: document.referrer || 'Direct',
            };
            localStorage.setItem('utmData', JSON.stringify(utm));

            console.log('[Landing] Ad params saved:', { contact, utm });
        } else if (!localStorage.getItem('utmData')) {
            // Fallback: at least save the referrer
            localStorage.setItem('utmData', JSON.stringify({ referrer: document.referrer || 'Direct' }));
        }
    }, [location.search]);

    // Redirect if logged in
    if (loading) return null;
    if (user) return <Navigate to="/home" replace />;

    const handleOpenBooking = () => {
        navigate('/apply');
    };

    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#070707] text-white">
            <SEOHead
                title="AI Voice Bot & WhatsApp Chatbot for Indian Businesses | Bitlance"
                description="Bitlance deploys AI Voice Agents and WhatsApp Chatbots that respond to leads in 0.4 seconds, qualify enquiries, and book appointments 24/7. Used by real estate, clinics & agencies across India."
                canonicalUrl="https://www.bitlancetechhub.com/"
                keywords="AI voice bot India, WhatsApp chatbot for business, AI lead generation, voice agent real estate, chatbot for clinics, AI appointment booking, business automation India"
                ogImage="https://www.bitlancetechhub.com/og-image.jpg"
                structuredData={{
                    "@context": "https://schema.org",
                    "@graph": [
                        {
                            "@type": "Organization",
                            "@id": "https://www.bitlancetechhub.com/#organization",
                            "name": "Bitlance Tech Hub",
                            "url": "https://www.bitlancetechhub.com",
                            "logo": "https://www.bitlancetechhub.com/logo/logo (1).jpg",
                            "description": "Bitlance builds autonomous AI agents — Voice Bots, WhatsApp Chatbots, and SEO AI Agents — that capture, qualify, and follow up with leads automatically.",
                            "foundingLocation": "India",
                            "sameAs": ["https://twitter.com/bitlancetechhub"]
                        },
                        {
                            "@type": "WebSite",
                            "@id": "https://www.bitlancetechhub.com/#website",
                            "url": "https://www.bitlancetechhub.com",
                            "name": "Bitlance Tech Hub",
                            "publisher": { "@id": "https://www.bitlancetechhub.com/#organization" }
                        },
                        {
                            "@type": "Service",
                            "name": "AI Voice Agent",
                            "provider": { "@id": "https://www.bitlancetechhub.com/#organization" },
                            "description": "24/7 AI voice bot that answers inbound calls, qualifies leads, and books appointments automatically. Never miss a call during peak hours.",
                            "areaServed": "IN",
                            "serviceType": "AI Business Automation"
                        },
                        {
                            "@type": "Service",
                            "name": "WhatsApp AI Chatbot",
                            "provider": { "@id": "https://www.bitlancetechhub.com/#organization" },
                            "description": "AI-powered WhatsApp chatbot that responds to enquiries in 0.4 seconds, captures leads, shares brochures, and books appointments automatically.",
                            "areaServed": "IN",
                            "serviceType": "AI Business Automation"
                        },
                        {
                            "@type": "Service",
                            "name": "SEO AI Agent",
                            "provider": { "@id": "https://www.bitlancetechhub.com/#organization" },
                            "description": "Automated SEO content generation and publishing pipeline. Researches trending topics, writes articles, checks plagiarism, and publishes to WordPress automatically.",
                            "areaServed": "IN",
                            "serviceType": "SEO Automation"
                        },
                        {
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "How fast does the AI voice bot respond to leads?",
                                    "acceptedAnswer": { "@type": "Answer", "text": "Bitlance AI agents respond to new leads in under 0.4 seconds, 24 hours a day, 7 days a week — including weekends and holidays." }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Which businesses can use Bitlance AI agents?",
                                    "acceptedAnswer": { "@type": "Answer", "text": "Bitlance works best for real estate agencies, clinics, local service businesses, education institutes, and agencies in India that receive daily enquiries and want to automate lead follow-up." }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Does the AI voice agent work in Hindi?",
                                    "acceptedAnswer": { "@type": "Answer", "text": "Yes. Bitlance AI voice agents support multiple Indian languages including Hindi, Marathi, and English, and can be configured to match your customer base." }
                                },
                                {
                                    "@type": "Question",
                                    "name": "How much does the AI voice bot cost in India?",
                                    "acceptedAnswer": { "@type": "Answer", "text": "Bitlance Voice Agent plans start at ₹11,999 per month. Growth plans with inbound and outbound calling start at ₹24,999 per month. Enterprise pricing is available on request." }
                                }
                            ]
                        }
                    ]
                }}
            />
            {/* Global ambient glows — support glassmorphism across all sections */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                {/* Teal core glow */}
                <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] rounded-full blur-[180px]"
                    style={{ background: 'rgba(38,206,206,0.06)' }} />
                {/* Purple accent */}
                <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] rounded-full blur-[160px]"
                    style={{ background: 'rgba(139,92,246,0.05)' }} />
                {/* Rose accent bottom */}
                <div className="absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full blur-[140px]"
                    style={{ background: 'rgba(236,72,153,0.04)' }} />
                {/* Subtle dot grid */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{ backgroundImage: 'radial-gradient(circle, #26CECE 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-cyan-500/[0.08]"
                    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
                />
                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-violet-500/[0.07]"
                    className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
                />
                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-violet-500/[0.06]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
                />
                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="from-cyan-500/[0.08]"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10">
                <HeroSection onOpenBooking={handleOpenBooking} />

                <ProblemSection />
                <WhyBitlanceSection />
                <TestimonialsSection />
                
                <BlogAgentSection onOpenBooking={handleOpenBooking} />
                <VoiceBotSection onOpenBooking={handleOpenBooking} />
                <UseCasesSection />
                <HowItWorksSection />
                <SocialProofSection />
                {/* <AgentPricingSection /> */}
                <FinalCtaSection onOpenBooking={handleOpenBooking} />
                <Footer />
            </div>

            <ScrollToTopButton />
            <LoginReminderPopup chatbotOpen={isChatbotOpen} />
            <BitlanceChatbot isOpen={isChatbotOpen} onToggle={setIsChatbotOpen} />
            

        </div>
    );
};

export default LandingPage;
