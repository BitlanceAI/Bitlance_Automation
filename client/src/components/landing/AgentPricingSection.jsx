import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Phone, Zap, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config.js';
import { MeshGradient } from '@paper-design/shaders-react';

const T = '#26CECE';

const seoGeoPlans = [
    {
        name: 'Starter',
        priceINR: 999,
        credits: 3000,
        seoBlogs: 60,
        geoBlogs: 40,
        desc: 'Ideal for freelancers just getting started. 3,000 credits (60 SEO / 40 GEO blogs a month). Enough to dominate your niche.',
        popular: false,
        planType: 'seo_geo',
        features: ['SEO Optimization', 'GEO Optimization', 'Internal Linking', 'AI Search Optimization'],
        missing: ['Brand Knowledge', 'AI Overview Optimization', 'Multi-Agent Research', 'Competitor Analysis', 'Content Audits', 'Priority Generation'],
        cta: 'Buy Starter',
    },
    {
        name: 'Growth',
        priceINR: 4999,
        credits: 12000,
        seoBlogs: 240,
        geoBlogs: 160,
        desc: 'The sweet spot for growing teams. 12,000 credits (240 SEO / 160 GEO blogs). This is where most of our clients see their first 2x results.',
        popular: true,
        planType: 'seo_geo',
        features: ['SEO Optimization', 'GEO Optimization', 'Internal Linking', 'AI Search Optimization', 'Brand Knowledge', 'AI Overview Optimization'],
        missing: ['Multi-Agent Research', 'Competitor Analysis', 'Content Audits', 'Priority Generation'],
        cta: 'Buy Growth',
    },
    {
        name: 'Pro',
        priceINR: 9999,
        credits: 19999,
        seoBlogs: 399,
        geoBlogs: 266,
        desc: 'Maximum output for businesses that want to own every search result in their category. 19,999 credits (399 SEO / 266 GEO blogs) monthly.',
        popular: false,
        planType: 'seo_geo',
        features: ['SEO Optimization', 'GEO Optimization', 'Internal Linking', 'AI Search Optimization', 'Brand Knowledge', 'AI Overview Optimization', 'Multi-Agent Research', 'Competitor Analysis', 'Content Audits', 'Priority Generation'],
        missing: [],
        cta: 'Buy Pro',
    },
];

// ─── Email Automation Plans (2026) ────────────────────────────────────────────
const emailPlans = [
    {
        name: 'Starter',
        priceINR: 999,
        credits: 500,
        capacity: '250 Emails',
        popular: false,
        planType: 'email',
        features: ['250 Emails/month', 'Basic templates', 'Email support'],
        missing: ['Sequences', 'A/B testing', 'Custom domain'],
        cta: 'Buy Starter',
    },
    {
        name: 'Growth',
        priceINR: 2999,
        credits: 2000,
        capacity: '1,000 Emails',
        popular: true,
        planType: 'email',
        features: ['1,000 Emails/month', 'Email sequences', 'A/B testing', 'Priority support'],
        missing: ['Custom domain', 'Agency volume'],
        cta: 'Buy Growth',
    },
    {
        name: 'Pro',
        priceINR: 7999,
        credits: 5000,
        capacity: '2,500 Emails',
        popular: false,
        planType: 'email',
        features: ['2,500 Emails/month', 'Email sequences', 'A/B testing', 'Custom domain', 'Priority support'],
        missing: ['Agency volume'],
        cta: 'Buy Pro',
    },
    {
        name: 'Agency',
        priceINR: 19999,
        credits: 15000,
        capacity: 'Custom',
        popular: false,
        planType: 'email',
        features: ['Custom volume', 'All Pro features', 'Dedicated manager', 'SLA guarantee'],
        missing: [],
        cta: 'Contact Sales',
        contactSales: true,
    },
];

// ─── Credit Consumption Reference ────────────────────────────────────────────
const creditConsumption = [
    { action: 'Keyword Research',       credits: 10 },
    { action: 'SEO Blog',               credits: 50 },
    { action: 'GEO Blog',               credits: 75 },
    { action: 'Premium SEO + GEO Blog', credits: 100 },
    { action: 'Content Audit',          credits: 15 },
    { action: 'Rewrite',                credits: 20 },
    { action: 'AI Search Optimization', credits: 15 },
    { action: 'Internal Linking',       credits: 10 },
];

