import React from 'react';
import { ArrowRight } from 'lucide-react';

const FinalCtaSection = ({ onBookDemo }) => {
    return (
        <section className="py-24 bg-gradient-to-br from-re-navy to-gray-900 text-white text-center relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-0 right-0 w-96 h-96 bg-re-blue rounded-full blur-[150px] opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-re-accent rounded-full blur-[150px] opacity-20"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">
                    Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-re-blue to-green-400">Dominate</span> Your Market?
                </h2>
                <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto">
                    Let AI handle the marketing, follow-ups, and scheduling while you focus on what you ensure best: closing deals.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <button
                        onClick={onBookDemo}
                        className="px-10 py-5 rounded-full bg-re-blue hover:bg-cyan-400 text-re-navy font-bold text-xl shadow-xl shadow-re-blue/20 hover:shadow-re-blue/40 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        Book a Demo <ArrowRight size={24} />
                    </button>
                    <button className="px-10 py-5 rounded-full bg-transparent border-2 border-slate-600 text-white font-bold text-xl hover:bg-white/5 hover:border-white transition-all">
                        View Pricing
                    </button>
                </div>

                <p className="mt-8 text-slate-500 text-sm">
                    No long-term contracts. 14-day money-back guarantee.
                </p>
            </div>
        </section>
    );
};

export default FinalCtaSection;
