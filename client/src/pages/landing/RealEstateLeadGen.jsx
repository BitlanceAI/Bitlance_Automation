import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, XCircle, CheckCircle2, ChevronRight, ArrowRight, Building2, TrendingUp, Users, Home } from 'lucide-react';
import LeadQualificationForm from '../../components/funnel/LeadQualificationForm';
import DisqualifiedView from '../../components/funnel/DisqualifiedView';
import CalendarBookingView from '../../components/funnel/CalendarBookingView';
import { trackLeadQualified, trackLeadDisqualified, trackBookingSuccess } from '../../lib/analytics';
import SEOHead from '../../components/layout/SEOHead';

const RealEstateLeadGen = () => {
    const [view, setView] = useState('form');
    const [leadData, setLeadData] = useState(null);
    const navigate = useNavigate();

    // Redirect to home after success
    React.useEffect(() => {
        if (view === 'success') {
            const timer = setTimeout(() => {
                navigate('/');
            }, 8000); // 8 seconds to read success info
            return () => clearTimeout(timer);
        }
    }, [view, navigate]);

    const handleQualify = (data) => {
        setLeadData(data);
        setView('qualified');
        trackLeadQualified();
    };

    const handleDisqualify = () => {
        setView('disqualified');
        trackLeadDisqualified();
    };

    const handleBookingSuccess = () => {
        setView('success');
        trackBookingSuccess();
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-50 flex flex-col justify-center py-6 md:py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <SEOHead
                title="AI Growth Audit for B2B Founders | Bitlance"
                description="Apply for an exclusive AI Growth Audit. We help ambitious B2B founders scale with AI-driven lead qualification and automated nurture systems."
                canonicalUrl="https://www.bitlancetechhub.com/apply/audit"
            />
            <div className="max-w-[1100px] mx-auto w-full">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Left Column - Desktop only */}
                    {view !== 'success' && (
                        <div className="hidden lg:block text-left space-y-6">
                            <div>
                                <h1 className="text-4xl lg:text-[2.75rem] font-black tracking-tight mb-4 text-white leading-[1.1]">
                                    Stop Losing <br />
                                    <span className="text-indigo-400">High-Intent</span> Leads <br />
                                    Every Week.
                                </h1>
                                <p className="text-lg text-slate-300 max-w-lg">
                                    Turn Ad Clicks into Qualified, Booked Sales Calls — Automatically.
                                </p>
                            </div>

                            {/* Benefits Checklist */}
                            <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 lg:p-6 mt-4 shadow-2xl">
                                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    What you actually get:
                                </h3>
                                <ul className="space-y-3">
                                    {[
                                        'Automated 24/7 Follow-Ups',
                                        'Qualified Leads Only',
                                        'Zero Manual Tracking',
                                        'Calendar Filled With Sales Calls'
                                    ].map((benefit, idx) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                            </div>
                                            <span className="text-sm text-slate-300 font-medium">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Mobile-only headline — shown above the form card */}
                    {view !== 'success' && (
                        <div className="lg:hidden text-center pt-2 pb-1">
                            <h1 className="text-3xl font-black tracking-tight text-white leading-[1.15]">
                                Stop Losing{' '}
                                <span className="text-indigo-400">High-Intent</span>{' '}
                                Leads Every Week.
                            </h1>
                        </div>
                    )}

                    {/* Right Column - Form */}
                    <div className="bg-[#151515]/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative">

                        <AnimatePresence mode="wait">

                            {view === 'form' && (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-8 md:p-12"
                                >
                                    <LeadQualificationForm onQualify={handleQualify} onDisqualify={handleDisqualify} />
                                </motion.div>
                            )}

                            {view === 'disqualified' && (
                                <motion.div
                                    key="disqualified"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <DisqualifiedView />
                                </motion.div>
                            )}

                            {view === 'qualified' && (
                                <motion.div
                                    key="qualified"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CalendarBookingView leadData={leadData} onSuccess={handleBookingSuccess} />
                                </motion.div>
                            )}

                            {view === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", duration: 0.6 }}
                                    className="p-12 text-center"
                                >
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-4">Audit Confirmed!</h2>
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                                        Your AI Audit is blocked on our calendar. We've sent a confirmation email and a WhatsApp message to {leadData?.whatsapp}.
                                    </p>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-left border border-slate-100 dark:border-slate-700">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                                            <ArrowRight className="w-4 h-4 text-violet-500" />
                                            Next Steps
                                        </h3>
                                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                            <li>1. Check your WhatsApp for the calendar invite.</li>
                                            <li>2. Look out for our case study PDF arriving tomorrow.</li>
                                            <li>3. Bring your current lead cost metrics to the call.</li>
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => navigate('/')}
                                        className="mt-8 flex items-center justify-center gap-2 text-violet-600 dark:text-violet-400 font-bold hover:gap-3 transition-all mx-auto"
                                    >
                                        <Home className="w-4 h-4" />
                                        <span>Return to Home</span>
                                    </button>

                                    <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest">Redirecting in 8 seconds...</p>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div> {/* End Grid */}

                {view === 'form' && (
                    <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-2">
                        <Users className="w-3 h-3" />
                        Only serious builders move ahead.
                    </p>
                )}
            </div>
        </div>
    );
};

export default RealEstateLeadGen;