// ─── Market Benchmarks ────────────────────────────────────────────────────────
const benchmarkSEO = [
    { segment: 'Local Freelancer',        monthly: '₹3,000 – ₹8,000' },
    { segment: 'Professional Freelancer', monthly: '₹5,000 – ₹25,000' },
    { segment: 'Small Agency',            monthly: '₹15,000 – ₹60,000' },
    { segment: 'Mid-Tier Agency',         monthly: '₹50,000 – ₹1,50,000' },
    { segment: 'Enterprise Agency',       monthly: '₹1,50,000 – ₹5,00,000+' },
];

// ─── Razorpay Checkout helper ─────────────────────────────────────────────────
async function initiateRazorpayCheckout({ session, plan, onSuccess, onError }) {
    if (!session) { onError('Please log in to purchase a plan.'); return; }
    try {
        const res = await fetch(`${API_BASE_URL}/api/razorpay/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ planType: plan.planType, planName: plan.name }),
        });
        const data = await res.json();
        if (!data.success) { onError(data.error); return; }

        const options = {
            key: data.keyId,
            amount: data.amount,
            currency: 'INR',
            name: 'Bitlance AI',
            description: `${plan.name} Plan — ${plan.credits?.toLocaleString()} credits`,
            order_id: data.orderId,
            handler: async (response) => {
                const verifyRes = await fetch(`${API_BASE_URL}/api/razorpay/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        planType: plan.planType,
                        planName: plan.name,
                    }),
                });
                const vData = await verifyRes.json();
                if (vData.success) onSuccess(vData);
                else onError(vData.error);
            },
            theme: { color: T },
        };

        if (!window.Razorpay) { onError('Razorpay SDK not loaded. Please refresh the page.'); return; }
        const rzp = new window.Razorpay(options);
        rzp.open();
    } catch (err) {
        onError(err.message);
    }
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, idx, onBuy, isBuying, disabled }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.07 }}
            whileHover={{ y: -5 }}
            className={`relative flex flex-col rounded-[24px] p-6 transition-all duration-300 border backdrop-blur-md
                ${plan.popular
                    ? 'bg-[#26cece]/10 border-[#26cece]/50'
                    : 'bg-black/20 border-white/10 hover:border-white/30'}`}
            style={{ boxShadow: plan.popular ? `0 0 40px 0 ${T}15` : 'none' }}
        >
            {plan.popular && (
                <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-sm whitespace-nowrap"
                    style={{ background: T, color: '#000', fontFamily: "'DM Mono',monospace" }}
                >
                    Most Popular
                </div>
            )}

            <h3 className="text-base font-extrabold text-white mb-1">{plan.name}</h3>
            {plan.desc && <p className="text-[11px] text-teal-100/60 mb-3">{plan.desc}</p>}

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-1">
                <span className="text-lg font-extrabold text-slate-400" style={{ fontFamily: "'DM Mono',monospace" }}>₹</span>
                <span className="text-4xl font-black text-white" style={{ fontFamily: "'DM Mono',monospace" }}>
                    {plan.priceINR?.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-400 text-xs">/mo</span>
            </div>

            {/* Badges */}
            <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-sm font-mono uppercase tracking-widest"
                    style={{ background: `${T}15`, color: T }}>
                    {plan.credits?.toLocaleString()} credits
                </span>
                {plan.seoBlogs && (
                    <span className="text-[10px] px-2 py-0.5 rounded-xl font-mono uppercase tracking-widest bg-white/[0.07] text-white/60">
                        {plan.seoBlogs} SEO · {plan.geoBlogs} GEO blogs
                    </span>
                )}
                {plan.capacity && (
                    <span className="text-[10px] px-2 py-0.5 rounded-xl font-mono uppercase tracking-widest bg-white/[0.07] text-white/60">
                        {plan.capacity}
                    </span>
                )}
            </div>

            <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <Check size={11} className="mt-0.5 flex-shrink-0" style={{ color: T }} />
                        <span className="text-xs text-teal-50/90">{f}</span>
                    </li>
                ))}
                {(plan.missing || []).map((f, i) => (
                    <li key={i} className="flex items-start gap-2 opacity-25">
                        <X size={11} className="mt-0.5 flex-shrink-0 text-gray-500" />
                        <span className="text-xs text-gray-500">{f}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={() => onBuy(plan)}
                disabled={isBuying || disabled}
                className={`w-full py-3 rounded-[12px] text-[11px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                    ${!plan.popular && !plan.contactSales ? 'bg-white/[0.07] text-white border-white/[0.12] hover:bg-white/[0.12]' : ''}`}
                style={plan.popular
                    ? { background: T, color: '#000' }
                    : plan.contactSales
                        ? { background: 'transparent', color: T, border: `1px solid ${T}50` }
                        : undefined}
            >
                {isBuying
                    ? <span className="animate-spin w-3 h-3 border-2 border-black/30 border-t-black rounded-full" />
                    : plan.contactSales ? <Phone size={11} /> : <ArrowRight size={11} />
                }
                {plan.contactSales ? 'Contact Sales' : plan.cta}
            </button>
        </motion.div>
    );
}

// ─── Credit Reference Table ───────────────────────────────────────────────────
function CreditTable({ open, onToggle }) {
    return (
        <div className="rounded-2xl overflow-hidden border border-white/10">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest
                    text-teal-50/90 bg-white/5 hover:bg-white/10 transition-colors"
            >
                <span>Credit Consumption Reference</span>
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                        <table className="w-full text-xs">
                            <thead>
                                <tr style={{ background: `${T}10` }}>
                                    <th className="px-4 py-2 text-left font-extrabold uppercase tracking-widest text-white">Action</th>
                                    <th className="px-4 py-2 text-right font-extrabold uppercase tracking-widest text-white">Credits</th>
                                </tr>
                            </thead>
                            <tbody>
                                {creditConsumption.map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.04]'}>
                                        <td className="px-4 py-2 font-mono text-teal-50/70">{row.action}</td>
                                        <td className="px-4 py-2 text-right font-extrabold font-mono" style={{ color: T }}>{row.credits}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Market Benchmark Table ───────────────────────────────────────────────────
function BenchmarkTable({ open, onToggle }) {
    return (
        <div className="rounded-2xl overflow-hidden border border-white/10">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-extrabold uppercase tracking-widest
                    text-teal-50/90 bg-white/5 hover:bg-white/10 transition-colors"
            >
                <span>Market Pricing Benchmark — SEO (Why Bitlance is 10× cheaper)</span>
                {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
                        <table className="w-full text-xs">
                            <thead>
                                <tr style={{ background: `${T}10` }}>
                                    <th className="px-4 py-2 text-left font-extrabold uppercase tracking-widest text-white">Segment</th>
                                    <th className="px-4 py-2 text-right font-extrabold uppercase tracking-widest text-white">Market Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {benchmarkSEO.map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.04]'}>
                                        <td className="px-4 py-2 font-mono text-teal-50/70">{row.segment}</td>
                                        <td className="px-4 py-2 text-right font-mono text-slate-400 line-through">{row.monthly}</td>
                                    </tr>
                                ))}
                                <tr className="border-t-2" style={{ borderColor: T }}>
                                    <td className="px-4 py-2 font-extrabold font-mono" style={{ color: T }}>Bitlance Starter</td>
                                    <td className="px-4 py-2 text-right font-extrabold font-mono" style={{ color: T }}>₹999/mo</td>
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const AgentPricingSection = () => {
    const { session } = useAuth();
    const [tab, setTab] = useState('seo_geo');       // 'seo_geo' | 'email'
    const [buyingPlan, setBuyingPlan] = useState(null); // "planName_planType" or null
    const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error', text: string }
    const [creditTableOpen, setCreditTableOpen] = useState(false);
    const [benchmarkOpen, setBenchmarkOpen] = useState(false);

    const plans = tab === 'seo_geo' ? seoGeoPlans : emailPlans;

    const handleBuy = async (plan) => {
        if (plan.contactSales) {
            window.location.href = '/contact';
            return;
        }
        setStatusMsg(null);

        if (!session) {
            setStatusMsg({ type: 'error', text: 'Please log in to purchase a plan.' });
            return;
        }

        // Lazily load Razorpay SDK
        if (!window.Razorpay) {
            try {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
                    document.body.appendChild(script);
                });
            } catch (err) {
                setStatusMsg({ type: 'error', text: err.message });
                return;
            }
        }

        const planKey = `${plan.name}_${plan.planType}`;
        setBuyingPlan(planKey);
        await initiateRazorpayCheckout({
            session,
            plan,
            onSuccess: (data) => {
                setBuyingPlan(null);
                setStatusMsg({
                    type: 'success',
                    text: `✅ Payment successful! ${data.creditsAdded?.toLocaleString()} credits added to your account.`,
                });
            },
            onError: (err) => {
                setBuyingPlan(null);
                setStatusMsg({ type: 'error', text: `❌ ${err}` });
            },
        });
    };

    return (
        <section className="pt-32 pb-24 bg-teal-900 relative overflow-hidden transition-colors duration-300" id="pricing">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
                <MeshGradient
                    speed={0.6}
                    colors={["#26CECE", "#1AA8A8", "#0d5c5c", "#178282"]}
                    distortion={0.8}
                    swirl={0.1}
                    grainMixer={0.15}
                    grainOverlay={0}
                    style={{ height: "100%", width: "100%" }}
                />
            </div>
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Heading */}
                <div className="mb-12 max-w-2xl">
                    <span className="text-slate-500 dark:text-slate-400"
                        style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                        Pricing
                    </span>
                    <h2
                        className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight text-white"
                        style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '-0.025em' }}
                    >
                        Agencies charge ₹2.5L-₹6L/month for this. <span style={{ color: T }}>You don't have to.</span>
                    </h2>
                    <div className="mt-5" style={{ width: 48, height: 2, background: T }} />
                    <p className="mt-5 text-teal-50/90 max-w-xl text-lg leading-relaxed">
                        Pick the plan that fits your output. Scale up when you're ready. No long-term lock-in.
                    </p>
                </div>

                {/* Tab Toggle */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.1]">
                        <button
                            onClick={() => setTab('seo_geo')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-all
                                ${tab !== 'seo_geo' ? 'bg-white/5 text-teal-50/90 hover:bg-white/10' : ''}`}
                            style={tab === 'seo_geo' ? { background: T, color: '#000' } : undefined}
                        >
                            <Zap size={13} /> SEO + GEO Plans
                        </button>
                        <button
                            onClick={() => setTab('email')}
                            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-all
                                ${tab !== 'email' ? 'bg-white/5 text-teal-50/90 hover:bg-white/10' : ''}`}
                            style={tab === 'email' ? { background: T, color: '#000' } : undefined}
                        >
                            <Mail size={13} /> Email Automation
                        </button>
                    </div>
                </div>

                {/* Context label */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={tab}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs mb-8 font-mono"
                        style={{ color: '#a5f3fc' }}
                    >
                        {tab === 'seo_geo' && '⚡ Credits-based platform — generate SEO & GEO blogs, audit content, rewrite, and more'}
                        {tab === 'email' && '📧 Email Automation — sequences, broadcasts, and AI-powered follow-ups'}
                    </motion.p>
                </AnimatePresence>

                {/* Plan Cards */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`grid grid-cols-1 ${tab === 'email' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-5 mb-8`}
                    >
                        {plans.map((plan, idx) => {
                            const planKey = `${plan.name}_${plan.planType}`;
                            return (
                                <PlanCard
                                    key={plan.name}
                                    plan={plan}
                                    idx={idx}
                                    onBuy={handleBuy}
                                    isBuying={buyingPlan === planKey}
                                    disabled={buyingPlan !== null && buyingPlan !== planKey}
                                />
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* Status message */}
                {statusMsg && (
                    <div className={`mb-6 px-4 py-3 rounded text-sm font-mono ${statusMsg.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                        {statusMsg.text}
                    </div>
                )}

                {/* Collapsible reference tables */}
                <div className="space-y-3 mt-4">
                    {tab === 'seo_geo' && (
                        <CreditTable open={creditTableOpen} onToggle={() => setCreditTableOpen(v => !v)} />
                    )}
                    <BenchmarkTable open={benchmarkOpen} onToggle={() => setBenchmarkOpen(v => !v)} />
                </div>

                {/* Footer note */}
                <p className="text-center text-xs mt-10" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono',monospace" }}>
                    30 day money back guarantee · No setup fees · Live in 72 hours
                </p>
            </div>
        </section>
    );
};

export default AgentPricingSection;
