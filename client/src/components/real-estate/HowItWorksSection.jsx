import React from 'react';
import { Settings, Users, DollarSign } from 'lucide-react';

const HowItWorksSection = () => {
    const steps = [
        {
            num: "01",
            title: "We Build Your System",
            desc: "Our team sets up your custom AI infrastructure, landing pages, and ad campaigns.",
            icon: <Settings size={28} />
        },
        {
            num: "02",
            title: "AI Attracts & Nurtures",
            desc: "The system launches ads, captures leads, and instantly engages them via SMS/Email.",
            icon: <Users size={28} />
        },
        {
            num: "03",
            title: "You Close More Deals",
            desc: "Wake up to booked appointments. Focus only on showing homes and signing contracts.",
            icon: <DollarSign size={28} />
        }
    ];

    return (
        <section className="py-24 bg-re-navy text-white relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-re-accent/10 via-re-navy to-re-navy opacity-50"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Three simple steps to transform your real estate business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-re-blue/20 via-re-blue to-re-blue/20 -z-10"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-re-navy flex items-center justify-center mb-8 relative z-10 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-re-blue to-re-accent opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <span className="text-re-blue group-hover:text-white transition-colors">{step.icon}</span>
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-re-accent flex items-center justify-center text-sm font-bold shadow-lg">
                                    {step.num}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                            <p className="text-slate-400 px-4 leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
