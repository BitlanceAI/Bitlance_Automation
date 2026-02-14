import React from 'react';
import { MessageCircle } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const FinalCtaSection = ({ onOpenBooking }) => {
    return (
        <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-30"></div>
            <ScrollReveal className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-8">Want to see your AI agent in action this week?</h2>
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                    Get a live demo tailored to your industry. We’ll show real conversations, workflows, and how quickly you can start capturing more leads without hiring more people.
                </p>
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={onOpenBooking}
                        className="px-10 py-5 rounded-full bg-white text-indigo-900 font-bold text-xl hover:bg-indigo-50 transition-all shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto"
                    >
                        Book My Demo Now
                    </button>
                    <button className="text-green-400 hover:text-green-300 flex items-center gap-2 font-medium transition-colors">
                        <MessageCircle size={20} /> Prefer WhatsApp? Click here to chat with the AI agent directly.
                    </button>
                </div>
            </ScrollReveal>
        </section>
    );
};

export default FinalCtaSection;
