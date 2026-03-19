import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, IndianRupee, PieChart, Building, ShieldCheck, User, Mail, Phone, Loader2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config.js';

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

const OPTION_EMOJIS = {
    'E-commerce': ['🛍️', 'WOW!', '🎯', '✨', 'Nice!'],
    'B2B SaaS': ['🚀', 'LFG!', '⚡', '🌟', 'Epic!'],
    'Agency': ['🤝', 'YES!', '🏆', '✨', 'Solid!'],
    'Professional Services': ['💼', 'Smart!', '📊', '✨', 'Pro!'],
    'Real Estate': ['🏠', 'WOW!', '🔑', '✨', 'Nice!'],
    'Other': ['✨', 'Ooh!', '💡', '🌟', 'Cool!'],
    'Below ₹1L': ['🌱', 'Start!', '🌿', '📊', 'Go!'],
    '₹1–5L': ['📈', 'Nice!', '💹', '⬆️', 'Up!'],
    '₹5–15L': ['🔥', 'HOT!', '🔥', '💰', 'Fire!'],
    '₹15L+': ['💰', 'WOW!', '🏆', '👑', 'Elite!'],
    'Lead Generation': ['🧲', 'LFG!', '🎯', '⚡', "Let's Go!"],
    'Sales Conversion': ['⚡', 'YES!', '💰', '🔥', 'Win!'],
    'Customer Support': ['🎧', 'Nice!', '🤖', '💬', 'Smart!'],
    'Operations/Fulfillment': ['⚙️', 'Wise!', '🔧', '⚡', 'Solid!'],
    'HubSpot / Salesforce': ['🏢', 'Nice!', '📊', '✅', 'Pro!'],
    'GoHighLevel / ActiveCampaign': ['🎯', 'Fire!', '🔥', '🚀', 'LFG!'],
    'Zendesk / Intercom': ['💬', 'Smart!', '🤖', '✨', 'Cool!'],
    'Manual / Spreadsheets': ['📋', 'WOW!', '📊', '⚡', 'Big!'],
    'Yes, I am a decision maker': ['👑', 'YES!', '🚀', '🌟', 'Boss!'],
    'No, taking info for my team': ['📝', 'Sure!', '📋', '✅', 'OK!'],
};

const OPTION_FEEDBACK = {
    'E-commerce': 'High-growth sector! AI can drastically cut your cart abandonment.',
    'B2B SaaS': "SaaS + AI = Hyper-scale. You're in the right place.",
    'Agency': "Agencies love our automation. Let's see how much time we can save you.",
    'Professional Services': 'Client management is where AI shines brightest.',
    'Real Estate': 'Automated lead nurture is a game-changer for property sales.',
    'Other': 'Intriguing! We love solving unique business challenges.',
    'Below ₹1L': "Everyone starts somewhere! Let's build your foundation.",
    '₹1–5L': 'Solid momentum. AI can help you optimize every rupee spent.',
    '₹5–15L': 'Impressive scale. Small optimizations will yield massive returns here.',
    '₹15L+': 'Elite level. You need custom enterprise-grade automation.',
    'Lead Generation': 'Our specialty. We can help you build a 24/7 lead machine.',
    'Sales Conversion': 'Fixing the leaky bucket is the fastest way to grow.',
    'Customer Support': 'Imagine handling 80% of queries without a human agent.',
    'Operations/Fulfillment': "Efficiency is the backbone of profit. Let's automate the grind.",
    'HubSpot / Salesforce': 'Great foundations. Our AI integrates seamlessly with the best.',
    'GoHighLevel / ActiveCampaign': 'Advanced stacks deserve advanced automation.',
    'Zendesk / Intercom': 'Perfect for AI support agent deployment.',
    'Manual / Spreadsheets': "The biggest opportunity for growth! We'll save you 10+ hours a week.",
    'Yes, I am a decision maker': 'Perfect. We move fast with founders like you.',
    'No, taking info for my team': "Got it. Make sure they see the results of this audit!",
};

