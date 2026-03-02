import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Mail, Phone, MapPin, MessageSquare,
    Send, CheckCircle, Clock, Globe, Zap, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '../components/ui/ScrollReveal';
import { supabase } from '../services/supabaseClient';

/* ─────────────── Contact Info Card ─────────────── */
const ContactCard = ({ icon: Icon, title, value, sub, color, href }) => (
    <a
        href={href || '#'}
        className="flex lg:flex-col xl:flex-row gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10
                   hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 group"
    >
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center
                         justify-center border border-${color}-400/30 group-hover:scale-110 transition-transform`}>
            <Icon className={`text-${color}-400`} size={22} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-1">{title}</p>
            <p className="text-white font-semibold truncate" title={value}>{value}</p>
            {sub && <p className="text-white/50 text-sm mt-0.5 whitespace-normal break-words">{sub}</p>}
        </div>
    </a>
);

/* ─────────────── FAQ Item ─────────────── */
const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-white/10 rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 text-left
                           hover:bg-white/[0.04] transition-colors"
            >
                <span className="font-semibold text-white/90">{q}</span>
                <ChevronDown
                    size={18}
                    className={`text-white/50 flex-shrink-0 ml-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
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
                        <p className="px-5 pb-5 text-white/60 leading-relaxed">{a}</p>
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

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.message) {
            setError('Please fill in all required fields.');
            return;
        }
        setSubmitting(true);

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
        } catch (err) {
            console.error('Submission Error:', err);
            setError('Something went wrong. Please try again or email us directly.');
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
        <div className="min-h-screen bg-[#030303] text-white">

            {/* ── Minimal Nav ── */}
            <nav className="fixed top-0 w-full z-50 bg-[#030303]/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="text-xl font-bold tracking-tight">
                        Bitlance<span className="text-violet-500">AI</span>
                    </div>
                    <button
                        onClick={() => navigate('/apply/real-estate')}
                        className="px-6 py-2.5 bg-white text-black font-semibold rounded-full
                                   hover:bg-gray-200 transition-colors text-sm"
                    >
                        Book Demo
                    </button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]
                                bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                   bg-white/5 border border-white/10 mb-8"
                    >
                        <Zap size={16} className="text-violet-400" />
                        <span className="text-sm font-medium text-white/80">We respond within 24 hours</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
                    >
                        Let's{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                            Talk
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto"
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
            <section className="py-24 border-t border-white/5">
                <ScrollReveal className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* Left – Form */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">Send us a message</h2>
                            <p className="text-white/50 mb-10 leading-relaxed">
                                Fill in the form below and one of our specialists will reach out to schedule a
                                personalised session tailored to your business needs.
                            </p>

                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center gap-4 py-20 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/30
                                                    flex items-center justify-center">
                                        <CheckCircle size={40} className="text-emerald-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Message sent!</h3>
                                    <p className="text-white/60 max-w-xs">
                                        Thanks for reaching out. We'll be in touch within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => { setSubmitted(false); setForm({ name: '', email: '', company: '', message: '' }); }}
                                        className="mt-4 px-6 py-2.5 rounded-xl border border-white/20 text-sm font-medium
                                                   hover:bg-white/10 transition-colors"
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2">
                                                Full Name <span className="text-violet-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="Jane Doe"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                                                           placeholder-white/30 focus:outline-none focus:border-violet-500/60
                                                           focus:ring-1 focus:ring-violet-500/40 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/70 mb-2">
                                                Email <span className="text-violet-400">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="jane@yourcompany.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                                                           placeholder-white/30 focus:outline-none focus:border-violet-500/60
                                                           focus:ring-1 focus:ring-violet-500/40 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Company / Organisation
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={form.company}
                                            onChange={handleChange}
                                            placeholder="Acme Inc."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                                                       placeholder-white/30 focus:outline-none focus:border-violet-500/60
                                                       focus:ring-1 focus:ring-violet-500/40 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            How can we help? <span className="text-violet-400">*</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Tell us about your project, challenge, or the AI solution you're looking for..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                                                       placeholder-white/30 focus:outline-none focus:border-violet-500/60
                                                       focus:ring-1 focus:ring-violet-500/40 transition-all resize-none"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-rose-400 text-sm">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold
                                                   bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                                                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                                                   hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02]"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
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
                            <div className="relative w-full aspect-square max-w-[440px] mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 rounded-full blur-3xl opacity-50" />
                                <div className="absolute inset-4 border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
                                <div className="absolute inset-12 border border-violet-500/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                                <div className="absolute inset-24 border border-indigo-500/30 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                                w-28 h-28 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl
                                                shadow-[0_0_50px_rgba(139,92,246,0.5)] flex items-center justify-center">
                                    <MessageSquare size={48} className="text-white" />
                                </div>
                            </div>

                            {/* Quick links */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white/80">Connect with us</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'LinkedIn', href: 'https://linkedin.com', icon: Globe, color: 'indigo' },
                                        { label: 'Twitter / X', href: 'https://twitter.com', icon: Globe, color: 'sky' },
                                        { label: 'WhatsApp', href: 'https://wa.me/917391025059', icon: MessageSquare, color: 'emerald' },
                                        { label: 'Book a Demo', href: '/apply/real-estate', icon: Zap, color: 'violet' },
                                    ].map(({ label, href, icon: Icon, color }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target={href.startsWith('http') ? '_blank' : undefined}
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/10
                                                        hover:bg-${color}-500/10 hover:border-${color}-500/30 transition-all duration-300 text-sm font-medium text-white/80`}
                                        >
                                            <Icon size={16} className={`text-${color}-400`} />
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
            <section className="py-24 bg-white/[0.02] border-y border-white/5">
                <ScrollReveal className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently asked questions</h2>
                        <p className="text-white/50 text-lg">Can't find what you're looking for? Just ask us directly.</p>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => <FaqItem key={i} {...faq} />)}
                    </div>
                </ScrollReveal>
            </section>

            {/* ── Bottom CTA ── */}
            <section className="py-32 relative text-center px-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                w-[600px] h-[400px] bg-violet-600/20 blur-[100px] pointer-events-none" />
                <ScrollReveal className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        Ready to see{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                            AI in action?
                        </span>
                    </h2>
                    <p className="text-xl text-white/60 mb-10">
                        Book a free, no-obligation live demo and watch our agents handle real-world scenarios for your industry.
                    </p>
                    <button
                        onClick={() => navigate('/apply/real-estate')}
                        className="inline-flex items-center gap-2 bg-white text-black px-10 py-4
                                   rounded-full font-bold text-lg hover:scale-105 transition-transform"
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
