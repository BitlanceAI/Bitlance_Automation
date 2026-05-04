import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Phone, Zap, Mic, Package, Wrench } from 'lucide-react';

const T = '#26CECE';

// ─── SEO AI Agent — Product (Self-Serve SaaS) ───────────────────────────────
const seoProductPlans = [
    {
        name: 'Starter',
        monthly: 1999,
        desc: 'For founders testing SEO automation.',
        features: ['8 articles / month', '1 WordPress site', 'Basic keyword research', 'Plagiarism check', 'Email support'],
        missing: ['Auto-publish', 'Interlinking', 'Push notifications'],
        cta: 'Start Free Trial',
        ctaLink: '/esign',
    },
    {
        name: 'Growth',
        monthly: 4999,
        popular: true,
        desc: 'For teams ready to dominate Google.',
        features: ['30 articles / month', '3 WordPress sites', 'SerpAPI trending topics', 'Plagiarism check', 'Auto-publish', 'Interlinking', 'Push notifications', 'Priority support'],
        missing: [],
        cta: 'Get Started',
        ctaLink: '/esign',
    },
    {
        name: 'Agency',
        monthly: 9999,
        desc: 'For agencies & multi-site businesses.',
        features: ['100 articles / month', 'Unlimited WordPress sites', 'SerpAPI + custom keywords', 'Plagiarism check', 'Auto-publish + Interlinking', 'Push notifications', 'Dedicated support'],
        missing: [],
        cta: 'Get Started',
        ctaLink: '/esign',
    },
];

// ─── SEO AI Agent — Service (Done For You) ──────────────────────────────────
const seoServicePlans = [
    {
        name: 'Basic',
        monthly: 14999,
        desc: 'Fully managed SEO content — we handle everything.',
        features: ['12 articles / month', 'Keyword & competitor research', 'WordPress publishing', 'Monthly performance report', 'Email support'],
        missing: ['Dedicated SEO manager', 'Custom content strategy', 'Backlink outreach'],
        cta: 'Get Started',
        ctaLink: '/apply',
    },
    {
        name: 'Professional',
        monthly: 29999,
        popular: true,
        desc: 'Full SEO strategy + execution by our team.',
        features: ['30 articles / month', 'Custom content strategy', 'Keyword + competitor analysis', 'WordPress publishing', 'Interlinking & on-page SEO', 'Bi-weekly performance calls', 'Priority support'],
        missing: ['Backlink outreach'],
        cta: 'Start Closing',
        ctaLink: '/apply',
    },
    {
        name: 'Premium',
        monthly: null,
        desc: 'Dedicated SEO manager + custom volume. Enterprise only.',
        features: ['60+ articles / month', 'Dedicated SEO manager', 'Custom content strategy', 'Backlink outreach', 'Full on-page & technical SEO', 'Weekly reporting & calls', 'SLA guarantee'],
        missing: [],
        cta: 'Contact Sales',
        ctaLink: '/contact',
        contactSales: true,
    },
];

// ─── Voice Agent — Service ───────────────────────────────────────────────────
const voicePlans = [
    {
        name: 'Starter',
        monthly: 11999,
        desc: 'AI voice bot for small teams handling inbound enquiries.',
        features: ['500 mins / month', '1 phone number', 'Custom voice script', 'Lead capture & CRM sync', 'Call recordings', 'Email support'],
        missing: ['Outbound calling', 'CRM integration (HubSpot)', 'Multi-language'],
        cta: 'Get Started',
        ctaLink: '/apply',
    },
    {
        name: 'Business',
        monthly: 24999,
        popular: true,
        desc: 'Inbound + outbound calling with full CRM integration.',
        features: ['1,500 mins / month', '3 phone numbers', 'Custom voice & personality', 'Inbound + outbound calls', 'HubSpot / Salesforce sync', 'Appointment scheduling', 'Call analytics dashboard', 'Priority support'],
        missing: [],
        cta: 'Start Closing',
        ctaLink: '/apply',
    },
    {
        name: 'Enterprise',
        monthly: null,
        desc: 'Unlimited calls, multi-number, dedicated success manager.',
        features: ['Unlimited minutes', 'Unlimited phone numbers', 'Multi-language support', 'Custom AI personality', 'Full CRM integration', 'Dedicated success manager', 'SLA & uptime guarantee', 'White-label option'],
        missing: [],
        cta: 'Contact Sales',
        ctaLink: '/contact',
        contactSales: true,
    },
];

