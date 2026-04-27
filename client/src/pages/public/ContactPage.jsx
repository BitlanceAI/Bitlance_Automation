import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, Phone, MapPin, MessageSquare,
    Send, CheckCircle, Clock, Globe, Zap, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../../components/ui/ScrollReveal';
import { supabase } from '../../services/supabaseClient';
import { trackContactFormSubmit, trackContactFormSuccess, trackContactFormError, trackDemoClick, trackSocialClick, trackFormStart } from '../../lib/analytics';

/* ─────────────── Contact Info Card ─────────────── */
const ContactCard = ({ icon: Icon, title, value, sub, color, href }) => (
    <a
        href={href || '#'}
        className="flex lg:flex-col xl:flex-row gap-4 p-5 rounded-[2px] bg-slate-50 border border-slate-200
                   hover:bg-slate-100 hover:border-slate-300 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]"
    >
        <div className={`flex-shrink-0 w-12 h-12 rounded-[2px] bg-white flex items-center
                         justify-center border border-slate-200 group-hover:bg-[#26cece] group-hover:text-white transition-colors`}>
            <Icon className="text-[#26cece] transition-colors" size={22} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">{title}</p>
            <p className="text-slate-900 font-bold font-['Space_Grotesk'] tracking-tight truncate max-w-full" title={value}>{value}</p>
            {sub && <p className="text-slate-500 text-[13px] font-sans mt-0.5 whitespace-normal break-words">{sub}</p>}
        </div>
    </a>
);

