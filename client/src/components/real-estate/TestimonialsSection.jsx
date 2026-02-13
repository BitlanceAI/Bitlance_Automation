import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Real Estate Agent",
            quote: "I used to spend 4 hours a day on cold calls. Now I just check my calendar and show up to showings. My income doubled in 3 months.",
            result: "2X Income Growth",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
        },
        {
            name: "Michael Chen",
            role: "Broker Owner",
            quote: "The AI follow-up is better than any inside sales agent I've ever hired. It never forgets a lead and the conversion/response rate is insane.",
            result: "37% Higher Engagement",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
        },
        {
            name: "Jessica Williams",
            role: "Realtor",
            quote: "Integration was seamless. The leads started flowing in within 48 hours. I closed my first deal from this system in week two.",
            result: "2 Extra Closings/Mo",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Don't Just Take Our Word For It</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Join hundreds of agents already scaling with AI.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex gap-1 text-yellow-400 mb-6">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 italic leading-relaxed">
                                "{t.quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-re-blue/20" />
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">{t.name}</div>
                                    <div className="text-sm text-gray-500">{t.role}</div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                                <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold rounded-full">
                                    {t.result}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
