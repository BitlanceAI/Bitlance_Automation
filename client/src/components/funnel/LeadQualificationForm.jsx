import React, { useState } from 'react';
import { ArrowRight, Activity, IndianRupee, PieChart, Users, Building, ShieldCheck } from 'lucide-react';

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

const LeadQualificationForm = ({ onQualify, onDisqualify }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);

    const stepInfo = QA_STEPS[currentStep];
    const isLastStep = currentStep === QA_STEPS.length - 1;

    const handleSelectOption = (value) => {
        const newAnswers = { ...answers, [stepInfo.id]: value };
        setAnswers(newAnswers);

        if (!isLastStep) {
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 300); // Small delay for visual feedback
        } else {
            submitForm(newAnswers);
        }
    };

    const submitForm = (finalAnswers) => {
        setLoading(true);
        // Qualification Logic Hook
        setTimeout(() => {
            setLoading(false);
            const spend = finalAnswers.marketing_spend;
            const decisionMaker = finalAnswers.decision_maker;

            // Disqualify if Spend < 1L OR Not a decision maker
            if (spend === 'Below ₹1L' || decisionMaker === 'No, taking info for my team') {
                onDisqualify();
            } else {
                onQualify(finalAnswers);
            }
        }, 1200); // Simulate processing time for effect
    };


    return (
        <div className="w-full">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stepInfo.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelectOption(option)}
                                className={`p-4 text-left rounded-xl border-2 transition-all duration-200 ${answers[stepInfo.id] === option
                                    ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 shadow-md'
                                    : 'border-slate-100 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                                    }`}
                            >
                                <span className="block font-medium">{option}</span>
                            </button>
                        ))}
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
