import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Phone } from 'lucide-react';

const T = '#26CECE';

const plans = [
    {
        id: 'free',
        name: 'Free',
        monthly: 0,
        perDay: '0',
        desc: 'Try AI automation with no commitment. No card required.',
        features: ['1 AI Agent (Chat Only)', '50 conversations/mo', 'Web Chat', 'Basic Lead Capture'],
        missing: ['WhatsApp & Social', 'CRM Integration', 'Lead Qualification', 'Priority Support'],
        cta: 'Get Started Free',
        ctaLink: '/signup',
        contactSales: false,
    },
    {
        id: 'starter',
        name: 'Starter',
        monthly: 7999,
        perDay: '267',
        desc: 'Perfect for small businesses just starting with automation.',
        features: ['1 AI Agent', '500 conversations/mo', 'WhatsApp & Web Chat', 'Basic Lead Qualification', 'Email Support'],
        missing: ['CRM Integration', 'Custom Workflows', 'Priority Support'],
        cta: 'Get Started',
        ctaLink: '/apply',
        contactSales: false,
    },
    {
        id: 'growth',
        name: 'Growth',
        monthly: 19999,
        perDay: '667',
        popular: true,
        desc: 'For scaling teams that need robust integrations and higher volume.',
        features: ['3 AI Agents', '2,000 conversations/mo', 'All Channels (WhatsApp, FB, IG)', 'Advanced Lead Qualification', 'CRM Integration (HubSpot, Salesforce)', 'Calendar Booking', 'Priority Support'],
        missing: [],
        cta: 'Start Closing More Deals',
        ctaLink: '/apply',
        contactSales: false,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        monthly: null,
        perDay: null,
        desc: 'Custom workflows, dedicated support, and unlimited scale for large teams.',
        features: ['Unlimited AI Agents', 'Unlimited conversations', 'Custom Workflows & API Access', 'Dedicated Success Manager', 'White-label Options', 'SLA & Uptime Guarantee', 'Onboarding & Training'],
        missing: [],
        cta: 'Contact Sales',
        ctaLink: '/contact',
        contactSales: true,
    },
];

const PricingSection = () => {
    const [yearly, setYearly] = useState(false);

    const displayPrice = (plan) => {
        if (plan.monthly === null) return null;
        if (plan.monthly === 0) return '0';
        const p = yearly ? Math.round(plan.monthly * 0.8) : plan.monthly;
        return p.toLocaleString('en-IN');
    };

    const displayPerDay = (plan) => {
        if (!plan.perDay || plan.perDay === '0') return plan.perDay;
        const p = yearly ? Math.round(parseInt(plan.perDay) * 0.8) : parseInt(plan.perDay);
        return p.toLocaleString('en-IN');
    };

    return (
        <section className="py-24 bg-[#070707]" id="pricing">
            <div className="max-w-7xl mx-auto px-6">

                {/* Heading */}
                <div className="mb-16 max-w-2xl">
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: '#555', textTransform: 'uppercase' }}>
                        Pricing
                    </span>
                    <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white leading-tight"
                        style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.025em' }}>
                        Simple pricing,<br /><span style={{ color: T }}>massive ROI</span>
                    </h2>
                    <div className="mt-6" style={{ width: 48, height: 2, background: T }} />

                    {/* Anchor */}
                    <div className="mt-6 inline-flex flex-wrap items-center gap-2 px-4 py-2.5 text-xs rounded"
                        style={{ background: `${T}0D`, border: `1px solid ${T}25` }}>
                        <span style={{ color: T, fontFamily: "'DM Mono',monospace" }}>A typical agency charges</span>
                        <span className="line-through" style={{ color: '#555', fontFamily: "'DM Mono',monospace" }}>₹2,50,000–₹6,00,000/mo</span>
                        <span style={{ color: T, fontFamily: "'DM Mono',monospace" }}>for what you get below.</span>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-4 mt-8">
                        <span className="text-sm font-medium" style={{ color: !yearly ? T : '#555' }}>Monthly</span>
                        <button onClick={() => setYearly(v => !v)}
                            className="w-12 h-6 relative rounded-full transition-all" style={{ background: T }}>
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#070707] transition-transform duration-300 ${yearly ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                        <span className="text-sm font-medium" style={{ color: yearly ? T : '#555' }}>
                            Yearly <span className="text-xs ml-1 text-green-400">(Save 20%)</span>
                        </span>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: idx * 0.08 }} viewport={{ once: true }}
                            whileHover={{ y: -6 }}
                            className="relative flex flex-col rounded p-6 transition-all duration-300"
                            style={{
                                background: plan.popular ? `${T}08` : '#0F0F0F',
                                border: `1px solid ${plan.popular ? T : plan.contactSales ? '#2a2a2a' : '#1E1E1E'}`,
                                boxShadow: plan.popular ? `0 0 48px 0 ${T}12` : 'none',
                            }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-sm whitespace-nowrap"
                                    style={{ background: T, color: '#070707', fontFamily: "'DM Mono',monospace" }}>
                                    Most Popular — 68% of teams
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                                <p className="text-sm text-white/40 mb-5 min-h-[48px]">{plan.desc}</p>

                                {plan.monthly === null ? (
                                    /* Enterprise — no price shown */
                                    <div className="flex items-center gap-2 mt-2 mb-1">
                                        <Phone size={18} style={{ color: T }} />
                                        <span className="text-2xl font-bold text-white" style={{ fontFamily: "'DM Mono',monospace" }}>Custom</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-white/50" style={{ fontFamily: "'DM Mono',monospace" }}>₹</span>
                                            <span className="text-4xl font-extrabold text-white" style={{ fontFamily: "'DM Mono',monospace" }}>
                                                {displayPrice(plan)}
                                            </span>
                                            <span className="text-white/40 text-sm">/mo</span>
                                        </div>
                                        {plan.monthly > 0 && (
                                            <p className="mt-1 text-xs" style={{ color: '#555', fontFamily: "'DM Mono',monospace" }}>
                                                = ₹{displayPerDay(plan)}/day
                                            </p>
                                        )}
                                        {plan.monthly === 0 && (
                                            <p className="mt-1 text-xs" style={{ color: '#555', fontFamily: "'DM Mono',monospace" }}>
                                                No credit card required
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>

                            <ul className="space-y-2.5 mb-8 flex-1">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: T }} />
                                        <span className="text-xs text-white/70">{f}</span>
                                    </li>
                                ))}
                                {plan.missing.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5 opacity-25">
                                        <X size={12} className="mt-0.5 flex-shrink-0 text-white/30" />
                                        <span className="text-xs text-white/40">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to={plan.ctaLink}
                                className="w-full py-3 rounded text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest"
                                style={plan.popular
                                    ? { background: T, color: '#070707' }
                                    : plan.contactSales
                                        ? { background: 'transparent', color: T, border: `1px solid ${T}50` }
                                        : { background: '#1A1A1A', color: '#EFEFEF', border: '1px solid #2A2A2A' }}
                            >
                                {plan.contactSales && <Phone size={12} />}
                                {plan.cta}
                                {!plan.contactSales && <ArrowRight size={12} />}
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom note */}
                <p className="text-center text-xs mt-10" style={{ color: '#444', fontFamily: "'DM Mono',monospace" }}>
                    All plans include GST · Cancel anytime · 20% off on yearly billing
                </p>
            </div>
        </section>
    );
};

export default PricingSection;
