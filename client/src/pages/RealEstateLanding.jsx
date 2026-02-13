import React, { useState, useEffect } from 'react';
import HeroSection from '../components/real-estate/HeroSection';
import ProblemSection from '../components/real-estate/ProblemSection';
import SolutionSection from '../components/real-estate/SolutionSection';
import WebDevSection from '../components/real-estate/WebDevSection';
import HowItWorksSection from '../components/real-estate/HowItWorksSection';
import TestimonialsSection from '../components/real-estate/TestimonialsSection';
import ResultsSection from '../components/real-estate/ResultsSection';
import FinalCtaSection from '../components/real-estate/FinalCtaSection';
import Footer from '../components/real-estate/Footer';
import BookingModal from '../components/real-estate/BookingModal';
import ChatbotWidget from '../components/real-estate/ChatbotWidget';
import { ArrowRight } from 'lucide-react';

const RealEstateLanding = () => {
    const [showStickyCta, setShowStickyCta] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 600) {
                setShowStickyCta(true);
            } else {
                setShowStickyCta(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="font-sans antialiased text-slate-900 bg-white">

            <HeroSection onBookDemo={() => setIsBookingModalOpen(true)} />
            <ProblemSection />
            <SolutionSection />
            <WebDevSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <ResultsSection />
            <FinalCtaSection onBookDemo={() => setIsBookingModalOpen(true)} />
            <Footer />

            {/* Mobile Sticky CTA */}
            <div className={`fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-lg transform transition-transform duration-300 z-50 md:hidden ${showStickyCta ? 'translate-y-0' : 'translate-y-full'}`}>
                <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full py-3 rounded-full bg-re-blue text-re-navy font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                    Book a Demo <ArrowRight size={18} />
                </button>
            </div>

            <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
            <ChatbotWidget />
        </div>
    );
};

export default RealEstateLanding;
