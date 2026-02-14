import React from 'react';
import { Link } from 'react-router-dom';

const PricingSection = () => {
    return (
        <section className="py-24">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent plans</h2>
                    <p className="text-gray-600 dark:text-gray-400">Start small, prove the ROI, and scale as your conversations grow.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {[
                        { name: "Starter", desc: "Ideal for solo founders & small teams." },
                        { name: "Growth", desc: "For growing businesses handling daily enquiries." },
                        { name: "Enterprise", desc: "Custom workflows, SLAs, and priority support." }
                    ].map((plan, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 text-center hover:shadow-lg transition-all">
                            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">{plan.desc}</p>
                            <div className="h-1 w-12 bg-indigo-100 mx-auto rounded-full"></div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link to="/signup">
                        <button className="px-8 py-3 rounded-full border border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                            Get Full Pricing & ROI Breakdown
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
