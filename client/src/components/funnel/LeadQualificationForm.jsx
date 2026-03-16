import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Activity, IndianRupee, PieChart, Users, Building, ShieldCheck, Sparkles } from 'lucide-react';

const QA_STEPS = [
    {
        id: 'industry_focus',
        question: 'What is your primary industry?',
        description: 'Select the sector that best describes your business.',
        icon: <Building className="w-5 h-5" />,
        options: ['E-commerce', 'B2B SaaS', 'Agency', 'Professional Services', 'Real Estate', 'Other']
    },
    {
        id: 'marketing_spend',
        question: 'What is your monthly marketing spend?',
        description: 'Helps us understand your scale.',
        icon: <IndianRupee className="w-5 h-5" />,
        options: ['Below ₹1L', '₹1–5L', '₹5–15L', '₹15L+']
    },
    {
        id: 'primary_bottleneck',
        question: 'What is your primary bottleneck right now?',
        description: 'What takes up the most time or is preventing growth?',
        icon: <Activity className="w-5 h-5" />,
        options: ['Lead Generation', 'Sales Conversion', 'Customer Support', 'Operations/Fulfillment']
    },
    {
        id: 'current_setup',
        question: 'What is your current tech stack?',
        description: 'Helps us evaluate automation integration possibilities.',
        icon: <PieChart className="w-5 h-5" />,
        options: ['HubSpot / Salesforce', 'GoHighLevel / ActiveCampaign', 'Zendesk / Intercom', 'Manual / Spreadsheets']
    },
    {
        id: 'decision_maker',
        question: 'Are you a decision maker at your company?',
        description: 'We require leadership presence for the audit to be actionable.',
        icon: <ShieldCheck className="w-5 h-5" />,
        options: ['Yes, I am a decision maker', 'No, taking info for my team']
    }
];

const MESSAGE_FEEDBACK = {
    // Industry
    'E-commerce': "High-growth sector! AI can drastically cut your cart abandonment.",
    'B2B SaaS': "SaaS + AI = Hyper-scale. You're in the right place.",
    'Agency': "Agencies love our automation. Let's see how much time we can save you.",
    'Professional Services': "Client management is where AI shines brightest.",
    'Real Estate': "Automated lead nurture is a game-changer for property sales.",
    'Other': "Intriguing! We love solving unique business challenges.",

    // Spend
    'Below ₹1L': "Everyone starts somewhere! Let's build your foundation.",
    '₹1–5L': "Solid momentum. AI can help you optimize every rupee spent.",
    '₹5–15L': "Impressive scale. Small optimizations will yield massive returns here.",
    '₹15L+': "Elite level. You need custom enterprise-grade automation.",

    // Bottleneck
    'Lead Generation': "Our specialty. We can help you build an 24/7 lead machine.",
    'Sales Conversion': "Fixing the leaky bucket is the fastest way to grow.",
    'Customer Support': "Imagine handling 80% of queries without a human agent.",
    'Operations/Fulfillment': "Efficiency is the backbone of profit. Let's automate the grind.",

    // Tech Stack
    'HubSpot / Salesforce': "Great foundations. Our AI integrates seamlessly with the best.",
    'GoHighLevel / ActiveCampaign': "Advanced stacks deserve advanced automation.",
    'Zendesk / Intercom': "Perfect for AI support agent deployment.",
    'Manual / Spreadsheets': "The biggest opportunity for growth! We'll save you 10+ hours a week.",

    // Decision Maker
    'Yes, I am a decision maker': "Perfect. We move fast with founders like you.",
    'No, taking info for my team': "Got it. Make sure they see the results of this audit!"
};

