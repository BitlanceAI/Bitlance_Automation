import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import BookingModal from '../components/real-estate/BookingModal';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import SolutionSection from '../components/landing/SolutionSection';
import UseCasesSection from '../components/landing/UseCasesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import PricingSection from '../components/landing/PricingSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';

const LandingPage = () => {
    const { user, loading } = useAuth();
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // Redirect if logged in
    if (loading) return null;
    if (user) return <Navigate to="/home" replace />;

    const handleOpenBooking = () => {
        setIsBookingModalOpen(true);
    };

    return (
        <div className="font-sans text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900 transition-colors duration-300">
            <HeroSection onOpenBooking={handleOpenBooking} />
            <ProblemSection />
            <SolutionSection />
            <UseCasesSection />
            <HowItWorksSection />
            <SocialProofSection />
            <PricingSection />
            <FinalCtaSection onOpenBooking={handleOpenBooking} />

            <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
        </div>
    );
};

export default LandingPage;
