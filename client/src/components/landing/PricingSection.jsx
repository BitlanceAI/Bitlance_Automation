import React from 'react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(false);

    return (
        <section className="py-24 bg-gray-50 dark:bg-slate-900" id="pricing">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple pricing, massive ROI</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                        Choose the plan that fits your growth stage.
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className={`text-sm font-semibold ${!isYearly ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="w-14 h-8 bg-indigo-600 rounded-full relative transition-colors duration-300 focus:outline-none"
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${isYearly ? 'left-7' : 'left-1'}`}></div>
                        </button>
                        <span className={`text-sm font-semibold ${isYearly ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>Yearly <span className="text-green-500 text-xs ml-1">(Save 20%)</span></span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            name: "Starter",
                            price: "99",
                            desc: "Perfect for small businesses just starting with automation.",
                            features: [
                                "1 AI Agent",
                                "Up to 500 conversations/mo",
                                "WhatsApp & Web Chat",
                                "Basic Lead Qualification",
                                "Email Support"
                            ],
                            notIncluded: ["CRM Integration", "Custom Workflows", "Priority Support"]
                        },
                        {
                            name: "Growth",
                            price: "249",
                            popular: true,
                            desc: "For scaling teams that need robust integrations and higher volume.",
                            features: [
                                "3 AI Agents",
                                "Up to 2,000 conversations/mo",
                                "All Channels (WhatsApp, FB, IG)",
                                "Advanced Lead Qualification",
                                "CRM Integration (HubSpot, Salesforce)",
                                "Calendar Booking"
                            ],
                            notIncluded: ["Dedicated Success Manager"]
                        },
                        {
                            name: "Business",
                            price: "499",
                            desc: "Full power automation for established businesses with high volume.",
                            features: [
                                "Unlimited AI Agents",
                                "Up to 10,000 conversations/mo",
                                "Custom Workflows & API Access",
                                "Priority Support (Slack)",
                                "Dedicated Success Manager",
                                "White-label Options"
                            ],
                            notIncluded: []
                        }
                    ].map((plan, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: plan.popular ? -15 : -10 }}
                            className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 border ${plan.popular ? 'border-indigo-500 shadow-xl ring-1 ring-indigo-500' : 'border-gray-200 dark:border-slate-700 shadow-sm'} flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 h-10">{plan.desc}</p>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-extrabold tracking-tight">$</span>
                                    <span className="text-5xl font-extrabold tracking-tight">{isYearly ? (parseInt(plan.price) * 0.8).toFixed(0) : plan.price}</span>
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">/mo</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                                    </li>
                                ))}
                                {plan.notIncluded.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 opacity-50">
                                        <X size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-500">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white'}`}>
                                Get Started
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