const LeadQualificationForm = ({ onQualify, onDisqualify }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [messageOffset, setMessageOffset] = useState({ side: 'right', initialX: 50, initialY: 0, y: 0 });

    const stepInfo = QA_STEPS[currentStep];
    const isLastStep = currentStep === QA_STEPS.length - 1;

    const handleSelectOption = (value) => {
        const newAnswers = { ...answers, [stepInfo.id]: value };
        setAnswers(newAnswers);

        // Show encouraging feedback message
        const message = MESSAGE_FEEDBACK[value] || "Great choice! Moving forward...";
        setFeedbackMessage(message);

        // Determine side and animation directions based on screen size
        const isMobile = window.innerWidth < 768; // Tailwind md breakpoint
        const randomY = isMobile ? 0 : Math.floor(Math.random() * 200) - 100;
        const startSide = Math.random() > 0.5 ? 'left' : 'right';

        setMessageOffset({
            side: isMobile ? 'top' : startSide,
            initialX: isMobile ? 0 : (startSide === 'left' ? -50 : 50),
            initialY: isMobile ? -50 : 0,
            y: randomY
        });

        // Decoupled Timing: Step changes fast (600ms)
        if (!isLastStep) {
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 600);
        } else {
            setTimeout(() => {
                submitForm(newAnswers);
            }, 600);
        }

        // Message stays longer (3s) then fades
        if (window.feedbackTimer) clearTimeout(window.feedbackTimer);
        window.feedbackTimer = setTimeout(() => {
            setFeedbackMessage('');
        }, 3000);
    };

    const submitForm = (finalAnswers) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const spend = finalAnswers.marketing_spend;
            const decisionMaker = finalAnswers.decision_maker;

            if (spend === 'Below ₹1L' || decisionMaker === 'No, taking info for my team') {
                onDisqualify();
            } else {
                onQualify(finalAnswers);
            }
        }, 1200);
    };


    return (
        <div className="w-full relative">
            {/* Fixed Feedback Portal */}
            <div className={`fixed z-[1000] flex pointer-events-none transition-all duration-500 w-full md:w-max px-4 md:px-0
                ${messageOffset.side === 'top'
                    ? 'top-4 left-0 right-0 max-w-[400px] mx-auto'
                    : `top-1/2 -translate-y-1/2 ${messageOffset.side === 'left' ? 'left-4 lg:left-24' : 'right-4 lg:right-24'}`
                }`}>
                <AnimatePresence mode="wait">
                    {feedbackMessage && (
                        <motion.div
                            key={feedbackMessage}
                            initial={{ opacity: 0, x: messageOffset.initialX, y: messageOffset.initialY, scale: messageOffset.side === 'top' ? 0.95 : 0.8 }}
                            animate={{ opacity: 1, x: 0, y: messageOffset.y, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, filter: "blur(2px)", y: messageOffset.side === 'top' ? -20 : messageOffset.y }}
                            transition={{ type: "spring", damping: 20, stiffness: 150, mass: 0.8 }}
                            className={`pointer-events-auto w-full flex ${messageOffset.side === 'left' ? 'justify-start' : 'justify-end md:justify-start'}`}
                        >
                            <div className={`flex items-start gap-3 w-full md:max-w-sm drop-shadow-2xl
                                ${messageOffset.side === 'top'
                                    ? 'bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/50'
                                    : 'flex-row items-end gap-2'
                                }`}
                            >
                                <div className={`flex-shrink-0 flex items-center justify-center
                                    ${messageOffset.side === 'top'
                                        ? 'w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                                        : 'w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg text-white'
                                    }`}
                                >
                                    <Sparkles className={messageOffset.side === 'top' ? 'w-5 h-5' : 'w-4 h-4 animate-pulse'} />
                                </div>
                                <div className={`${messageOffset.side === 'top'
                                    ? 'flex-1 pt-0.5'
                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-5 py-3 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700/50 shadow-md'
                                    }`}
                                >
                                    {messageOffset.side === 'top' && (
                                        <span className="block text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1">Audit Insight</span>
                                    )}
                                    <p className={`font-medium ${messageOffset.side === 'top' ? 'text-sm text-slate-700 dark:text-slate-200 leading-snug' : 'text-[15px] leading-relaxed'}`}>
                                        {feedbackMessage}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span>Step {currentStep + 1} of {QA_STEPS.length}</span>
                    <span>{Math.round(((currentStep) / QA_STEPS.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-2 bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 ease-out"
                        style={{ width: `${((currentStep) / QA_STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Responses...</h3>
                    <p className="text-slate-500">Checking eligibility for the AI Audit</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
                                {stepInfo.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{stepInfo.question}</h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 ml-11">{stepInfo.description}</p>
                    </div>

                    <div className="relative min-h-[300px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {stepInfo.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectOption(option)}
                                        className={`p-4 text-left rounded-xl border-2 transition-all duration-200 ${answers[stepInfo.id] === option
                                            ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 shadow-md scale-[1.02]'
                                            : 'border-slate-100 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                            }`}
                                    >
                                        <span className="block font-medium">{option}</span>
                                    </button>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {currentStep > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                            >
                                ← Back to previous question
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeadQualificationForm;