/* ─── Detect if a string is a text sticker (not an emoji) ─── */
const isTextSticker = (s) => /[a-zA-Z!]/.test(s);

/* ─── Portal-rendered floating emoji / sticker particles ─── */
function EmojiParticles({ particles }) {
    return createPortal(
        <AnimatePresence>
            {particles.map(p => {
                const sticker = isTextSticker(p.emoji);
                return (
                    <motion.div
                        key={p.id}
                        initial={{
                            opacity: 1,
                            scale: sticker ? 0.4 : p.initialScale,
                            y: 0,
                            x: 0,
                            rotate: p.initialRotate,
                        }}
                        animate={{
                            opacity: [1, 1, 0],
                            scale: sticker
                                ? [0.4, 1.1, 1.0]
                                : [p.initialScale, p.peakScale, p.peakScale * 0.9],
                            y: -p.rise,
                            x: p.dx,
                            rotate: p.finalRotate,
                        }}
                        transition={{
                            duration: p.duration,
                            ease: [0.22, 1, 0.36, 1],
                            delay: p.delay,
                            opacity: { times: [0, 0.6, 1], duration: p.duration, delay: p.delay },
                        }}
                        style={{
                            position: 'fixed',
                            left: p.x,
                            top: p.y,
                            zIndex: 99999,
                            pointerEvents: 'none',
                            userSelect: 'none',
                            transformOrigin: 'center center',
                            marginLeft: sticker ? '-2em' : '-0.5em',
                            marginTop: '-0.5em',
                            ...(sticker ? {
                                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                                color: '#fff',
                                fontSize: '0.82rem',
                                fontWeight: 900,
                                letterSpacing: '0.02em',
                                borderRadius: '10px',
                                padding: '5px 11px',
                                boxShadow: '0 4px 16px rgba(245,158,11,0.5), 0 0 0 2px rgba(255,255,255,0.25)',
                                whiteSpace: 'nowrap',
                                lineHeight: 1.4,
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            } : {
                                fontSize: p.size,
                                lineHeight: 1,
                            }),
                        }}
                    >
                        {p.emoji}
                    </motion.div>
                );
            })}
        </AnimatePresence>,
        document.body
    );
}