// ─── Plan Card ───────────────────────────────────────────────────────────────
function PlanCard({ plan, idx, yearly }) {
    const price = plan.monthly
        ? (yearly ? Math.round(plan.monthly * 0.8) : plan.monthly).toLocaleString('en-IN')
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.07 }}
            whileHover={{ y: -5 }}
            className="relative flex flex-col rounded p-6 transition-all duration-300"
            style={{
                background: plan.popular ? `${T}08` : '#ffffff',
                border: `1px solid ${plan.popular ? T : '#1E1E1E'}`,
                boxShadow: plan.popular ? `0 0 40px 0 ${T}12` : 'none',
            }}
        >
            {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-sm whitespace-nowrap"
                    style={{ background: T, color: '#000', fontFamily: "'DM Mono',monospace" }}>
                    Most Popular
                </div>
            )}

            <h3 className="text-base font-extrabold text-black mb-1">{plan.name}</h3>
            <p className="text-xs text-gray-500 mb-5 min-h-[40px]">{plan.desc}</p>

            {price ? (
                <>
                    <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-lg font-extrabold text-gray-500" style={{ fontFamily: "'DM Mono',monospace" }}>₹</span>
                        <span className="text-4xl font-black text-black" style={{ fontFamily: "'DM Mono',monospace" }}>{price}</span>
                        <span className="text-gray-500 text-xs">/mo</span>
                    </div>
                    {yearly && (
                        <p className="text-[10px] text-green-400 mb-4" style={{ fontFamily: "'DM Mono',monospace" }}>
                            Save ₹{Math.round(plan.monthly * 0.2 * 12).toLocaleString('en-IN')}/yr
                        </p>
                    )}
                </>
            ) : (
                <div className="flex items-center gap-2 mb-5">
                    <Phone size={16} style={{ color: T }} />
                    <span className="text-2xl font-extrabold text-black" style={{ fontFamily: "'DM Mono',monospace" }}>Custom</span>
                </div>
            )}

            <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <Check size={11} className="mt-0.5 flex-shrink-0" style={{ color: T }} />
                        <span className="text-xs text-black/70">{f}</span>
                    </li>
                ))}
                {(plan.missing || []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 opacity-25">
                        <X size={11} className="mt-0.5 flex-shrink-0 text-gray-500" />
                        <span className="text-xs text-gray-500">{f}</span>
                    </li>
                ))}
            </ul>

            <Link
                to={plan.ctaLink}
                className="w-full py-3 rounded text-[11px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200"
                style={plan.popular
                    ? { background: T, color: '#000' }
                    : plan.contactSales
                        ? { background: 'transparent', color: T, border: `1px solid ${T}50` }
                        : { background: '#f9fafb', color: '#111111', border: '1px solid #2A2A2A' }}
            >
                {plan.contactSales ? <Phone size={11} /> : <ArrowRight size={11} />}
                {plan.cta}
            </Link>
        </motion.div>
    );
}

