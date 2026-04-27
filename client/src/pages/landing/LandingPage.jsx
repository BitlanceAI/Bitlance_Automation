import { useState, useEffect, lazy, Suspense } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HeroSection from '../../components/landing/HeroSection';
import ProblemSection from '../../components/landing/ProblemSection';

const VoiceBotSection = lazy(() => import('../../components/landing/VoiceBotSection'));
const UseCasesSection = lazy(() => import('../../components/landing/UseCasesSection'));
const HowItWorksSection = lazy(() => import('../../components/landing/HowItWorksSection'));
const SocialProofSection = lazy(() => import('../../components/landing/SocialProofSection'));
const TestimonialsSection = lazy(() => import('../../components/landing/TestimonialsSection'));
const FinalCtaSection = lazy(() => import('../../components/landing/FinalCtaSection'));
const BlogAgentSection = lazy(() => import('../../components/landing/BlogAgentSection'));
const WhyBitlanceSection = lazy(() => import('../../components/landing/WhyBitlanceSection'));
const AgentPricingSection = lazy(() => import('../../components/landing/AgentPricingSection'));
const Footer = lazy(() => import('../../components/landing/Footer'));
const ScrollToTopButton = lazy(() => import('../../components/ui/ScrollToTopButton'));
const LoginReminderPopup = lazy(() => import('../../components/ui/LoginReminderPopup'));

import { ElegantShape } from '../../components/ui/shape-landing-hero';
import SEOHead from '../../components/layout/SEOHead';
// import BitlanceChatbot from '../../components/ui/BitlanceChatbot';

const WA_NUMBER = "917030951331";
const WA_MESSAGE = "Hi Bitlance! 👋 I'd like to know more about your AI automation services.";

const whatsappStyles = `
.wa-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #25D366;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.28);
  cursor: pointer;
  border: none;
  padding: 0;
  transition: transform 0.2s, box-shadow 0.2s;
}
.wa-btn:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(0,0,0,0.38); }
`;

const WhatsAppButton = () => {
    const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;

    return (
        <>
            <style>{whatsappStyles}</style>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-btn"
                aria-label="Chat on WhatsApp"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="30" height="30">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            </a>
        </>
    );
};

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



    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white text-black">
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
            <main className="relative z-10">
                <HeroSection onOpenBooking={handleOpenBooking} />
                <ProblemSection />
                
                <Suspense fallback={<div className="h-40" />}>
                    <WhyBitlanceSection />
                    <TestimonialsSection />
                    <BlogAgentSection onOpenBooking={handleOpenBooking} />
                    <VoiceBotSection onOpenBooking={handleOpenBooking} />
                    <UseCasesSection />
                    <HowItWorksSection />
                    <SocialProofSection />
                    <FinalCtaSection onOpenBooking={handleOpenBooking} />
                    <Footer />
                </Suspense>
            </main>

            <Suspense fallback={null}>
                <ScrollToTopButton />
                <LoginReminderPopup chatbotOpen={false} />
            </Suspense>
            <WhatsAppButton />
            

        </div>
    );
};

export default LandingPage;