/* ─────────────── FAQ Item ─────────────── */
const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-slate-200 bg-slate-50 rounded-[2px] overflow-hidden mb-3">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 text-left
                           hover:bg-slate-100 transition-colors"
            >
                <span className="font-bold text-slate-900 font-['Space_Grotesk'] tracking-tight">{q}</span>
                <ChevronDown
                    size={18}
                    className={`text-slate-400 flex-shrink-0 ml-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-5 text-slate-600 font-sans leading-relaxed text-[15px]">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─────────────── Main Page ─────────────── */
const ContactPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [formStartedTracked, setFormStartedTracked] = useState(false);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleFocus = () => {
        if (!formStartedTracked) {
            trackFormStart('Contact Form');
            setFormStartedTracked(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.message) {
            setError('Please fill in all required fields.');
            trackContactFormError('Missing required fields');
            return;
        }
        setSubmitting(true);
        trackContactFormSubmit();

        try {
            // 1. Save to Supabase 'contacts' table
            const { error: supabaseError } = await supabase
                .from('contacts')
                .insert([
                    {
                        name: form.name,
                        email: form.email,
                        company: form.company,
                        message: form.message,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (supabaseError) {
                console.error('Supabase Error:', supabaseError);
                throw new Error('Failed to save to database');
            }

            // 2. Send Email alert via Web3Forms (if key exists)
            // You can get a free access key at https://web3forms.com/
            const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

            if (accessKey) {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        access_key: accessKey,
                        subject: "New Contact Form Submission - Bitlance",
                        name: form.name,
                        email: form.email,
                        company: form.company,
                        message: form.message,
                    }),
                });
                const result = await response.json();
                if (!result.success) {
                    console.error('Web3Forms Error:', result);
                }
            } else {
                console.warn('VITE_WEB3FORMS_ACCESS_KEY is missing. Email alert was not sent.');
            }

            setSubmitted(true);
            trackContactFormSuccess();
        } catch (err) {
            console.error('Submission Error:', err);
            const msg = 'Something went wrong. Please try again or email us directly.';
            setError(msg);
            trackContactFormError(err.message || msg);
        } finally {
            setSubmitting(false);
        }
    };

    const faqs = [
        {
            q: 'How quickly can I get started with Bitlance AI agents?',
            a: 'Most clients are fully onboarded within 48–72 hours. Our team handles the entire setup, from CRM integration to voice agent training, so you can focus on your business.'
        },
        {
            q: 'Do I need technical knowledge to use the platform?',
            a: 'Not at all. Bitlance is designed to be plug-and-play. Our onboarding specialists walk you through every step, and our dashboard is intuitive for non-technical users.'
        },
        {
            q: 'What industries do you serve?',
            a: 'We work across real estate, e-commerce, SaaS, healthcare, and more. Our AI agents are customised to fit the specific vocabulary, compliance, and workflows of your industry.'
        },
        {
            q: 'Is my data safe?',
            a: 'Yes. All data is encrypted in transit and at rest. We adhere to GDPR and regional data-privacy standards, and we never share your data with third parties.'
        },
        {
            q: 'Can I see a live demo before committing?',
            a: 'Absolutely. Click "Book a Demo" on any page, and our team will give you a personalised walkthrough tailored to your use case.'
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900">

            {/* ── Minimal Nav ── */}
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-mono uppercase tracking-widest text-[12px]"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                    <div className="text-xl font-bold tracking-tight font-['Space_Grotesk']">
                        Bitlance<span className="text-[#26cece]">AI</span>
                    </div>
                    <button
                        onClick={() => { trackDemoClick('contact_nav'); window.open('https://wa.me/917391025059?text=Hi%2C%20I%20would%20like%20to%20book%20a%20demo%20of%20Bitlance%20AI.', '_blank'); }}
                        className="px-6 py-2 bg-[#26cece] text-white font-bold font-mono tracking-widest uppercase rounded-[2px]
                                   hover:bg-slate-900 transition-colors text-[10px]"
                    >
                        Book Demo
                    </button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px]
                                   bg-slate-50 border border-slate-200 mb-8 font-mono text-[10px] tracking-widest uppercase text-[#26cece]"
                    >
                        <Zap size={12} className="text-[#26cece]" />
                        <span>We respond within 24 hours</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 font-['Space_Grotesk'] uppercase text-slate-900"
                    >
                        Let's{' '}
                        <span className="text-[#26cece]">
                            Talk
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-slate-500 font-sans leading-relaxed max-w-2xl mx-auto"
                    >
                        Have a question, partnership idea, or just want to see our AI agents in action?
                        Drop us a message and our team will get back to you shortly.
                    </motion.p>
                </div>
            </section>

            {/* ── Contact Info Cards ── */}
            <section className="pb-16">
                <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ContactCard
                            icon={Mail}
                            title="Email us"
                            value="ceo@bitlancetechhub.com"
                            sub="For general enquiries"
                            color="violet"
                            href="mailto:ceo@bitlancetechhub.com"
                        />
                        <ContactCard
                            icon={Phone}
                            title="Call us"
                            value="+91 7391025059"
                            sub="Mon – Sat, 9 am – 7 pm IST"
                            color="indigo"
                            href="tel:+917391025059"
                        />
                        <ContactCard
                            icon={MapPin}
                            title="Office"
                            value="Pune, Maharashtra"
                            sub="Blue Ridge Town, Phase 1"
                            color="blue"
                        />
                        <ContactCard
                            icon={Clock}
                            title="Response time"
                            value="&lt; 24 hours"
                            sub="Usually much faster"
                            color="emerald"
                        />
                    </div>
                </ScrollReveal>
            </section>

            {/* ── Form + Illustration ── */}
            <section className="py-24 border-t border-slate-200">
                <ScrollReveal className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* Left – Form */}
                        <div>
                            <h2 className="text-3xl md:text-[40px] font-bold mb-3 font-['Space_Grotesk'] tracking-tight text-slate-900">Send us a message</h2>
                            <p className="text-slate-500 mb-10 leading-relaxed font-sans text-[16px]">
                                Fill in the form below and one of our specialists will reach out to schedule a
                                personalised session tailored to your business needs.
                            </p>

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center gap-4 py-20 text-center border border-slate-200 bg-slate-50 rounded-[2px]"
                                >
                                    <div className="w-16 h-16 bg-white border border-slate-200 flex items-center justify-center text-[#26cece] mb-2 rounded-[2px]">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold font-['Space_Grotesk'] uppercase tracking-tight text-slate-900">Message sent!</h3>
                                    <p className="text-slate-500 max-w-xs font-sans">
                                        Thanks for reaching out. We'll be in touch within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', message: '' }); setFormStartedTracked(false); }}
                                        className="mt-6 px-6 py-3 rounded-[2px] bg-slate-900 text-white border border-transparent text-[12px] font-mono tracking-widest uppercase
                                                   hover:bg-[#26cece] transition-colors"
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2">
                                                Full Name <span className="text-[#26cece]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                onFocus={handleFocus}
                                                placeholder="Jane Doe"
                                                className="w-full bg-white border border-slate-200 rounded-[2px] px-4 py-3 text-slate-900
                                                           placeholder-slate-400 focus:outline-none focus:border-[#26cece]
                                                           focus:ring-0 transition-all font-mono text-[14px]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2">
                                                Email <span className="text-[#26cece]">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="jane@yourcompany.com"
                                                className="w-full bg-white border border-slate-200 rounded-[2px] px-4 py-3 text-slate-900
                                                           placeholder-slate-400 focus:outline-none focus:border-[#26cece]
                                                           focus:ring-0 transition-all font-mono text-[14px]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2">
                                            Company / Organisation
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={form.company}
                                            onChange={handleChange}
                                            placeholder="Acme Inc."
                                            className="w-full bg-white border border-slate-200 rounded-[2px] px-4 py-3 text-slate-900
                                                       placeholder-slate-400 focus:outline-none focus:border-[#26cece]
                                                       focus:ring-0 transition-all font-mono text-[14px]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2">
                                            How can we help? <span className="text-[#26cece]">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Tell us about your project, challenge, or the AI solution you're looking for..."
                                            className="w-full bg-white border border-slate-200 rounded-[2px] px-4 py-3 text-slate-900
                                                       placeholder-slate-400 focus:outline-none focus:border-[#26cece]
                                                       focus:ring-0 transition-all resize-none font-mono text-[14px]"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-rose-500 text-sm font-mono">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center gap-2 py-4 rounded-[2px] font-bold font-['Space_Grotesk'] tracking-widest uppercase
                                                   bg-[#26cece] text-[#070707] hover:bg-white
                                                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                                                   hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333]"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 text-[#070707]" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Sending…
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Right – Visual + social links */}
                        <div className="flex flex-col gap-10">
                            {/* Abstract radial visual */}
                            <div className="relative w-full aspect-square max-w-[440px] mx-auto bg-slate-50 border border-slate-200 flex items-center justify-center p-8 rounded-[2px]">
                                <div className="w-24 h-24 bg-white border border-slate-200 rounded-[2px] flex items-center justify-center text-[#26cece]">
                                    <MessageSquare size={40} />
                                </div>
                            </div>

                            {/* Quick links */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk'] uppercase tracking-tight">Connect with us</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'LinkedIn', href: 'https://linkedin.com', icon: Globe },
                                        { label: 'Twitter / X', href: 'https://twitter.com', icon: Globe },
                                        { label: 'WhatsApp', href: 'https://wa.me/917391025059', icon: MessageSquare },
                                        { label: 'Book a Demo', href: 'https://wa.me/917391025059?text=Hi%2C%20I%20would%20like%20to%20book%20a%20demo%20of%20Bitlance%20AI.', icon: Zap },
                                    ].map(({ label, href, icon: Icon }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target={href.startsWith('http') ? '_blank' : undefined}
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 rounded-[2px] bg-white border border-slate-200
                                                        hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#26cece] transition-all duration-200 text-[11px] font-mono tracking-widest uppercase text-slate-900"
                                        >
                                            <Icon size={16} className="text-[#26cece]" />
                                            {label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* ── FAQ ── */}
            <section className="py-24 bg-white border-y border-slate-200">
                <ScrollReveal className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-[40px] font-bold mb-4 font-['Space_Grotesk'] tracking-tight text-slate-900">Frequently asked questions</h2>
                        <p className="text-slate-500 font-sans text-lg">Can't find what you're looking for? Just ask us directly.</p>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => <FaqItem key={i} {...faq} />)}
                    </div>
                </ScrollReveal>
            </section>

            {/* ── Bottom CTA ── */}
            <section className="py-32 flex justify-center text-center px-6 bg-slate-50">
                <ScrollReveal className="relative z-10 w-full max-w-3xl border border-slate-200 bg-white p-16 rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                    <h2 className="text-4xl md:text-[56px] font-bold mb-6 font-['Space_Grotesk'] uppercase tracking-tighter leading-none text-slate-900">
                        Ready to see{' '} <br/>
                        <span className="text-[#26cece]">
                            AI in action?
                        </span>
                    </h2>
                    <p className="text-[16px] text-slate-500 font-sans mb-10 max-w-xl mx-auto">
                        Book a free, no-obligation live demo and watch our agents handle real-world scenarios for your industry.
                    </p>
                    <button
                        onClick={() => { trackDemoClick('contact_cta'); window.open('https://wa.me/917391025059?text=Hi%2C%20I%20would%20like%20to%20book%20a%20demo%20of%20Bitlance%20AI.', '_blank'); }}
                        className="inline-flex items-center gap-2 bg-[#26cece] text-white px-10 py-5
                                   rounded-[2px] font-bold font-['Space_Grotesk'] tracking-widest uppercase hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#slate-900] hover:bg-slate-900 transition-all duration-200"
                    >
                        Book Your Live Demo
                        <ArrowLeft size={20} className="rotate-180" />
                    </button>
                </ScrollReveal>
            </section>

        </div>
    );
};

export default ContactPage;
