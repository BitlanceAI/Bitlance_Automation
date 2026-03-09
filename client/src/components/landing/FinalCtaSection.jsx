import React from 'react';
import { MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const FinalCtaSection = ({ onOpenBooking }) => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600/5 -z-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-30"></div>
            <ScrollReveal className="max-w-4xl mx-auto px-6 text-center relative z-10">

                {/* Scarcity nudge — Scarcity/Urgency Heuristic */}
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold px-5 py-2 rounded-full mb-8">
                    <Clock size={14} />
                    We only onboard 8 new clients per month to ensure quality — <strong>3 spots left for March.</strong>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-8">
                    Do you want to see how many more deals you can close if your follow-ups run 100% on autopilot?
                </h2>

                {/* Loss Aversion reframe */}
                <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
                    Every lead that goes unanswered is revenue someone else is collecting. If we show you a live dashboard of your leads, follow-ups, and conversions in one screen — would 15 minutes be worth it?
                </p>

                {/* Risk Reversal — Regret Aversion */}
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium mb-8">
                    <ShieldCheck size={16} />
                    No commitment. Cancel anytime. If you don't see results in 30 days, we'll refund every cent.
                </div>

                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={onOpenBooking}
                        className="px-10 py-5 rounded-full bg-white text-indigo-900 font-bold text-xl hover:bg-indigo-50 transition-all shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto"
                    >
                        Claim My Free AI Audit
                    </button>
                    <a
                        href="https://wa.me/917030951331"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 flex items-center gap-2 font-medium transition-colors"
                    >
                        <MessageCircle size={20} /> Prefer WhatsApp? Click here to chat with the AI agent directly.
                    </a>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default FinalCtaSection;
