import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const T = '#26CECE';

const plans = [
    {
        name: 'Starter',
        price: '99',
        perDay: '3.30',
        desc: 'Perfect for small businesses just starting with automation.',
        features: ['1 AI Agent', 'Up to 500 conversations/mo', 'WhatsApp & Web Chat', 'Basic Lead Qualification', 'Email Support'],
        missing: ['CRM Integration', 'Custom Workflows', 'Priority Support'],
    },
    {
        name: 'Growth',
        price: '249',
        perDay: '8',
        popular: true,
        desc: 'For scaling teams that need robust integrations and higher volume.',
        features: ['3 AI Agents', 'Up to 2,000 conversations/mo', 'All Channels (WhatsApp, FB, IG)', 'Advanced Lead Qualification', 'CRM Integration (HubSpot, Salesforce)', 'Calendar Booking'],
        missing: ['Dedicated Success Manager'],
    },
    {
        name: 'Agency / White-Label',
        price: '499',
        perDay: '16.60',
        desc: 'Full power automation for agencies and established enterprises.',
        features: ['Unlimited AI Agents', 'Up to 10,000 conversations/mo', 'Custom Workflows & API Access', 'Priority Support (Slack)', 'Dedicated Success Manager', 'White-label Options'],
        missing: [],
    },
];

const PricingSection = () => {
    const [yearly, setYearly] = useState(false);

    return (
        <section className="py-24 bg-[#070707]" id="pricing">
            <div className="max-w-7xl mx-auto px-6">

                {/* Heading — left-aligned editorial */}
                <div className="mb-16 max-w-2xl">
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.18em', color:'#555', textTransform:'uppercase' }}>
                        Pricing
                    </span>
                    <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white leading-tight"
                        style={{ fontFamily:"'Space Grotesk',sans-serif", letterSpacing:'-0.025em' }}>
                        Simple pricing,<br /><span style={{ color:T }}>massive ROI</span>
                    </h2>
                    <div className="mt-6" style={{ width:48, height:2, background:T }} />

                    {/* Anchor */}
                    <div className="mt-6 inline-flex flex-wrap items-center gap-2 px-4 py-2.5 text-xs rounded"
                        style={{ background:`${T}0D`, border:`1px solid ${T}25` }}>
                        <span style={{ color:T, fontFamily:"'DM Mono',monospace" }}>A typical agency charges</span>
                        <span className="line-through" style={{ color:'#555', fontFamily:"'DM Mono',monospace" }}>$3,000–$8,000/mo</span>
                        <span style={{ color:T, fontFamily:"'DM Mono',monospace" }}>for what you get below.</span>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-4 mt-8">
                        <span className="text-sm font-medium" style={{ color:!yearly?T:'#555' }}>Monthly</span>
                        <button onClick={() => setYearly(v=>!v)}
                            className="w-12 h-6 relative rounded-full transition-all" style={{ background:T }}>
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#070707] transition-transform duration-300 ${yearly?'translate-x-6':'translate-x-0.5'}`} />
                        </button>
                        <span className="text-sm font-medium" style={{ color:yearly?T:'#555' }}>
                            Yearly <span className="text-xs ml-1 text-green-400">(Save 20%)</span>
                        </span>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
                            transition={{ duration:0.45, delay:idx*0.08 }} viewport={{ once:true }}
                            whileHover={{ y:-6 }}
                            className="relative flex flex-col rounded p-7 transition-all duration-300"
                            style={{
                                background: plan.popular ? `${T}08` : '#0F0F0F',
                                border: `1px solid ${plan.popular ? T : '#1E1E1E'}`,
                                boxShadow: plan.popular ? `0 0 48px 0 ${T}12` : 'none',
                            }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-sm whitespace-nowrap"
                                    style={{ background:T, color:'#070707', fontFamily:"'DM Mono',monospace" }}>
                                    Most Popular — 68% of teams
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                                <p className="text-sm text-white/40 mb-6 min-h-[40px]">{plan.desc}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-white/50" style={{ fontFamily:"'DM Mono',monospace" }}>$</span>
                                    <span className="text-5xl font-extrabold text-white" style={{ fontFamily:"'DM Mono',monospace" }}>
                                        {yearly ? (parseInt(plan.price)*0.8).toFixed(0) : plan.price}
                                    </span>
                                    <span className="text-white/40 text-sm">/mo</span>
                                </div>
                                <p className="mt-1 text-xs" style={{ color:'#555', fontFamily:"'DM Mono',monospace" }}>
                                    = ${yearly ? (parseFloat(plan.perDay)*0.8).toFixed(2) : plan.perDay}/day
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((f,i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check size={13} className="mt-0.5 flex-shrink-0" style={{ color:T }} />
                                        <span className="text-sm text-white/70">{f}</span>
                                    </li>
                                ))}
                                {plan.missing.map((f,i) => (
                                    <li key={i} className="flex items-start gap-3 opacity-25">
                                        <X size={13} className="mt-0.5 flex-shrink-0 text-white/30" />
                                        <span className="text-sm text-white/40">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className="w-full py-3.5 rounded text-sm font-bold transition-all duration-200"
                                style={plan.popular
                                    ? { background:T, color:'#070707' }
                                    : { background:'#1A1A1A', color:'#EFEFEF', border:'1px solid #2A2A2A' }}
                                onMouseEnter={e => { if (!plan.popular) { e.currentTarget.style.borderColor=`${T}50`; e.currentTarget.style.color=T; } else { e.currentTarget.style.background='#35DFDF'; } }}
                                onMouseLeave={e => { if (!plan.popular) { e.currentTarget.style.borderColor='#2A2A2A'; e.currentTarget.style.color='#EFEFEF'; } else { e.currentTarget.style.background=T; } }}
                            >
                                {plan.popular ? 'Start Closing More Deals' : 'Get Started'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
