import React from 'react';
import { Layout, Users, Zap, PenTool } from 'lucide-react';

const UseCasesSection = () => {
    return (
        <section className="py-24 bg-gray-50 dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for businesses that run on conversations</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Perfect if you get enquiries daily and can’t afford to miss them.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Real Estate & Property", desc: "Capture every site visit enquiry, instantly send project details, and auto‑schedule site visits.", icon: Layout },
                        { title: "Clinics & Local Services", desc: "Answer pricing and service questions, share offers, and confirm bookings without a receptionist.", icon: Users },
                        { title: "Agencies & SaaS", desc: "Pre-qualify leads from ads, demos, and websites, then send only sales‑ready prospects to your team.", icon: Zap },
                        { title: "Education & Coaching", desc: "Handle admissions queries, share brochures, and book counselling or discovery calls on autopilot.", icon: PenTool }
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg w-fit mb-6">
                                <card.icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-3">{card.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {card.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UseCasesSection;
