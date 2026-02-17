
import React from 'react';
import { MessageCircle } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const FinalCtaSection = ({ onOpenBooking }) => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-600/5 -z-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-30"></div>
            <ScrollReveal className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-8">Do you want to see how many more deals you can close if your follow-ups run 100% on autopilot?</h2>
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                    If we show you a live dashboard of your leads, follow-ups, and conversions in one screen, would 15 minutes be worth it?
                </p>
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={onOpenBooking}
                        className="px-10 py-5 rounded-full bg-white text-indigo-900 font-bold text-xl hover:bg-indigo-50 transition-all shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto"
                    >
                        Book My Demo Now
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
