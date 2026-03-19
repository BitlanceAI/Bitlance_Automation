import React from 'react';
import { MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const FinalCtaSection = ({ onOpenBooking }) => {
    return (
        <section className="py-24 relative overflow-hidden bg-[#030303]">
            <ScrollReveal className="max-w-4xl mx-auto px-6 text-center relative z-10">


                <h2 className="text-3xl md:text-5xl font-black mb-6 text-white uppercase tracking-tighter leading-[1.2]">
                    Do you want to see how many more deals you can close if your follow-ups run <span className="text-indigo-500 font-black">100% on autopilot?</span>
                </h2>

                <p className="text-base text-white/60 mb-10 max-w-xl mx-auto font-medium leading-relaxed">
                    Every lead that goes unanswered is revenue someone else is collecting. If we show you a live dashboard of your leads, follow-ups, and conversions in one screen — would 15 minutes be worth it?
                </p>

                <div className="flex flex-col items-center gap-8">
                    <button
                        onClick={onOpenBooking}
                        className="audit-cta btn-primary px-12 py-5 rounded-full font-black text-xl transition-all shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto uppercase tracking-tighter"
                    >
                        Claim My Free AI Audit
                    </button>
                    
                    <div className="flex flex-col items-center gap-4">
                        <a
                            href="https://wa.me/917030951331"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors uppercase tracking-widest"
                        >
                            <MessageCircle size={16} /> Prefer WhatsApp? Chat with our AI agent
                        </a>
                        
                        <div className="flex items-center justify-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <ShieldCheck size={12} className="text-emerald-500/50" />
                            No commitment. Cancel anytime. 30-day money back guarantee.
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Subtle Minimalist Background Effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        </section>
    );
};

export default FinalCtaSection;