// ─── Main ────────────────────────────────────────────────────────────────────
const AgentPricingSection = () => {
    const [agent, setAgent] = useState('seo');       // 'seo' | 'voice'
    const [seoMode, setSeoMode] = useState('product'); // 'product' | 'service'
    const [yearly, setYearly] = useState(false);

    const plans = agent === 'voice'
        ? voicePlans
        : seoMode === 'product' ? seoProductPlans : seoServicePlans;

    return (
        <section className="py-24 bg-transparent" id="pricing">
            <div className="max-w-7xl mx-auto px-6">

                {/* Heading */}
                <div className="mb-12 max-w-2xl">
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', color: '#000', textTransform: 'uppercase' }}>
                        Pricing
                    </span>
                    <h2 className="mt-4 text-3xl md:text-5xl font-extrabold text-black leading-tight"
                        style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.025em' }}>
                        Simple pricing,<br /><span style={{ color: T }}>massive ROI</span>
                    </h2>
                    <div className="mt-5" style={{ width: 48, height: 2, background: T }} />
                    <div className="mt-5 inline-flex flex-wrap items-center gap-2 px-4 py-2.5 text-xs rounded"
                        style={{ background: `${T}0D`, border: `1px solid ${T}25` }}>
                        <span style={{ color: T, fontFamily: "'DM Mono',monospace" }}>Agencies charge</span>
                        <span className="line-through" style={{ color: '#000', fontFamily: "'DM Mono',monospace" }}>₹2,50,000–₹6,00,000/mo</span>
                        <span style={{ color: T, fontFamily: "'DM Mono',monospace" }}>for what you get below.</span>
                    </div>
                </div>

                {/* Agent Toggle */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex rounded overflow-hidden border border-gray-200">
                        <button
                            onClick={() => setAgent('seo')}
                            className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-all"
                            style={agent === 'seo'
                                ? { background: T, color: '#000' }
                                : { background: '#ffffff', color: '#000' }}
                        >
                            <Zap size={13} /> SEO AI Agent
                        </button>
                        <button
                            onClick={() => setAgent('voice')}
                            className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-all"
                            style={agent === 'voice'
                                ? { background: T, color: '#000' }
                                : { background: '#ffffff', color: '#000' }}
                        >
                            <Mic size={13} /> Voice Agent
                        </button>
                    </div>

                    {/* SEO sub-toggle: Product vs Service */}
                    {agent === 'seo' && (
                        <div className="flex rounded overflow-hidden border border-gray-200">
                            <button
                                onClick={() => setSeoMode('product')}
                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-all"
                                style={seoMode === 'product'
                                    ? { background: '#1E1E1E', color: '#fff' }
                                    : { background: '#ffffff', color: '#000' }}
                            >
                                <Package size={12} /> Self-Serve Product
                            </button>
                            <button
                                onClick={() => setSeoMode('service')}
                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-all"
                                style={seoMode === 'service'
                                    ? { background: '#1E1E1E', color: '#fff' }
                                    : { background: '#ffffff', color: '#000' }}
                            >
                                <Wrench size={12} /> Done For You
                            </button>
                        </div>
                    )}

                    {/* Yearly toggle */}
                    <div className="flex items-center gap-3 ml-auto">
                        <span className="text-xs" style={{ color: !yearly ? T : '#555' }}>Monthly</span>
                        <button onClick={() => setYearly(v => !v)}
                            className="w-10 h-5 relative rounded-full transition-all flex-shrink-0"
                            style={{ background: T }}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-transparent transition-transform duration-300 ${yearly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                        <span className="text-xs" style={{ color: yearly ? T : '#555' }}>
                            Yearly <span className="text-green-400">(−20%)</span>
                        </span>
                    </div>
                </div>

                {/* Context label */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={`${agent}-${seoMode}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs mb-8 font-mono"
                        style={{ color: '#000' }}
                    >
                        {agent === 'voice' && '🎙 Voice Agent as a Service — we build, deploy & manage your AI caller'}
                        {agent === 'seo' && seoMode === 'product' && '⚡ Self-serve SaaS — your team runs the platform, we power the AI'}
                        {agent === 'seo' && seoMode === 'service' && '🛠 Done For You — our team handles research, writing & publishing end to end'}
                    </motion.p>
                </AnimatePresence>

                {/* Cards */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${agent}-${seoMode}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5"
                    >
                        {plans.map((plan, idx) => (
                            <PlanCard key={plan.name} plan={plan} idx={idx} yearly={yearly} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Footer note */}
                <p className="text-center text-xs mt-10" style={{ color: '#333', fontFamily: "'DM Mono',monospace" }}>
                    All plans include GST · Cancel anytime · 20% off yearly billing
                </p>
            </div>
        </section>
    );
};

export default AgentPricingSection;
