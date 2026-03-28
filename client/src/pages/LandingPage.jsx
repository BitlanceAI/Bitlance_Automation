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
import LatestBlogsSection from '../components/landing/LatestBlogsSection';
import BlogAgentSection from '../components/landing/BlogAgentSection';
import WhyBitlanceSection from '../components/landing/WhyBitlanceSection';
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
        <div className="relative min-h-screen w-full overflow-hidden bg-[#030303] text-white">
            <SEOHead
                title="Bitlance Automation | AI Voice Bots & Business Automation"
                description="Deploy autonomous AI agents, intelligent Voice Bots, and data-driven automation tools to capture leads, book appointments, and scale your business effortlessly."
                canonicalUrl="https://www.bitlancetechhub.com/"
            />
            {/* Background Gradients & Shapes */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl pointer-events-none" />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-indigo-500/[0.15]"
                    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
                />
                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-rose-500/[0.15]"
                    className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
                />
                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-violet-500/[0.15]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
                />
                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="from-amber-500/[0.15]"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                />
                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="from-cyan-500/[0.15]"
                    className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
                />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10">
                <HeroSection onOpenBooking={handleOpenBooking} />

                <ProblemSection />
                <WhyBitlanceSection />
                <TestimonialsSection />
                <VoiceBotSection onOpenBooking={handleOpenBooking} />
                <BlogAgentSection onOpenBooking={handleOpenBooking} />
                <UseCasesSection />
                <HowItWorksSection />
                <SocialProofSection />
                <FinalCtaSection onOpenBooking={handleOpenBooking} />
                <LatestBlogsSection />
                <Footer />
            </div>

            <ScrollToTopButton />
            <LoginReminderPopup chatbotOpen={isChatbotOpen} />
            <BitlanceChatbot isOpen={isChatbotOpen} onToggle={setIsChatbotOpen} />
            

        </div>
    );
};

export default LandingPage;