/* ─── Portal-rendered toast notification ─── */
function ToastPortal({ toast }) {
    return createPortal(
        <AnimatePresence>
            {toast && (
                <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, y: -28, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.94 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 340, mass: 0.7 }}
                    style={{
                        position: 'fixed',
                        top: 20,
                        left: '50%',
                        x: '-50%',
                        zIndex: 99998,
                        pointerEvents: 'none',
                        maxWidth: '90vw',
                    }}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 100%)',
                        border: '1px solid rgba(99,102,241,0.4)',
                        borderRadius: '999px',
                        padding: '1px',
                        boxShadow: '0 0 24px rgba(99,102,241,0.3), 0 8px 32px rgba(0,0,0,0.4)',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'rgba(13,13,26,0.97)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '999px',
                            padding: '10px 20px 10px 14px',
                            whiteSpace: 'nowrap',
                        }}>
                            <motion.div
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                    flexShrink: 0,
                                    boxShadow: '0 0 6px rgba(99,102,241,0.8)',
                                }}
                            />
                            <span style={{
                                color: '#e2e8f0',
                                fontSize: '0.845rem',
                                fontWeight: 500,
                                letterSpacing: '0.01em',
                                lineHeight: 1.4,
                            }}>
                                {toast.text}
                            </span>
                        </div>
                    </div>
                    <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 5.0, ease: 'linear' }}
                        style={{
                            height: 2,
                            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                            borderRadius: '0 0 4px 4px',
                            originX: 0,
                            marginTop: 3,
                            width: '80%',
                            marginLeft: '10%',
                            opacity: 0.6,
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

/* ─── Contact Info Step ─── */
function ContactInfoStep({ prefillData, onSubmit, onDownload, loading }) {
    const [form, setForm] = useState({
        name: prefillData?.name || '',
        email: prefillData?.email || '',
        phone: prefillData?.phone || '',
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email is required';
        if (!form.phone.trim()) e.phone = 'Phone number is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const inputClass = (field) =>
        `w-full bg-[#121212] border ${errors[field] ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-600`;

    return (
        <div className="p-6 md:p-8">
            <div className="mb-6">
                <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Almost There</span>
                <h2 className="text-2xl font-extrabold text-white leading-tight mt-1 mb-1">
                    Where should we send your audit results?
                </h2>
                <p className="text-sm text-slate-400">Your info is kept private. No spam, ever.</p>
            </div>

            <div className="space-y-4">
                {/* Name */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <input
                        type="text"
                        placeholder="Jane Doe"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        className={inputClass('name')}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Work Email
                    </label>
                    <input
                        type="email"
                        placeholder="jane@company.com"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        className={inputClass('email')}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Phone / WhatsApp
                    </label>
                    <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        className={inputClass('phone')}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Book CTA */}
                <button
                    onClick={() => { if (validate()) onSubmit(form, 'book'); }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold transition-all mt-2 shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)]"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Book My Free AI Audit →'}
                </button>

                {/* Download CTA */}
                <button
                    onClick={() => { if (validate()) onDownload(form); }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-50 mt-1 py-2"
                >
                    <Download className="w-4 h-4" />
                    Just download the Blueprint PDF instead
                </button>

                <p className="text-center text-[11px] text-slate-600 mt-2">
                    🔒 Your information is 100% secure. No spam ever.
                </p>
            </div>
        </div>
    );
}

/* ─── Main Form Component ─── */
const LeadQualificationForm = ({ onQualify, onDisqualify, prefillData }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [particles, setParticles] = useState([]);
    const [toast, setToast] = useState(null);
    const toastTimerRef = useRef(null);
    const particleTimerRef = useRef(null);

    const totalSteps = QA_STEPS.length + 1; // +1 for contact step
    const isContactStep = currentStep === QA_STEPS.length;
    const stepInfo = !isContactStep ? QA_STEPS[currentStep] : null;
    const isLastQAStep = currentStep === QA_STEPS.length - 1;

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            if (particleTimerRef.current) clearTimeout(particleTimerRef.current);
        };
    }, []);

    const handleSelectOption = useCallback((value, e) => {
        const newAnswers = { ...answers, [stepInfo.id]: value };
        setAnswers(newAnswers);

        const clickX = e?.clientX ?? window.innerWidth / 2;
        const clickY = e?.clientY ?? window.innerHeight / 2;
        const emojiSet = OPTION_EMOJIS[value] ?? ['✨', '🌟', '✨', '⚡'];

        const newParticles = emojiSet.map((emoji, i) => ({
            id: Date.now() + i,
            emoji,
            x: clickX,
            y: clickY,
            dx: (Math.random() - 0.5) * 120,
            rise: 130 + Math.random() * 80,
            initialScale: 0.5 + Math.random() * 0.4,
            peakScale: 1.4 + Math.random() * 1.0,
            size: `${1.3 + Math.random() * 0.8}rem`,
            initialRotate: (Math.random() - 0.5) * 20,
            finalRotate: (Math.random() - 0.5) * 40,
            duration: 0.85 + Math.random() * 0.4,
            delay: i * 0.06,
        }));
        setParticles(prev => [...prev, ...newParticles]);

        if (particleTimerRef.current) clearTimeout(particleTimerRef.current);
        particleTimerRef.current = setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
        }, 1400);

        const text = OPTION_FEEDBACK[value] ?? 'Great choice! Moving forward...';
        setToast({ id: Date.now(), text });

        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 5000);

        // Advance step: check disqualification on last QA step, else progress
        setTimeout(() => {
            if (isLastQAStep) {
                const spend = newAnswers.marketing_spend;
                const decisionMaker = newAnswers.decision_maker;
                if (spend === 'Below ₹1L' || decisionMaker === 'No, taking info for my team') {
                    onDisqualify();
                } else {
                    setCurrentStep(QA_STEPS.length); // go to contact step
                }
            } else {
                setCurrentStep(prev => prev + 1);
            }
        }, 650);
    }, [answers, isLastQAStep, stepInfo, onDisqualify]);

    const navigate = useNavigate();

    // ─── Save lead to DB and qualify ───
    const handleContactSubmit = async (contactData, action) => {
        setLoading(true);
        try {
            const storedUtm = JSON.parse(localStorage.getItem('utmData') || '{}');

            const payload = {
                name: contactData.name,
                email: contactData.email,
                phone: contactData.phone,
                businessType: answers.industry_focus,
                monthlyBudget: answers.marketing_spend,
                readyToAutomate: answers.decision_maker === 'Yes, I am a decision maker' ? 'yes' : 'no',
                action, // 'book' or 'download'
                ...storedUtm,
            };

            const res = await fetch(`${API_BASE_URL}/api/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            const fullLeadData = {
                ...answers,
                ...contactData,
                id: data?.data?.id,
                action,
            };

            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Lead');
            }

            if (action === 'download') {
                navigate('/thank-you', {
                    state: {
                        email: contactData.email,
                        name:  contactData.name,
                        phone: contactData.phone,
                        lid:   data?.data?.id || '',
                    }
                });
                return;
            }

            onQualify(fullLeadData);
        } catch (err) {
            console.error('Lead submission error:', err);
            // Don't block user flow on API error
            onQualify({ ...answers, ...contactData, action });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <EmojiParticles particles={particles} />
            <ToastPortal toast={toast} />

            <div className="w-full">
                {isContactStep ? (
                    <ContactInfoStep
                        prefillData={prefillData}
                        onSubmit={handleContactSubmit}
                        onDownload={(data) => handleContactSubmit(data, 'download')}
                        loading={loading}
                    />
                ) : (
                    <div className="p-6 md:p-8">
                        {/* Step Header */}
                        <div className="mb-5">
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">
                                    Step {currentStep + 1} of {totalSteps}
                                </span>
                                <div className="flex gap-1.5">
                                    {Array.from({ length: totalSteps }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-indigo-500' : 'w-3 bg-white/10'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep + '-header'}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h2 className="text-2xl font-extrabold text-white leading-tight mb-1.5">
                                        {currentStep === 0 ? "Let's customize your growth plan." : stepInfo.question}
                                    </h2>
                                    <p className="text-sm text-slate-400">
                                        {currentStep === 0 ? stepInfo.question : stepInfo.description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {loading ? (
                            <div className="py-16 text-center">
                                <div className="w-10 h-10 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Analyzing Responses...</h3>
                                <p className="text-sm text-slate-400">Checking eligibility for the AI Audit</p>
                            </div>
                        ) : (
                            <div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.22 }}
                                        className="flex flex-col gap-2.5"
                                    >
                                        {stepInfo.options.map((option, idx) => {
                                            const isSelected = answers[stepInfo.id] === option;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => handleSelectOption(option, e)}
                                                    className={`w-full px-4 py-3 text-left rounded-xl border transition-all duration-200 flex items-center gap-3 group ${isSelected
                                                        ? 'border-indigo-500 bg-indigo-500/10'
                                                        : 'border-white/10 bg-[#121212] hover:bg-[#1a1a1a] hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-500' : 'border-slate-600 group-hover:border-slate-400'}`}>
                                                        {isSelected && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                                                    </div>
                                                    <span className={`font-medium text-[15px] ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                        {option}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                </AnimatePresence>

                                {currentStep > 0 && (
                                    <div className="mt-5 pt-4 border-t border-white/5">
                                        <button
                                            onClick={() => setCurrentStep(prev => prev - 1)}
                                            className="text-xs font-medium text-slate-500 hover:text-white transition-colors"
                                        >
                                            ← Back to previous question
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default LeadQualificationForm;
