import React from 'react';

const HowItWorksSection = () => {
    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-12">Go live in 3 simple steps</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gray-200 dark:bg-slate-700 -z-10"></div>

                    {[
                        { step: 1, title: "Strategy & Script", desc: "We understand your business, FAQs, and ideal customers, then convert that into a conversational script and flows." },
                        { step: 2, title: "Setup & Integrations", desc: "We connect your AI agent to your number, website, or inbox and integrate with tools like CRM, calendar, and WhatsApp." },
                        { step: 3, title: "Launch & Optimize", desc: "You go live, we monitor real chats, and continuously improve responses and flows based on real data." }
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-indigo-500/30">
                                {item.step}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
