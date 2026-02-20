import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, XCircle, CheckCircle2, ChevronRight, ArrowRight, Building2, TrendingUp, Users } from 'lucide-react';
import LeadQualificationForm from '../../components/funnel/LeadQualificationForm';
import DisqualifiedView from '../../components/funnel/DisqualifiedView';
import CalendarBookingView from '../../components/funnel/CalendarBookingView';

const RealEstateLeadGen = () => {
    // view state: 'form', 'qualified', 'disqualified', 'success'
    const [view, setView] = useState('form');
    const [leadData, setLeadData] = useState(null);

    const handleQualify = (data) => {
        setLeadData(data);
        setView('qualified');
    };

    const handleDisqualify = () => {
        setView('disqualified');
    };

    const handleBookingSuccess = () => {
        setView('success');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">

            <div className="max-w-3xl mx-auto w-full">

                {/* Header Section */}
                {view !== 'success' && (
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span>Exclusive Real Estate Program</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                            Apply for an <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-500">AI Growth Audit</span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            We help ambitious real estate builders scale with AI-driven lead qualification and automated nurture systems. See if you qualify below.
                        </p>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden border border-slate-100 dark:border-slate-700/50 relative">

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
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {view === 'form' && (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-500 mt-6 flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        Only serious builders move ahead.
                    </p>
                )}
            </div>
        </div>
    );
};

export default RealEstateLeadGen;
