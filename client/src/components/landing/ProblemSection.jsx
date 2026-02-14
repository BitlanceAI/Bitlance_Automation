import React from 'react';
import { Phone, MessageSquare, Share2, Users } from 'lucide-react';

const ProblemSection = () => {
    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-800/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Your team is busy. Your leads won’t wait.</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Every missed call, late reply, or slow follow‑up costs you leads, revenue, and reputation. Your prospects expect instant, clear answers on every channel.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: Phone, text: "Leads drop when no one answers outside office hours." },
                        { icon: MessageSquare, text: "Sales reps waste time on repetitive FAQs instead of hot leads." },
                        { icon: Share2, text: "Managing WhatsApp, calls, website chat, and socials feels chaotic." },
                        { icon: Users, text: "Hiring, training, and monitoring staff for basic queries is expensive." }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full mb-4">
                                <item.icon size={24} />
                            </div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
